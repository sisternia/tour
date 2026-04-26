document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');

    if (!tourId) {
        alert('Không tìm thấy mã Tour!');
        window.history.back();
        return;
    }

    try {
        const response = await fetch(`/api/tours/view-tour/${tourId}`);
        const result = await response.json();
        if (result.success) {
            renderTourDetail(result.data);
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Error fetching tour detail:', error);
        alert('Lỗi kết nối máy chủ!');
    }
});

let detailMap = null;

function renderTourDetail(tour) {
    // Basic Info
    document.getElementById('detail-tour-name').textContent = tour.tour_name;
    document.getElementById('detail-tour-desc').textContent = tour.tour_desc || 'Không có mô tả.';
    document.getElementById('detail-tour-type').textContent = tour.tour_type;
    
    const statusBadge = document.getElementById('detail-status-badge');
    if (tour.tour_status === 'Bản nháp') {
        statusBadge.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm';
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Bản nháp`;
    } else {
        statusBadge.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm';
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Đã xuất bản`;
    }
    
    // Dates & Duration
    const startDate = new Date(tour.time.date_start).toLocaleDateString('vi-VN');
    const endDate = new Date(tour.time.date_end).toLocaleDateString('vi-VN');
    document.getElementById('detail-start-date').textContent = startDate;
    document.getElementById('detail-end-date').textContent = endDate;
    document.getElementById('detail-duration-text').textContent = `${tour.time.tour_duration} ngày ${tour.time.tour_duration > 1 ? tour.time.tour_duration - 1 : 0} đêm`;
    
    // Location
    document.getElementById('detail-location').textContent = tour.tour_add || 'Chưa đặt địa điểm khởi hành';

    // Pricing
    document.getElementById('detail-adult-price').textContent = (tour.price.price_adult || 0).toLocaleString('vi-VN');
    document.getElementById('detail-child-price').textContent = (tour.price.price_child || 0).toLocaleString('vi-VN');
    document.getElementById('detail-capacity').textContent = tour.price.tour_capacity || '0';

    // Images
    const coverImg = tour.images.find(img => img.img_is_cover);
    const coverElem = document.getElementById('detail-cover-image');
    const allTourImages = tour.images.map(img => img.tour_img_url);

    if (coverImg) {
        coverElem.src = coverImg.tour_img_url;
        coverElem.classList.add('cursor-pointer');
        coverElem.onclick = () => openImageModal(allTourImages, allTourImages.indexOf(coverImg.tour_img_url));
    } else if (tour.images.length > 0) {
        coverElem.src = tour.images[0].tour_img_url;
        coverElem.classList.add('cursor-pointer');
        coverElem.onclick = () => openImageModal(allTourImages, 0);
    }
    
    const subImgs = tour.images.filter(img => !img.img_is_cover);
    const subPreviewContainer = document.getElementById('detail-sub-previews');
    subPreviewContainer.innerHTML = subImgs.map((img, idx) => `
        <div class="aspect-square rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/10">
            <img src="${img.tour_img_url}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" onclick="openImageModal(${JSON.stringify(allTourImages).replace(/"/g, "'")}, ${allTourImages.indexOf(img.tour_img_url)})">
        </div>
    `).join('');

    // Guides
    const guideContainer = document.getElementById('detail-guide-container');
    if (tour.guides && tour.guides.length > 0) {
        guideContainer.innerHTML = tour.guides.map(guide => {
            const dob = guide.dob ? new Date(guide.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
            const languages = guide.languages && guide.languages.length > 0 ? guide.languages : [];
            const fields = guide.fields && guide.fields.length > 0 ? guide.fields : [];
            
            return `
            <div class="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
                <!-- Background Decoration -->
                <div class="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl z-0"></div>
                
                <div class="flex flex-col md:flex-row gap-8 relative z-10">
                    <!-- Avatar & Badge -->
                    <div class="flex flex-col items-center gap-3 shrink-0 w-40">
                        <div class="relative group mb-1">
                            <img alt="Guide Avatar" class="w-36 h-36 rounded-3xl object-cover shadow-lg ring-4 ring-primary/5 group-hover:ring-primary/20 transition-all duration-300" src="${guide.avatar || 'https://via.placeholder.com/200?text=HDV'}"/>
                            <div class="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5"></div>
                        </div>
                        <div class="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[14px]">stars</span>
                            Đồng hành
                        </div>
                        <div class="mt-1 flex flex-col items-center gap-1 text-center bg-surface-container-low px-4 py-2 rounded-2xl w-full border border-outline-variant/10 shadow-sm">
                            <span class="material-symbols-outlined text-amber-500 text-[18px]">cake</span>
                            <div>
                                <span class="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block mb-0.5">Ngày sinh</span>
                                <span class="text-xs font-black text-on-surface">${dob}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Guide Info -->
                    <div class="flex-1 min-w-0">
                        <h3 class="text-2xl font-extrabold text-on-surface mb-2">${guide.full_name || 'Chưa cập nhật tên'}</h3>
                        <p class="text-on-surface-variant font-medium text-sm mb-6 leading-relaxed italic">"${guide.bio || 'Chuyên gia văn hóa & lịch sử địa phương.'}"</p>
                        
                        <!-- Contact Info Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div class="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                                <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <span class="material-symbols-outlined text-[22px]">mail</span>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-0.5">Email</p>
                                    <p class="text-sm font-bold text-on-surface break-all" title="${guide.email || '--'}">${guide.email || '--'}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                                <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <span class="material-symbols-outlined text-[22px]">call</span>
                                </div>
                                <div class="min-w-0 flex-1">
                                    <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] mb-0.5">Điện thoại</p>
                                    <p class="text-sm font-bold text-on-surface break-all">${guide.phone || '--'}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Skills & Expertise -->
                        <div class="space-y-5">
                            ${languages.length > 0 ? `
                            <div>
                                <p class="text-xs font-extrabold text-on-surface mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                                    <span class="material-symbols-outlined text-[18px] text-primary">translate</span> Ngôn ngữ thông thạo
                                </p>
                                <div class="flex flex-wrap gap-2">
                                    ${languages.map(lang => `<span class="px-3.5 py-1.5 bg-surface text-on-surface border border-outline-variant/20 rounded-xl text-xs font-bold shadow-sm hover:border-primary/30 hover:text-primary transition-colors cursor-default">${lang}</span>`).join('')}
                                </div>
                            </div>
                            ` : ''}
                            
                            ${fields.length > 0 ? `
                            <div>
                                <p class="text-xs font-extrabold text-on-surface mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                                    <span class="material-symbols-outlined text-[18px] text-primary">verified</span> Lĩnh vực chuyên môn
                                </p>
                                <div class="flex flex-wrap gap-2">
                                    ${fields.map(field => `<span class="px-3.5 py-1.5 bg-surface text-on-surface border border-outline-variant/20 rounded-xl text-xs font-bold shadow-sm hover:border-primary/30 hover:text-primary transition-colors cursor-default">${field}</span>`).join('')}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    } else {
        guideContainer.innerHTML = `<div class="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10 italic text-on-surface-variant text-center">Chưa gán hướng dẫn viên cho tour này.</div>`;
    }

    // Map
    if (typeof L !== 'undefined' && tour.tour_latit && tour.tour_longit) {
        if (!detailMap) {
            detailMap = L.map('detail-map').setView([tour.tour_latit, tour.tour_longit], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(detailMap);
        }
        
        L.marker([tour.tour_latit, tour.tour_longit]).addTo(detailMap)
            .bindPopup(`<b>Điểm khởi hành:</b><br>${tour.tour_add}`).openPopup();

        // Add markers for activities
        if (tour.schedules) {
            const tourStartDate = new Date(tour.time.date_start);
            tour.schedules.forEach((sche, index) => {
                if (sche.tour_sche_latit && sche.tour_sche_longit) {
                    const dayNum = sche.day_number || 1;
                    
                    const currentDate = new Date(tourStartDate);
                    currentDate.setDate(tourStartDate.getDate() + dayNum - 1);
                    const formattedDate = currentDate.toLocaleDateString('vi-VN');
                    const timeRange = `${sche.time_sche_start} ${sche.time_sche_end ? '- ' + sche.time_sche_end : ''}`;

                    L.marker([sche.tour_sche_latit, sche.tour_sche_longit], {
                        icon: L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style='background-color:#0061A4; color:white; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3)'>${dayNum}</div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })
                    }).addTo(detailMap).bindPopup(`
                        <div style="font-family: 'Inter', sans-serif;">
                            <b style="font-size: 13px; color: #0061A4;">Ngày ${dayNum} (${formattedDate})</b><br>
                            <span style="font-size: 11px; font-weight: bold; color: #64748b;">${timeRange}</span><br>
                            <span style="font-size: 12px; font-weight: 600;">${sche.tour_sche_name}</span>
                        </div>
                    `);
                }
            });
        }
        
        // Auto-fit bounds if there are markers
        const markers = [];
        if (tour.tour_latit) markers.push([tour.tour_latit, tour.tour_longit]);
        tour.schedules?.forEach(s => { if(s.tour_sche_latit) markers.push([s.tour_sche_latit, s.tour_sche_longit]); });
        if (markers.length > 1) {
            detailMap.fitBounds(markers, { padding: [50, 50] });
        }
    }

    // Itinerary
    renderItinerary(tour.schedules, tour.time.date_start);
}

function renderItinerary(schedules, tourStartDateString) {
    const container = document.getElementById('detail-itinerary-flow');
    if (!schedules || schedules.length === 0) {
        container.innerHTML = `<p class="text-sm text-on-surface-variant italic">Chưa có lịch trình chi tiết.</p>`;
        return;
    }

    // Tối ưu hóa layout container
    container.className = "relative mt-4";

    // Group by day
    const days = {};
    schedules.forEach(s => {
        const d = s.day_number || 1;
        if (!days[d]) days[d] = [];
        days[d].push(s);
    });

    const tourStartDate = new Date(tourStartDateString);

    let html = '';
    Object.keys(days).sort((a,b) => a-b).forEach(day => {
        const displayDay = day === 'undefined' ? 1 : day;
        
        const currentDate = new Date(tourStartDate);
        currentDate.setDate(tourStartDate.getDate() + displayDay - 1);
        const formattedDate = currentDate.toLocaleDateString('vi-VN');

        html += `
            <div class="relative pl-[100px] mb-12 last:mb-0">
                <!-- Premium Day Badge -->
                <div class="absolute left-0 top-0 flex flex-col items-center w-20">
                    <div class="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary to-[#004b87] text-white shadow-xl shadow-primary/20 flex flex-col items-center justify-center ring-[8px] ring-surface z-10 transform hover:scale-105 transition-transform duration-300">
                        <span class="text-xs font-black uppercase tracking-[0.15em] opacity-90 mb-0.5">Ngày</span>
                        <span class="text-3xl font-black leading-none">${displayDay}</span>
                    </div>
                    <div class="mt-3 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/10 shadow-sm">
                        <span class="text-xs font-bold text-slate-700 whitespace-nowrap">${formattedDate}</span>
                    </div>
                </div>
                
                <!-- Activities List -->
                <div class="space-y-6 pt-2">
                    ${days[day].map(sche => `
                        <div class="relative bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
                            <div class="flex items-center gap-3 mb-5">
                                <div class="px-4 py-2 bg-primary/10 text-primary text-sm font-black rounded-xl uppercase tracking-widest flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">schedule</span>
                                    ${sche.time_sche_start} ${sche.time_sche_end ? '- ' + sche.time_sche_end : ''}
                                </div>
                            </div>
                            
                            <div class="flex flex-col xl:flex-row gap-8">
                                <div class="flex-1">
                                    <h4 class="text-2xl font-extrabold text-slate-800 group-hover:text-primary transition-colors mb-4">${sche.tour_sche_name}</h4>
                                    <p class="text-base text-slate-600 font-medium leading-relaxed mb-6">${sche.tour_sche_desc || 'Không có mô tả chi tiết.'}</p>
                                    <div class="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-xl text-primary border border-primary/5">
                                        <span class="material-symbols-outlined text-[20px]">location_on</span>
                                        <span class="text-sm font-bold">${sche.tour_sche_add || 'Chưa rõ địa điểm'}</span>
                                    </div>
                                </div>
                                
                                ${sche.images && sche.images.length > 0 ? `
                                    <div class="w-full xl:w-64 shrink-0 mt-6 xl:mt-0">
                                        <div class="grid grid-cols-2 gap-2 h-40">
                                            ${sche.images.slice(0, 2).map((img, idx) => `
                                                <div class="rounded-2xl overflow-hidden shadow-sm ${sche.images.length === 1 ? 'col-span-2 h-40' : 'h-40'}">
                                                    <img src="${img.tour_sche_img_url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer" onclick="openImageModal(${JSON.stringify(sche.images.map(i => i.tour_sche_img_url)).replace(/"/g, "'")}, ${idx})">
                                                </div>
                                            `).join('')}
                                        </div>
                                        ${sche.images.length > 2 ? `<p class="text-xs text-right mt-2 font-bold text-slate-500">+ ${sche.images.length - 2} ảnh khác</p>` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <!-- Vertical Timeline Line -->
        <div class="absolute left-[31px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-outline-variant/20 to-transparent z-0"></div>
        ${html}
    `;
}

// Image Modal Gallery State
let currentImages = [];
let currentImageIndex = 0;

function openImageModal(images, index = 0) {
    if (typeof images === 'string') images = [images];
    currentImages = images;
    currentImageIndex = index;
    
    const modal = document.getElementById('image-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; 
    
    updateModalContent();
}

function updateModalContent() {
    const modalImg = document.getElementById('modal-image');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');
    const counter = document.getElementById('modal-counter');
    
    // Reset animation
    modalImg.classList.add('scale-95');
    
    setTimeout(() => {
        modalImg.src = currentImages[currentImageIndex];
        
        // Update Counter
        if (currentImages.length > 1) {
            counter.textContent = `Ảnh ${currentImageIndex + 1} / ${currentImages.length}`;
            counter.classList.remove('hidden');
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
        } else {
            counter.classList.add('hidden');
            prevBtn.classList.add('hidden');
            nextBtn.classList.add('hidden');
        }
        
        modalImg.classList.remove('scale-95');
        modalImg.classList.add('scale-100');
    }, 50);
}

function nextImage() {
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateModalContent();
}

function prevImage() {
    if (currentImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateModalContent();
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    
    modalImg.classList.remove('scale-100');
    modalImg.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 200);
}

// Support Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (document.getElementById('image-modal').classList.contains('hidden')) return;
    
    if (e.key === 'Escape') closeImageModal();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
});
