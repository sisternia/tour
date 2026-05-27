require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Tour = require("../models/tours.model");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-embedding-2",
});

const buildTourEmbeddingContent = (tour) => `Tên tour: ${tour.tour_name}
Địa điểm: ${tour.tour_add}
Mô tả: ${tour.tour_desc || "Chưa có mô tả"}
Phân loại: ${tour.tour_type}
Trạng thái: ${tour.tour_status}`;

const embedTourById = async (tourId) => {
  const tour = await Tour.findOne({ tour_id: tourId });
  if (!tour) {
    throw new Error(`Không tìm thấy tour để embedding: ${tourId}`);
  }

  const content = buildTourEmbeddingContent(tour);
  const vector = await embeddings.embedQuery(content);
  tour.embedding = vector;
  await tour.save();
  return vector.length;
};

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-embedding-2",
});

const buildTourEmbeddingContent = (tour) => `Tên tour: ${tour.tour_name}
Địa điểm: ${tour.tour_add}
Mô tả: ${tour.tour_desc || 'Chưa có mô tả'}
Phân loại: ${tour.tour_type}
Trạng thái: ${tour.tour_status}`;

const embedTourById = async (tourId) => {
  const tour = await Tour.findOne({ tour_id: tourId });
  if (!tour) {
    throw new Error(`Không tìm thấy tour để embedding: ${tourId}`);
  }

  const content = buildTourEmbeddingContent(tour);
  const vector = await embeddings.embedQuery(content);
  tour.embedding = vector;
  await tour.save();
  return vector.length;
};

const embedAllTours = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    console.log("Fetching tours...");
    const tours = await Tour.find({});
    console.log(
      `Found ${tours.length} tours. Starting embedding generation...`,
    );

    for (let i = 0; i < tours.length; i++) {
      const tour = tours[i];
      console.log(`[${i + 1}/${tours.length}] Processing: ${tour.tour_name}`);

      const content = buildTourEmbeddingContent(tour);

      try {
        const vector = await embeddings.embedQuery(content);

        tour.embedding = vector;
        await tour.save();

        console.log(
          `Successfully embedded: ${tour.tour_name} (${vector.length} dimensions)`,
        );
      } catch (err) {
        console.error(`Error embedding tour ${tour.tour_name}:`, err.message);
      }
    }

    console.log("All tours processed successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  embedAllTours();
}

module.exports = {
  buildTourEmbeddingContent,
  embedTourById,
  embedAllTours,
};
