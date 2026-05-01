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
            <div class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10 mb-4">
                <!-- Top Info: Avatar, Name, DOB -->
                <div class="flex items-center gap-4 mb-4">
                    <div class="relative group shrink-0">
                        <img alt="Guide Avatar" class="w-20 h-20 rounded-full object-cover shadow-md ring-2 ring-primary/10" src="${guide.avatar || 'https://via.placeholder.com/200?text=HDV'}"/>
                    </div>
                    <div class="flex-1 min-w-0">
                        <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 block">Chuyên gia đồng hành</span>
                        <h3 class="text-lg font-extrabold text-on-surface mb-0.5 truncate">${guide.full_name || 'Chưa cập nhật tên'}</h3>
                        <div class="flex items-center gap-1.5 text-on-surface-variant">
                            <span class="material-symbols-outlined text-[14px] text-amber-500">cake</span>
                            <span class="text-[11px] font-bold">${dob}</span>
                        </div>
                    </div>
                </div>

                <!-- Details Grid -->
                <div class="space-y-4 mt-6">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-[16px]">mail</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Email</p>
                            <p class="text-[13px] font-bold text-on-surface truncate" title="${guide.email || '--'}">${guide.email || '--'}</p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-[16px]">call</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">Số điện thoại</p>
                            <p class="text-[13px] font-bold text-on-surface truncate">${guide.phone || '--'}</p>
                        </div>
                    </div>

                    <div>
                        <p class="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-1">Tiểu sử</p>
                        <p class="text-[13px] text-on-surface font-medium leading-relaxed italic line-clamp-3">${guide.bio || 'Chuyên gia văn hóa & lịch sử địa phương.'}</p>
                    </div>

                    <div>
                        <p class="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-primary">translate</span> Ngôn ngữ thông thạo</p>
                        <div class="flex flex-wrap gap-1.5 text-xs font-bold text-on-surface">
                            ${languages.length > 0 ? languages.map(lang => `<span class="px-2 py-1 bg-surface border border-outline-variant/10 rounded-md shadow-sm">${lang}</span>`).join('') : '--'}
                        </div>
                    </div>

                    <div>
                        <p class="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-primary">verified</span> Lĩnh vực chuyên môn</p>
                        <div class="flex flex-wrap gap-1.5 text-xs font-bold text-on-surface">
                            ${fields.length > 0 ? fields.map(field => `<span class="px-2 py-1 bg-surface border border-outline-variant/10 rounded-md shadow-sm">${field}</span>`).join('') : '--'}
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
        currentDate.setDate(tourStartDate.getDate() + parseInt(displayDay) - 1);
        const formattedDate = currentDate.toLocaleDateString('vi-VN');

        html += `
            <div class="relative pl-[100px] mb-12 last:mb-0">
                <!-- Premium Day Badge -->
                <div class="absolute left-0 top-0 flex flex-col items-center w-20 cursor-pointer group/day" onclick="toggleDayActivities('${displayDay}')" title="Thu gọn/Mở rộng tất cả ngày ${displayDay}">
                    <div class="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary to-[#004b87] text-white shadow-xl shadow-primary/20 flex flex-col items-center justify-center ring-[8px] ring-surface z-10 transform group-hover/day:scale-110 transition-transform duration-300">
                        <span class="text-xs font-black uppercase tracking-[0.15em] opacity-90 mb-0.5">Ngày</span>
                        <span class="text-3xl font-black leading-none">${displayDay}</span>
                    </div>
                    <div class="mt-3 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/10 shadow-sm">
                        <span class="text-xs font-bold text-slate-700 whitespace-nowrap">${formattedDate}</span>
                    </div>
                </div>
                
                <!-- Activities List -->
                <div class="space-y-6 pt-2">
                    ${days[day].map(sche => {
                        const desc = sche.tour_sche_desc || 'Không có mô tả chi tiết.';
                        const isLongDesc = desc.split('\n').length > 5 || desc.length > 250;
                        const tempId = sche.tour_sche_id || Math.random().toString(36).substr(2, 9);
                        const imgUrls = sche.images ? sche.images.map(img => img.tour_sche_img_url) : [];

                        return `
                        <div class="relative bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group overflow-hidden review-day-${displayDay}-item">
                            <!-- Header Toggle -->
                            <div class="p-6 md:p-8 cursor-pointer flex items-center justify-between" onclick="toggleDetailActivity('${tempId}')">
                                <div class="flex flex-col md:flex-row md:items-center gap-4">
                                    <div class="px-4 py-2 bg-primary/10 text-primary text-sm font-black rounded-xl uppercase tracking-widest flex items-center gap-2 w-fit whitespace-nowrap shrink-0">
                                        <span class="material-symbols-outlined text-[18px]">schedule</span>
                                        ${sche.time_sche_start} ${sche.time_sche_end ? '- ' + sche.time_sche_end : ''}
                                    </div>
                                    <h4 class="text-xl font-extrabold text-slate-800 group-hover:text-primary transition-colors">${sche.tour_sche_name}</h4>
                                </div>
                                <span id="arrow-${tempId}" class="material-symbols-outlined text-slate-400 transition-transform duration-300">expand_more</span>
                            </div>

                            <!-- Collapsible Content -->
                            <div id="content-${tempId}" class="px-8 pb-8 space-y-6">
                                <div class="flex flex-col xl:flex-row gap-8">
                                    <div class="flex-1">
                                        <div class="relative">
                                            <p id="desc-${tempId}" class="text-base text-slate-600 font-medium leading-relaxed ${isLongDesc ? 'line-clamp-5' : ''}">
                                                ${desc.replace(/\n/g, '<br>')}
                                            </p>
                                            ${isLongDesc ? `
                                                <button onclick="toggleDescription('${tempId}', this)" class="mt-2 text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                                    <span>Xem thêm</span>
                                                    <span class="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                    
                                    ${imgUrls.length > 0 ? `
                                        <div class="w-full xl:w-64 shrink-0">
                                            <div class="grid grid-cols-2 gap-2 h-40">
                                                ${imgUrls.slice(0, 2).map((imgUrl, idx) => `
                                                    <div class="rounded-2xl overflow-hidden shadow-sm ${imgUrls.length === 1 ? 'col-span-2 h-40' : 'h-40'}">
                                                        <img src="${imgUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer" onclick="openImageModal(${JSON.stringify(imgUrls).replace(/"/g, "'")}, ${idx})">
                                                    </div>
                                                `).join('')}
                                            </div>
                                            ${imgUrls.length > 2 ? `<p class="text-xs text-right mt-2 font-bold text-slate-500">+ ${imgUrls.length - 2} ảnh khác</p>` : ''}
                                        </div>
                                    ` : ''}
                                </div>

                                <!-- Full Width Location -->
                                <div class="pt-6 border-t border-slate-100">
                                    <div class="flex items-start gap-3 p-4 bg-surface-container-low rounded-2xl text-slate-700 border border-slate-200/50">
                                        <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                                            <span class="material-symbols-outlined">location_on</span>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Địa điểm diễn ra</p>
                                            <p class="text-sm font-bold leading-relaxed">${sche.tour_sche_add || 'Chưa rõ địa điểm chi tiết'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
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

window.toggleDayActivities = function(day) {
    const items = document.querySelectorAll(`.review-day-${day}-item`);
    if (items.length === 0) return;

    // Determine if we should expand or collapse based on the first item
    const firstContent = items[0].querySelector('[id^="content-"]');
    const shouldCollapse = firstContent && !firstContent.classList.contains('hidden');

    items.forEach(item => {
        const content = item.querySelector('[id^="content-"]');
        const arrow = item.querySelector('[id^="arrow-"]');
        if (!content || !arrow) return;

        if (shouldCollapse) {
            content.classList.add('hidden');
            arrow.style.transform = 'rotate(-90deg)';
        } else {
            content.classList.remove('hidden');
            arrow.style.transform = 'rotate(0deg)';
        }
    });
};

window.toggleDetailActivity = function(id) {
    const content = document.getElementById(`content-${id}`);
    const arrow = document.getElementById(`arrow-${id}`);
    if (!content || !arrow) return;
    
    const isHidden = content.classList.contains('hidden');
    if (isHidden) {
        content.classList.remove('hidden');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('hidden');
        arrow.style.transform = 'rotate(-90deg)';
    }
};

window.toggleDescription = function(id, btn) {
    const desc = document.getElementById(`desc-${id}`);
    const span = btn.querySelector('span');
    const icon = btn.querySelector('.material-symbols-outlined');
    
    if (desc.classList.contains('line-clamp-5')) {
        desc.classList.remove('line-clamp-5');
        span.textContent = 'Thu gọn';
        icon.textContent = 'keyboard_arrow_up';
    } else {
        desc.classList.add('line-clamp-5');
        span.textContent = 'Xem thêm';
        icon.textContent = 'keyboard_arrow_down';
    }
};

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
