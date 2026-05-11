/**
 * Groq AI Assistant for Tour Management
 */
class GroqAssistant {
    constructor() {
        this.toggleBtn = document.getElementById('ai-toggle-btn');
        this.closeBtn = document.getElementById('ai-close-btn');
        this.panel = document.getElementById('ai-panel');
        this.promptInput = document.getElementById('ai-prompt');
        this.sendBtn = document.getElementById('ai-send-btn');
        this.chatContent = document.getElementById('ai-chat-content');
        
        this.isOpen = false;
        this.isLoading = false;
        this.selectedLocation = ''; // Keep track of chosen country/city

        this.init();
    }

    init() {
        this.toggleBtn.addEventListener('click', () => this.togglePanel());
        this.closeBtn.addEventListener('click', () => this.togglePanel(false));
        this.sendBtn.addEventListener('click', () => this.handleSend());
        this.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
    }

    togglePanel(show) {
        this.isOpen = show !== undefined ? show : !this.isOpen;
        if (this.isOpen) {
            this.panel.classList.remove('hidden');
            setTimeout(() => {
                this.panel.classList.remove('scale-95', 'opacity-0');
                this.panel.classList.add('scale-100', 'opacity-100');
            }, 10);
        } else {
            this.panel.classList.remove('scale-100', 'opacity-100');
            this.panel.classList.add('scale-95', 'opacity-0');
            setTimeout(() => this.panel.classList.add('hidden'), 300);
        }
    }

