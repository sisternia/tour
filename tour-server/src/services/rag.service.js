const Tour = require('../models/tours.model');
const TourTime = require('../models/tour_times.model');
const TourSche = require('../models/tour_sches.model');
const TourPrice = require('../models/tour_prices.model');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const groqService = require('./groq.service');

// Initialize Gemini Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-embedding-001",
});

/**
 * Perform Vector Search in MongoDB Atlas
 * @param {string} queryText - User's question
 * @param {number} limit - Max number of tours to retrieve
 */
const retrieveRelevantTours = async (queryText, limit = 3) => {
  try {
    // 1. Convert user question into a vector
    const queryVector = await embeddings.embedQuery(queryText);

    // 2. Perform Vector Search using MongoDB Aggregate
    const results = await Tour.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 10,
          limit: limit
        }
      },
      {
        $project: {
          tour_id: 1,
          tour_name: 1,
          tour_desc: 1,
          tour_add: 1,
          tour_type: 1,
          score: { $meta: "searchScore" }
        }
      }
    ]);

    return results;
  } catch (error) {
    console.error("Vector Search Error:", error);
    return [];
  }
};

/**
 * Answer user questions using RAG (Vector Search + Groq LLM)
 * @param {string} userMessage - User's prompt
 * @param {Array} chatHistory - Previous messages for context
 */