    async handleSend(customPrompt = null, isSilent = false) {
        const prompt = customPrompt || this.promptInput.value.trim();
        if (!prompt || this.isLoading) return;

        // Get context from the page
        const tourType = document.getElementById('tour-type').value;
        const tourName = document.getElementById('tour-name').value;
        const tourAdd = document.getElementById('search-input').value;
        const duration = document.getElementById('duration-days').value;
        const tourLongit = document.getElementById('lng-display').textContent;
        const tourLatit = document.getElementById('lat-display').textContent;
        
        const contextPrompt = `
[BỐI CẢNH HIỆN TẠI
- Loại tour: ${tourType || 'Chưa chọn'}
- Tên tour: ${tourName || 'Chưa đặt'}
- Quốc gia / Thành phố đã chọn: ${this.selectedLocation || 'Chưa chọn'}
- Địa điểm cụ thể: ${tourAdd || 'Chưa xác định'}
- Kinh độ: ${tourLongit || ''}
- Vĩ độ: ${tourLatit || ''}
- Thời lượng: ${duration || 1} ngày
- Seed random: ${Date.now() + Math.random()}
]

[YÊU CẦU NGƯỜI DÙNG]
${prompt}

[QUY TẮC PHẢI TUÂN THỦ TUYỆT ĐỐI]

1. LUÔN trả về JSON nằm trong khối \`\`\`json

2. KHÔNG được trả text ngoài JSON.

3. CHỈ xử lý đúng bước hiện tại.
KHÔNG tự ý sinh thêm dữ liệu ngoài yêu cầu.

4. JSON phải đúng cấu trúc sau:

{
  "message": "",
  "step": "",
  "tour_type": "",
  "tour_name": "",
  "tour_desc": "",
  "tour_add": "",
  "tour_longit": "",
  "tour_latit": "",
  "image_keyword": "",
  "itinerary": [],
  "suggested_names": [],
  "suggestions": []
}

==================================================
QUY TRÌNH TẠO TOUR THEO TỪNG BƯỚC
==================================================

==================================================
BƯỚC 1 — CHỌN LOẠI TOUR
==================================================

Chỉ có đúng 2 lựa chọn:
- "Quốc tế"
- "Nội địa"

Nếu chưa chọn loại tour:
- Chỉ yêu cầu người dùng chọn loại tour.
- step = "select_tour_type"

QUY TẮC:
- Không tạo itinerary
- Không tạo mô tả
- Không tạo tên tour
- Không tạo địa điểm
- suggestions phải là:
["Quốc tế", "Nội địa"]

==================================================
BƯỚC 2 — CHỌN QUỐC GIA / THÀNH PHỐ
==================================================

Nếu tour_type = "Quốc tế":
- Hỏi người dùng muốn chọn quốc gia nào.
- suggestions phải random từ 5 đến 7 quốc gia.

Nếu tour_type = "Nội địa":
- Hỏi người dùng muốn chọn thành phố nào tại Việt Nam.
- suggestions phải random từ 5 đến 7 thành phố Việt Nam.

QUY TẮC:
- step = "select_location"
- suggestions bắt buộc có từ 5 đến 7 phần tử.
- Không ít hơn 5.
- Không nhiều hơn 7.
- Không tạo suggested_names.
- Không tạo itinerary.
- Không tạo tour_desc.

==================================================
BƯỚC 3 — GỢI Ý TÊN TOUR
==================================================

Khi người dùng đã chọn hoặc nhập:
- quốc gia
HOẶC
- thành phố

AI phải:
- Sinh từ 5 đến 7 tên tour phù hợp.

QUY TẮC:
- step = "generate_tour_name"
- suggested_names bắt buộc có từ 5 đến 7 phần tử.
- Tên phải tự nhiên, đa dạng, hấp dẫn.
- Có thể lấy cảm hứng từ địa điểm.
- Không tạo itinerary.
- Không tạo tour_desc.
- Không tạo suggestions.

==================================================
BƯỚC 4 — CHỌN ĐỊA ĐIỂM CHÍNH XÁC
==================================================

Sau khi người dùng chọn tour_name:
- AI phải xác định địa điểm chính xác phù hợp với:
  + tour_type
  + quốc gia/thành phố đã chọn
  + tên tour

QUY TẮC:
- step = "select_exact_location"
- tour_add phải là địa điểm thực tế có thể đọc được trên Leaflet/OpenStreetMap.
- tour_longit và tour_latit phải là tọa độ hợp lệ.
- Địa điểm phải đúng với quốc gia/thành phố đã chọn.
- Không tạo itinerary.
- Không tạo tour_desc.
- Không tạo suggested_names.

QUAN TRỌNG:
- Địa điểm phải đủ chính xác để hiển thị map bằng LeafletJS.
- Không dùng địa chỉ giả.
- Không dùng tọa độ fake.

==================================================
BƯỚC 5 — TẠO MÔ TẢ TOUR
==================================================

Khi người dùng bấm:
"Tạo mô tả tour"

AI phải:
- Dựa vào:
  + tour_name
  + tour_type
  + tour_add
  + duration

- Viết mô tả hấp dẫn, tự nhiên, rõ ràng.

QUY TẮC:
- step = "generate_tour_description"
- Chỉ tạo:
"tour_desc"

- Không tạo itinerary.
- Không tạo suggestions.
- Không tạo suggested_names.

==================================================
BƯỚC 6 — TẠO LỊCH TRÌNH TOUR
==================================================

Khi người dùng bấm:
"Tạo lịch trình tour"

AI phải:
- Sinh đầy đủ lịch trình theo duration.
- Mỗi ngày phải đủ hoạt động từ sáng tới tối.
- Nội dung phù hợp với địa điểm tour.

QUY TẮC THỜI GIAN:
- Bắt đầu: 09:00
- Kết thúc tối đa: 21:00
- Mỗi hoạt động kéo dài 2 giờ
- Sau mỗi hoạt động có 30 phút di chuyển
- Phải có:
  + ăn trưa
  + ăn tối
- Không được để trống timeline.
- Không được lặp hoạt động.

==================================================
CẤU TRÚC itinerary
==================================================

itinerary phải là ARRAY JSON.

Mỗi phần tử:

{
  "day": 1,
  "start_time": "09:00",
  "end_time": "11:00",
  "title": "",
  "description": "",
  "tour_sche_add": "",
  "tour_sche_longit": "",
  "tour_sche_latit": ""
}

==================================================
QUY TẮC ĐỊA ĐIỂM LỊCH TRÌNH
==================================================

Mỗi activity:
- tour_sche_add phải là địa điểm có thật.
- Phải đọc được bằng LeafletJS/OpenStreetMap.
- tour_sche_longit và tour_sche_latit phải đúng.
- Địa điểm phải phù hợp với:
  + quốc gia
  + thành phố
  + tour hiện tại

==================================================
QUY TẮC HIỂN THỊ LỊCH TRÌNH
==================================================

Lịch trình phải có thể render dạng bảng với các cột:

| Ngày | Giờ bắt đầu | Giờ kết thúc | Tên địa điểm |

==================================================
QUY TẮC RANDOM
==================================================

- Nội dung phải đa dạng.
- Không lặp lại danh sách cũ.
- Random theo seed hiện tại.
- Không dùng dữ liệu cố định.
- Không ghi chữ "Ví dụ".

==================================================
QUY TẮC NGHIÊM CẤM
==================================================

- Không tạo itinerary nếu chưa được yêu cầu.
- Không tạo mô tả nếu chưa được yêu cầu.
- Không tạo tên tour sai bước.
- Không trả dữ liệu ngoài JSON.
- Không trả markdown ngoài khối json.
- Không sinh dữ liệu rỗng.
- Không dùng địa điểm giả.
- Không dùng tọa độ giả.
`;

        if (!isSilent) this.addMessage(prompt, 'user');
        if (!customPrompt) this.promptInput.value = '';
        this.setLoading(true);

        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: contextPrompt })
            });

            const result = await response.json();
            if (result.success) {
                this.addMessage(result.data, 'ai');
            } else {
                this.addMessage('Có lỗi xảy ra: ' + result.message, 'error');
            }
        } catch (error) {
            this.addMessage('Không thể kết nối đến máy chủ.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(text, role) {
        const div = document.createElement('div');
        div.className = role === 'user' 
            ? 'user-message bg-primary/10 p-3 rounded-2xl rounded-tr-none border border-primary/10 text-sm text-slate-800 ml-8'
            : role === 'error'
            ? 'error-message bg-red-50 p-3 rounded-2xl rounded-tl-none border border-red-100 text-sm text-red-600 mr-8'
            : 'ai-message bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-sm text-slate-700 mr-8';
        
        let displayChatText = text;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)(?:\s*```|$)/i);
        
        if (jsonMatch) {
            try {
                let jsonString = jsonMatch[1].trim();
                let tourData;
                
                try {
                    tourData = JSON.parse(jsonString);
                } catch (parseError) {
                    // Resilient JSON parsing
                    const openBraces = (jsonString.match(/\{/g) || []).length;
                    const closeBraces = (jsonString.match(/\}/g) || []).length;
                    const openBrackets = (jsonString.match(/\[/g) || []).length;
                    const closeBrackets = (jsonString.match(/\]/g) || []).length;
                    jsonString += '}'.repeat(Math.max(0, openBraces - closeBraces));
                    jsonString += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
                    tourData = JSON.parse(jsonString);
                }

                displayChatText = tourData.message || (tourData.itinerary?.length > 0 ? 'Dưới đây là lịch trình hoàn chỉnh:' : 'Dưới đây là các gợi ý:');
                const formattedText = displayChatText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
                div.innerHTML = `<div class="mb-2">${formattedText}</div>`;

                // Handle Steps
                switch (tourData.step) {
                    case 'select_tour_type':
                        if (tourData.suggestions) {
                            const suggDiv = document.createElement('div');
                            suggDiv.className = 'mt-3 flex flex-wrap gap-2';
                            tourData.suggestions.forEach(type => {
                                suggDiv.appendChild(this.createActionButton(type, () => {
                                    if (window.setTourType) window.setTourType(type === 'Quốc tế' ? 'intl' : 'domestic');
                                    this.handleSend(`Tôi chọn tour **${type}**. Tiếp theo hãy gợi ý địa điểm.`);
                                }));
                            });
                            div.appendChild(suggDiv);
                        }
                        break;

                    case 'select_location':
                        if (tourData.suggestions) {
                            const suggDiv = document.createElement('div');
                            suggDiv.className = 'mt-3 flex flex-wrap gap-2';
                            tourData.suggestions.forEach(item => {
                                suggDiv.appendChild(this.createActionButton(item, () => {
                                    this.selectedLocation = item;
                                    this.handleSend(`Tôi chọn **${item}**. Hãy gợi ý 5-7 tên tour hấp dẫn.`);
                                }));
                            });
                            div.appendChild(suggDiv);
                        }
                        break;

                    case 'generate_tour_name':
                        if (tourData.suggested_names) {
                            const namesDiv = document.createElement('div');
                            namesDiv.className = 'mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-2';
                            tourData.suggested_names.forEach((name, i) => {
                                const btn = this.createActionButton(`${i+1}. ${name}`, () => {
                                    document.getElementById('tour-name').value = name;
                                    showNotification(`Đã chọn tên: ${name}`);
                                    this.handleSend(`Tôi đã chọn tên "**${name}**". Hãy xác định địa điểm chính xác và tọa độ.`);
                                });
                                btn.className = 'w-full text-left px-3 py-2 bg-white hover:border-primary/50 text-xs rounded-lg border border-slate-200 transition-all block text-slate-700 shadow-sm';
                                namesDiv.appendChild(btn);
                            });
                            div.appendChild(namesDiv);
                        }
                        break;

                    case 'select_exact_location':
                        if (tourData.tour_add && tourData.tour_longit && tourData.tour_latit) {
                            const applyMapBtn = this.createActionButton('Áp dụng địa điểm & Bản đồ', () => {
                                document.getElementById('search-input').value = tourData.tour_add;
                                if (window.setLocation) {
                                    window.setLocation(parseFloat(tourData.tour_latit), parseFloat(tourData.tour_longit));
                                }
                                showNotification('Đã cập nhật địa điểm và bản đồ!');
                                this.addMessage('Địa điểm đã được áp dụng. Tiếp theo bạn có muốn **Tạo mô tả tour** không?', 'ai_step_desc');
                            });
                            applyMapBtn.className = 'mt-3 w-full py-2 bg-primary text-white rounded-lg font-bold text-xs shadow-md';
                            div.appendChild(applyMapBtn);
                        }
                        break;

                    case 'generate_tour_description':
                        if (tourData.tour_desc) {
                            const descContainer = document.createElement('div');
                            descContainer.className = 'mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed italic';
                            descContainer.innerText = tourData.tour_desc;
                            div.appendChild(descContainer);

                            const applyDescBtn = this.createActionButton('Áp dụng mô tả này', () => {
                                document.getElementById('tour-desc').value = tourData.tour_desc;
                                showNotification('Đã áp dụng mô tả!');
                                this.addMessage('Mô tả đã được lưu. Bạn có muốn **Tạo lịch trình tour** ngay bây giờ?', 'ai_step_itin');
                            });
                            applyDescBtn.className = 'mt-2 w-full py-2 bg-primary text-white rounded-lg font-bold text-xs';
                            div.appendChild(applyDescBtn);
                        }
                        break;
                }

                // Handle Itinerary (Any step if present)
                if (tourData.itinerary && tourData.itinerary.length > 0) {
                    const itinPreview = document.createElement('div');
                    itinPreview.className = 'mt-3 space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100';
                    
                    const days = {};
                    tourData.itinerary.forEach(item => {
                        if (!days[item.day]) days[item.day] = [];
                        days[item.day].push(item);
                    });

                    Object.keys(days).forEach(dayNum => {
                        const dayDiv = document.createElement('div');
                        dayDiv.className = 'mb-2';
                        dayDiv.innerHTML = `<p class="text-[10px] font-bold text-primary uppercase">Ngày ${dayNum}:</p>`;
                        days[dayNum].forEach(act => {
                            const actDiv = document.createElement('div');
                            actDiv.className = 'pl-2 border-l border-slate-200 ml-1 py-1';
                            actDiv.innerHTML = `<p class="text-[11px] font-medium text-slate-700">${act.start_time} - ${act.title}</p>`;
                            dayDiv.appendChild(actDiv);
                        });
                        itinPreview.appendChild(dayDiv);
                    });
                    div.appendChild(itinPreview);

                    const applyBtn = this.createActionButton('Áp dụng Lịch trình & Hoàn tất', () => {
                        this.applyItinerary(tourData.itinerary);
                        this.togglePanel(false);
                    });
                    applyBtn.className = 'mt-3 w-full py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-xl shadow-primary/30 hover:scale-[1.02] transition-all uppercase';
                    div.appendChild(applyBtn);
                }

            } catch (e) {
                console.error('Failed to parse AI JSON:', e);
                div.innerHTML = `<div class="p-3 bg-amber-50 text-amber-700 rounded-lg text-xs border border-amber-100">AI phản hồi không đầy đủ hoặc lỗi. Vui lòng thử lại.</div>`;
            }
        } else if (role === 'ai_step_desc') {
            div.innerHTML = `<div class="mb-2">${text}</div>`;
            div.appendChild(this.createActionButton('Tạo mô tả tour', () => {
                this.handleSend('Hãy viết mô tả tour lôi cuốn cho tour này.');
            }));
        } else if (role === 'ai_step_itin') {
            div.innerHTML = `<div class="mb-2">${text}</div>`;
            div.appendChild(this.createActionButton('Tạo lịch trình tour', () => {
                this.handleSend('Hãy tạo lịch trình tour chi tiết lấp đầy từ 9 giờ sáng đến 9 giờ tối.');
            }));
        } else {
            div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        }

        this.chatContent.appendChild(div);
        this.chatContent.scrollTop = this.chatContent.scrollHeight;
    }

    createActionButton(label, onClick) {
        const btn = document.createElement('button');
        btn.className = 'text-[10px] px-2 py-1 bg-primary text-white rounded-md font-bold hover:bg-primary-container transition-all';
        btn.innerText = label;
        btn.onclick = onClick;
        return btn;
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.sendBtn.disabled = loading;
        if (loading) {
            this.sendBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">progress_activity</span>';
            const indicator = document.createElement('div');
            indicator.id = 'ai-loading-indicator';
            indicator.className = 'ai-message bg-white p-3 rounded-2xl border border-slate-100 text-sm text-slate-400 mr-8 italic';
            indicator.innerText = 'Đang xử lý...';
            this.chatContent.appendChild(indicator);
        } else {
            this.sendBtn.innerHTML = '<span class="material-symbols-outlined text-sm">send</span>';
            const indicator = document.getElementById('ai-loading-indicator');
            if (indicator) indicator.remove();
        }
        this.chatContent.scrollTop = this.chatContent.scrollHeight;
    }

    quickAction(type) {
        const actions = {
            'intl': 'Hãy bắt đầu BƯỚC 1: Đặt tour Quốc tế.',
            'domestic': 'Hãy bắt đầu BƯỚC 1: Đặt tour Nội địa.',
            'full': 'Tôi muốn tạo tour tự động trọn gói một lần.'
        };
        this.handleSend(actions[type]);
    }

    applyItinerary(itinerary) {
        if (!window.allSchedules || !window.generateTimeline) return;
        
        const maxDay = itinerary.reduce((max, item) => Math.max(max, item.day || 0), 0);
        const durationInput = document.getElementById('duration-days');
        durationInput.value = maxDay;
        durationInput.dispatchEvent(new Event('input'));

        window.allSchedules = itinerary.map((item, idx) => {
            const keyword = item.title || 'travel';
            return {
                tempId: 'ai_' + Math.random().toString(36).substr(2, 9),
                day_number: item.day || 1,
                tour_sche_name: item.title || 'Hoạt động',
                time_sche_start: item.start_time || '09:00',
                time_sche_end: item.end_time || '11:00',
                tour_sche_desc: item.description || '',
                tour_sche_add: item.tour_sche_add || '',
                tour_sche_longit: item.tour_sche_longit || '',
                tour_sche_latit: item.tour_sche_latit || '',
                images: [
                    `https://source.unsplash.com/featured/800x600?${encodeURIComponent(keyword)},travel&sig=${idx + Date.now() % 1000}`,
                    `https://source.unsplash.com/featured/800x600?${encodeURIComponent(keyword)},landmark&sig=${idx + 10}`
                ]
            };
        });

        window.generateTimeline();
        showNotification('Đã áp dụng lịch trình thành công!', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new GroqAssistant();
});