const answerWithRAG = async (userMessage, chatHistory = []) => {
  try {
    // 1. Retrieve matching tours from DB
    const matchedTours = await retrieveRelevantTours(userMessage, 3);

    // 2. Format context
    let context = "";

    if (matchedTours.length > 0) {
      const tourDetailsPromises = matchedTours.map(async (t) => {

        // Query data
        const times = await TourTime.find({ tour_id: t.tour_id });
        const prices = await TourPrice.find({ tour_id: t.tour_id });
        const sches = await TourSche.find({ tour_id: t.tour_id }).sort({
          day_number: 1,
          time_sche_start: 1
        });

        // =========================
        // TIME INFO
        // =========================
        const timeInfo = times.map((time, index) => {
          const start = new Date(time.date_start).toLocaleDateString("vi-VN");
          const end = new Date(time.date_end).toLocaleDateString("vi-VN");

          return `
[ĐỢT KHỞI HÀNH ${index + 1}]
Ngày bắt đầu : ${start}
Ngày kết thúc: ${end}
Thời lượng   : ${time.tour_duration} ngày
`;
        }).join("\n");

        // =========================
        // PRICE TABLE
        // =========================
        const priceInfo = prices.map((p, index) => {
          return `
[BẢNG GIÁ ${index + 1}]
━━━━━━━━━━━━━━━━━━━━
Người lớn : ${Number(p.price_adult).toLocaleString("vi-VN")} VNĐ
Trẻ em    : ${Number(p.price_child).toLocaleString("vi-VN")} VNĐ
━━━━━━━━━━━━━━━━━━━━
`;
        }).join("\n");

        // =========================
        // SCHEDULE TABLE
        // =========================
        const scheByDay = {};

        sches.forEach((s) => {
          if (!scheByDay[s.day_number]) {
            scheByDay[s.day_number] = [];
          }
          scheByDay[s.day_number].push(s);
        });

        const scheInfo = Object.keys(scheByDay).map((day) => {
            let dayStr = `
━━━━━━━━━━━━━━━━━━━━
NGÀY ${day}
━━━━━━━━━━━━━━━━━━━━
`;

            scheByDay[day].forEach((s, index) => {
              const timeStr = s.time_sche_end
                ? `${s.time_sche_start} → ${s.time_sche_end}`
                : s.time_sche_start;

              const locationStr = s.tour_sche_add
                ? s.tour_sche_add
                : "Chưa cập nhật";

              dayStr += `
${index + 1}. ${s.tour_sche_name}

   Thời gian : ${timeStr}
   Địa điểm  : ${locationStr}

`;
            });

            return dayStr;
          }).join("\n");

        // =========================
        // FINAL TOUR FORMAT
        // =========================
        return `
========================================
${t.tour_name.toUpperCase()}
========================================

Phân loại      : ${t.tour_type}
Địa điểm chính : ${t.tour_add}

Mô tả:
${t.tour_desc || "Chưa có mô tả"}

${timeInfo ? `
THÔNG TIN KHỞI HÀNH
${timeInfo}
` : ""}

${priceInfo ? `
THÔNG TIN GIÁ TOUR
${priceInfo}
` : ""}

${scheInfo ? `
LỊCH TRÌNH CHI TIẾT
${scheInfo}
` : ""}
`;
      });

      const tourDetails = await Promise.all(tourDetailsPromises);

      context = tourDetails.join("\n\n");
    } else {
      context = "Không tìm thấy tour nào phù hợp trong cơ sở dữ liệu.";
    }

    // 3. Prepare Prompt
    const systemPrompt = `
Bạn là "TourMate AI" - trợ lý du lịch thông minh.

DỮ LIỆU TOUR:
${context}

QUY TẮC CỐT LÕI (TUYỆT ĐỐI TUÂN THỦ):
1. Không chào hỏi dài dòng (Không "Chào bạn", "Dạ"). Trả lời đúng trọng tâm.
2. Không dùng ký tự in đậm markdown (** hoặc |) vì di động không hiển thị được. Hãy ghi TÊN TOUR BẰNG CHỮ IN HOA.
3. PHÂN LOẠI CÂU HỎI:
   - Nếu khách hỏi Có/Không (Ví dụ: "Có tour đi Nhật không?"): CHỈ CẦN trả lời "Có", kèm TÊN TOUR và THỜI GIAN KHỞI HÀNH. TUYỆT ĐỐI KHÔNG liệt kê lịch trình chi tiết và giá vé.
   - Nếu khách YÊU CẦU TẠO/THIẾT KẾ TOUR MỚI (Ví dụ: "Tôi muốn tạo một tour khác"): TRẢ LỜI NGAY LẬP TỨC bằng cách hỏi lại: "Bạn muốn đến quốc gia/địa điểm nào và đi trong bao lâu?". TUYỆT ĐỐI KHÔNG từ chối hay nói "Không có thông tin".
   - CHỈ liệt kê Lịch trình và Giá khi khách chủ động yêu cầu xin thông tin chi tiết.
4. KHI THIẾT KẾ LỊCH TRÌNH MỚI: Nếu khách đã cung cấp nơi muốn đến, hãy tự do sáng tạo thiết kế một lịch trình thực tế.
   BẮT BUỘC TUÂN THỦ QUY TẮC THỜI GIAN SAU KHI TẠO LỊCH TRÌNH:
   - Sinh đầy đủ lịch trình theo số ngày (duration).
   - Mỗi ngày phải đủ hoạt động từ sáng tới tối.
   - Nội dung phù hợp với địa điểm tour.
   - Bắt đầu: 09:00, Kết thúc tối đa: 21:00.
   - Mỗi hoạt động kéo dài 2 giờ.
   - Sau mỗi hoạt động có 30 phút di chuyển.
   - Phải có ăn trưa và ăn tối.
   - Không được để trống timeline. Không được lặp hoạt động.
5. Khi hiển thị lịch trình phải theo format sau (sử dụng khung gạch ngang ━━━━━━━━━━━━━━━━━━━━):

━━━━━━━━━━━━━━━━━━━━
NGÀY X
━━━━━━━━━━━━━━━━━━━━

1. Tên hoạt động

   Thời gian : ...
   Địa điểm  : ...

6. Khi hiển thị giá phải theo format:

━━━━━━━━━━━━━━━━━━━━
Người lớn : ...
Trẻ em    : ...
━━━━━━━━━━━━━━━━━━━━
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...chatHistory,
      {
        role: "user",
        content: userMessage
      }
    ];

    // 4. Generate response using Groq
    const response = await groqService.generateChatCompletion(messages);
    return response;

  } catch (error) {
    console.error("RAG Service Error:", error);
    return "Xin lỗi, hệ thống đang gặp lỗi kỹ thuật.";
  }
};

module.exports = {
  retrieveRelevantTours,
  answerWithRAG
};
