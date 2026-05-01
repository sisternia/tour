document.addEventListener('DOMContentLoaded', function() {
    // --- Image Upload & Cover Selection Logic ---
    const imageInput = document.getElementById('tour-images-input');
    const previewGrid = document.getElementById('image-preview-grid');
    const coverIndexInput = document.getElementById('cover-image-index');
    let selectedFiles = [];

    // --- Schedule Images State ---
    const scheImageInput = document.getElementById('sche-images-input');
    const schePreviewGrid = document.getElementById('sche-image-preview-grid');
    const scheCoverIndexInput = document.getElementById('sche-cover-image-index');
    let scheSelectedFiles = [];
    let allSchedules = []; // To store all activities for submission
    let allGuides = []; // To store fetched guides
    let selectedGuideIds = []; // To store selected guide IDs
    let editingActivityId = null; // Track which activity is being edited
    let editingTourId = new URLSearchParams(window.location.search).get('id');

    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            // Add new files to our collection
            selectedFiles = [...selectedFiles, ...files];
            renderImagePreviews();
        });
    }

    function renderImagePreviews() {
        previewGrid.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const isCover = parseInt(coverIndexInput.value) === index;
            const renderDiv = (src) => {
                const div = document.createElement('div');
                div.className = `relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${isCover ? 'border-primary shadow-md' : 'border-outline-variant/10 hover:border-primary/50'}`;
                div.onclick = () => setCoverImage(index);
                
                div.innerHTML = `
                    <img src="${src}" class="w-full h-full object-cover">
                    ${isCover ? `
                        <div class="absolute top-1 right-1 bg-primary text-on-primary rounded-full p-0.5 shadow-sm">
                            <span class="material-symbols-outlined text-[12px] block">check</span>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 bg-primary/80 text-on-primary text-[8px] font-bold text-center py-0.5">ẢNH BÌA</div>
                    ` : ''}
                    <button type="button" onclick="event.stopPropagation(); removeImage(${index})" class="absolute top-1 left-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-error transition-colors">
                        <span class="material-symbols-outlined text-[12px] block">close</span>
                    </button>
                `;
                previewGrid.appendChild(div);
            };

            if (file instanceof File) {
                const reader = new FileReader();
                reader.onload = e => renderDiv(e.target.result);
                reader.readAsDataURL(file);
            } else {
                renderDiv(file.tour_img_url || file);
            }
        });

        if (selectedFiles.length === 0) {
            previewGrid.innerHTML = `
                <div class="aspect-square bg-surface-container rounded-lg flex items-center justify-center border border-outline-variant/10">
                    <span class="material-symbols-outlined text-outline-variant">image</span>
                </div>
                <div class="aspect-square bg-surface-container rounded-lg flex items-center justify-center border border-outline-variant/10">
                    <span class="material-symbols-outlined text-outline-variant">image</span>
                </div>
            `;
        }
    }

    window.setCoverImage = function(index) {
        coverIndexInput.value = index;
        renderImagePreviews();
    };

    window.removeImage = function(index) {
        selectedFiles.splice(index, 1);
        if (parseInt(coverIndexInput.value) === index) {
            coverIndexInput.value = 0;
        } else if (parseInt(coverIndexInput.value) > index) {
            coverIndexInput.value = parseInt(coverIndexInput.value) - 1;
        }
        renderImagePreviews();
    };

    // --- Schedule Image Logic ---
    if (scheImageInput) {
        scheImageInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            scheSelectedFiles = [...scheSelectedFiles, ...files];
            renderScheImagePreviews();
        });
    }

    function renderScheImagePreviews() {
        schePreviewGrid.innerHTML = '';
        scheSelectedFiles.forEach((file, index) => {
            const isCover = parseInt(scheCoverIndexInput.value) === index;
            const renderDiv = (src) => {
                const div = document.createElement('div');
                div.className = `relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${isCover ? 'border-primary shadow-md' : 'border-slate-200 hover:border-primary/50'}`;
                div.onclick = () => {
                    scheCoverIndexInput.value = index;
                    renderScheImagePreviews();
                };
                div.innerHTML = `
                    <img src="${src}" class="w-full h-full object-cover">
                    ${isCover ? `
                        <div class="absolute top-1 right-1 bg-primary text-on-primary rounded-full p-0.5 shadow-sm">
                            <span class="material-symbols-outlined text-[10px] block">check</span>
                        </div>
                    ` : ''}
                    <button type="button" onclick="event.stopPropagation(); removeScheImage(${index})" class="absolute top-0.5 left-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-error transition-colors">
                        <span class="material-symbols-outlined text-[10px] block">close</span>
                    </button>
                `;
                schePreviewGrid.appendChild(div);
            };

            if (file instanceof File) {
                const reader = new FileReader();
                reader.onload = e => renderDiv(e.target.result);
                reader.readAsDataURL(file);
            } else {
                renderDiv(file.tour_sche_img_url || file);
            }
        });
    }

    window.removeScheImage = function(index) {
        scheSelectedFiles.splice(index, 1);
        if (parseInt(scheCoverIndexInput.value) === index) {
            scheCoverIndexInput.value = 0;
        } else if (parseInt(scheCoverIndexInput.value) > index) {
            scheCoverIndexInput.value = parseInt(scheCoverIndexInput.value) - 1;
        }
        renderScheImagePreviews();
    };

    // --- Basic Info Data Collection ---
    window.getBasicInfo = function() {
        return {
            tour_name: document.getElementById('tour-name').value,
            tour_desc: document.getElementById('tour-desc').value,
            tour_type: document.getElementById('tour-type').value,
            tour_add: document.getElementById('search-input').value,
            tour_longit: document.getElementById('lng-display').textContent,
            tour_latit: document.getElementById('lat-display').textContent,
            tour_duration: document.getElementById('duration-days').value,
            price_adult: document.getElementById('price-adult').value,
            price_child: document.getElementById('price-child').value,
            tour_capacity: document.getElementById('tour-capacity').value,
            cover_index: coverIndexInput.value,
            images: selectedFiles
        };
    };

    // --- Submit Logic ---
    window.submitTour = async function() {
        const info = getBasicInfo();
        
        if (!info.tour_name || !info.tour_duration || !info.price_adult) {
            alert('Vui lòng điền đầy đủ thông tin cơ bản!');
            return;
        }

        // --- Prevent Double Submission ---
        const submitBtn = document.querySelector('button[onclick="submitTour()"]');
        if (submitBtn) {
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `
                Đang xử lý...
                <span class="material-symbols-outlined text-sm animate-spin">sync</span>
            `;
            submitBtn.dataset.originalContent = originalContent;
        }

        const formData = new FormData();
        formData.append('tour_name', info.tour_name);
        formData.append('tour_desc', info.tour_desc);
        formData.append('tour_type', info.tour_type);
        formData.append('tour_add', info.tour_add);
        formData.append('tour_longit', info.tour_longit);
        formData.append('tour_latit', info.tour_latit);
        formData.append('tour_duration', info.tour_duration);
        formData.append('price_adult', info.price_adult.replace(/[.,]/g, ''));
        formData.append('price_child', info.price_child.replace(/[.,]/g, ''));
        formData.append('tour_capacity', info.tour_capacity);
        formData.append('cover_index', info.cover_index);

        const existingTourImages = [];
        info.images.forEach(file => {
            if (file instanceof File) {
                formData.append('tour_imgs', file);
            } else {
                existingTourImages.push(file.tour_img_url || file);
            }
        });
        formData.append('existing_tour_images', JSON.stringify(existingTourImages));

        // Get selected guides
        const guides = Array.from(document.querySelectorAll('input[name="guide_select"]:checked'))
                                      .map(cb => cb.value);
        formData.append('guides', JSON.stringify(guides));

        formData.append('date_start', document.getElementById('start-date').value);
        formData.append('date_end', document.getElementById('end-date').value);
        const tourStatus = document.getElementById('tour-status-select') ? document.getElementById('tour-status-select').value : 'Bản nháp';
        formData.append('tour_status', tourStatus);
        
        // Prepare and append schedules
        const schedulesForSubmit = allSchedules.map((sche, index) => {
            const { images, ...scheData } = sche;
            const existingScheImages = [];
            
            if (images && Array.isArray(images)) {
                images.forEach(img => {
                    if (img instanceof File) {
                        formData.append(`sche_imgs_${index}`, img);
                    } else {
                        existingScheImages.push(img.tour_sche_img_url || img);
                    }
                });
            }
            return {
                ...scheData,
                existing_images: existingScheImages
            };
        });
        
        formData.append('schedules', JSON.stringify(schedulesForSubmit));

        const url = editingTourId ? `/api/tours/update-tour/${editingTourId}` : '/api/tours/create-tour';
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                const successMsg = editingTourId ? 'Sửa thành công!' : 'Thêm thành công!';
                showNotification(successMsg);
                setTimeout(() => {
                    window.location.href = 'tour_standard.html';
                }, 1000);
            } else {
                showNotification('Lỗi: ' + result.message, 'error');
                // Re-enable button on error
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = submitBtn.dataset.originalContent;
                }
            }
        } catch (error) {
            console.error('Error submitting tour:', error);
            showNotification('Lỗi kết nối máy chủ!', 'error');
            // Re-enable button on error
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.dataset.originalContent;
            }
        }
    }

    // --- Leaflet Map Logic ---
    const mapElement = document.getElementById('map');
    let map;
    if (mapElement && typeof L !== 'undefined') {
        map = L.map('map').setView([16.0544, 108.2022], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    let marker;
    const latDisplay = document.getElementById('lat-display');
    const lngDisplay = document.getElementById('lng-display');
    const searchInput = document.getElementById('search-input');

    function updateCoords(lat, lng) {
        latDisplay.textContent = lat.toFixed(6);
        lngDisplay.textContent = lng.toFixed(6);
    }

    async function updateAddress(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                searchInput.value = data.display_name;
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
    }

    function setLocation(lat, lng, zoom = 16) {
        if (!map || typeof L === 'undefined') return;
        const coords = [lat, lng];
        map.setView(coords, zoom);
        if (marker) {
            marker.setLatLng(coords);
        } else {
            marker = L.marker(coords).addTo(map);
        }
        updateCoords(lat, lng);
        updateAddress(lat, lng);
    }

    if (map) {
        map.on('click', function(e) {
            const { lat, lng } = e.latlng;
            if (marker) {
                marker.setLatLng(e.latlng);
            } else {
                marker = L.marker(e.latlng).addTo(map);
            }
            updateCoords(lat, lng);
            updateAddress(lat, lng);
        });
    }

    async function searchLocation() {
        const query = searchInput.value;
        if (!query) return;

        const searchBtn = document.getElementById('search-btn');
        const originalText = searchBtn.textContent;
        searchBtn.disabled = true;
        searchBtn.textContent = '...';

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setLocation(parseFloat(lat), parseFloat(lon));
            } else {
                showNotification('Không tìm thấy địa điểm này!', 'error');
            }
        } catch (error) {
            console.error('Search error:', error);
            showNotification('Lỗi khi tìm kiếm địa điểm!', 'error');
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = originalText;
        }
    }

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', searchLocation);
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchLocation();
            }
        });
    }

    const getLocationBtn = document.getElementById('get-location');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    setLocation(position.coords.latitude, position.coords.longitude);
                });
            }
        });
    }

    // --- Duration & Itinerary Automation ---
    const durationInput = document.getElementById('duration-days');
    const durationDisplay = document.getElementById('duration-display');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const durationInfo = document.getElementById('duration-info');
    const timelineContainer = document.getElementById('itinerary-timeline');

    function updateDuration() {
        const days = parseInt(durationInput.value) || 0;
        if (days <= 0) {
            durationDisplay.textContent = '---';
            return;
        }
        if (days === 1) {
            durationDisplay.textContent = '1 ngày (Trong ngày)';
        } else {
            const nights = days - 1;
            durationDisplay.textContent = `${days} ngày ${nights} đêm`;
        }
        calculateEndDate();
    }

    function calculateEndDate() {
        const days = parseInt(durationInput.value) || 0;
        if (!startDateInput.value || days <= 0) return;
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days - 1);
        endDateInput.value = endDate.toISOString().split('T')[0];
        const nights = days > 1 ? days - 1 : 0;
        durationInfo.textContent = days === 1 ? '1 ngày (Trong ngày)' : `${days} ngày ${nights} đêm`;
    }

    function generateTimeline() {
        const days = parseInt(durationInput.value) || 0;
        if (days <= 0) return;
        
        // Remove schedules for days that no longer exist
        allSchedules = allSchedules.filter(s => s.day_number <= days);

        timelineContainer.innerHTML = '';
        for (let i = 1; i <= days; i++) {
            const dayHtml = `
                <div class="flex gap-6 group">
                    <div class="flex flex-col items-center">
                        <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 border-4 border-surface ${i === 1 ? 'ring-2 ring-primary/20' : ''}">
                            <div class="w-2 h-2 rounded-full bg-on-primary"></div>
                        </div>
                        ${i < days ? '<div class="timeline-dashed flex-1"></div>' : ''}
                    </div>
                    <div class="flex-1 pb-10">
                        <div class="bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-outline-variant/5 hover:border-outline-variant/20">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <span class="text-[10px] font-black text-primary tracking-widest uppercase">Ngày ${i}</span>
                                    <h4 class="text-xl font-bold text-on-surface font-headline">Lịch trình ngày thứ ${i}</h4>
                                </div>
                            </div>
                            <div class="space-y-4" id="day-${i}-activities">
                                <p class="text-sm text-on-surface-variant italic">Chưa có hoạt động nào cho ngày này.</p>
                            </div>
                            <button onclick="openActivityModal(${i})" class="mt-6 w-full py-3 border-2 border-dashed border-outline-variant/30 rounded-xl text-on-surface-variant font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm bg-surface-container-low/30">
                                <span class="material-symbols-outlined text-lg">add</span>
                                Thêm hoạt động
                            </button>
                        </div>
                    </div>
                </div>
            `;
            timelineContainer.insertAdjacentHTML('beforeend', dayHtml);
        }

        // Render existing activities
        // Render existing activities with images
        allSchedules.forEach(sche => {
            const container = document.getElementById(`day-${sche.day_number}-activities`);
            if (container) {
                if (container.querySelector('.italic')) container.innerHTML = '';
                
                // If it has files, read them to show preview
                if (sche.images && sche.images.length > 0) {
                    const promises = sche.images.map(img => {
                        if (img instanceof File) {
                            return new Promise(resolve => {
                                const reader = new FileReader();
                                reader.onload = e => resolve(e.target.result);
                                reader.readAsDataURL(img);
                            });
                        }
                        return Promise.resolve(img.tour_sche_img_url || img);
                    });
                    
                    Promise.all(promises).then(urls => {
                        container.insertAdjacentHTML('beforeend', renderActivityItemHTML(sche, urls));
                    });
                } else {
                    container.insertAdjacentHTML('beforeend', renderActivityItemHTML(sche));
                }
            }
        });
    }

    function renderActivityItemHTML(sche, imgUrls = [], readOnly = false) {
        const timeDisplay = `${sche.time_sche_start || '--:--'} ${sche.time_sche_end ? '- ' + sche.time_sche_end : ''}`;
        return `
            <div class="relative bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group mb-4 last:mb-0" data-id="${sche.tempId}">
                <div class="flex items-center justify-between mb-3">
                    <div class="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black rounded-lg uppercase tracking-widest flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-[12px]">schedule</span>
                        ${timeDisplay}
                    </div>
                    ${!readOnly ? `
                        <div class="flex gap-1">
                            <button onclick="openEditActivityModal('${sche.tempId}')" class="p-1.5 text-outline-variant hover:text-primary transition-all">
                                <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onclick="removeActivity('${sche.tempId}', this)" class="p-1.5 text-outline-variant hover:text-error transition-all">
                                <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="flex flex-col xl:flex-row gap-5">
                    <div class="flex-1 min-w-0">
                        <h4 class="text-base font-extrabold text-on-surface group-hover:text-primary transition-colors mb-1 truncate">${sche.tour_sche_name}</h4>
                        <p class="text-[11px] text-on-surface-variant font-medium leading-relaxed mb-3 line-clamp-2">${sche.tour_sche_desc || 'Không có mô tả chi tiết.'}</p>
                        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low rounded-lg text-primary border border-primary/5">
                            <span class="material-symbols-outlined text-[14px]">location_on</span>
                            <span class="text-[9px] font-bold truncate max-w-[120px]">${sche.tour_sche_add || 'Chưa rõ địa điểm'}</span>
                        </div>
                    </div>
                    
                    ${imgUrls.length > 0 ? `
                        <div class="w-24 shrink-0">
                            <div class="grid grid-cols-2 gap-1 h-16">
                                ${imgUrls.slice(0, 2).map((url, idx) => `
                                    <div class="rounded-lg overflow-hidden shadow-sm ${imgUrls.length === 1 ? 'col-span-2 h-16' : 'h-16'}">
                                        <img src="${url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer" onclick="openImageModal(${JSON.stringify(imgUrls).replace(/"/g, "'")}, ${idx})">
                                    </div>
                                `).join('')}
                            </div>
                            ${imgUrls.length > 2 ? `<p class="text-[8px] text-right mt-1 font-bold text-on-surface-variant">+ ${imgUrls.length - 2}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    if (durationInput) durationInput.addEventListener('input', updateDuration);
    if (startDateInput) startDateInput.addEventListener('change', calculateEndDate);
    
    // Initialize defaults
    if (startDateInput && durationInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.value = today;
        updateDuration();
    }

    window.updateTourStatusBadge = function() {
        const selectElem = document.getElementById('tour-status-select');
        const dotElem = document.getElementById('tour-status-dot');
        if (!selectElem || !dotElem) return;
        
        const val = selectElem.value;
        
        // Base classes setup
        const baseClasses = "inline-flex items-center gap-2 pl-7 pr-8 py-2 rounded-full text-xs font-bold border shadow-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 transition-colors z-10 relative ";
        
        if (val === 'Bản nháp') {
            selectElem.className = baseClasses + "bg-amber-50 text-amber-700 border-amber-100";
            dotElem.className = "absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-500 animate-pulse pointer-events-none z-20";
        } else if (val === 'Đang hoạt động') {
            selectElem.className = baseClasses + "bg-emerald-50 text-emerald-700 border-emerald-100";
            dotElem.className = "absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse pointer-events-none z-20";
        } else if (val === 'Tạm dừng') {
            selectElem.className = baseClasses + "bg-rose-50 text-rose-700 border-rose-100";
            dotElem.className = "absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 animate-pulse pointer-events-none z-20";
        }
    };

    // --- Stepper Navigation ---
    window.goToStep = function(step) {
        const contents = ['step-1-content', 'step-2-content', 'step-3-content', 'step-4-content'];
        
        if (step === 2) {
            calculateEndDate();
            generateTimeline();
        }

        if (step === 3) {
            fetchGuides();
        }

        if (step === 4) {
            const info = getBasicInfo();
            document.getElementById('review-tour-name').textContent = info.tour_name || 'Tên Tour chưa đặt';
            document.getElementById('review-tour-desc').textContent = info.tour_desc || 'Chưa có mô tả chi tiết.';
            document.getElementById('review-tour-type').textContent = `Tour Cao cấp ${info.tour_type}`;
            document.getElementById('review-adult-price').textContent = info.price_adult || '0';
            document.getElementById('review-child-price').textContent = info.price_child || '0';
            document.getElementById('review-capacity').textContent = info.tour_capacity || '0';
            document.getElementById('review-duration-text').textContent = durationDisplay.textContent;
            document.getElementById('review-start-date').textContent = startDateInput.value ? new Date(startDateInput.value).toLocaleDateString('vi-VN') : '--/--/----';
            document.getElementById('review-end-date').textContent = endDateInput.value ? new Date(endDateInput.value).toLocaleDateString('vi-VN') : '--/--/----';
            document.getElementById('review-location').textContent = info.tour_add || 'Chưa xác định';
            
            // Cover and preview images
            if (info.images.length > 0) {
                const coverIdx = parseInt(info.cover_index) || 0;
                const coverImg = info.images[coverIdx];
                const coverElem = document.getElementById('review-cover-image');
                
                if (coverImg instanceof File) {
                    const reader = new FileReader();
                    reader.onload = e => coverElem.src = e.target.result;
                    reader.readAsDataURL(coverImg);
                } else {
                    coverElem.src = coverImg.tour_img_url || coverImg;
                }

                const subPreview = document.getElementById('review-sub-previews');
                if (subPreview) {
                    subPreview.innerHTML = '';
                    info.images.slice(0, 3).forEach((img, idx) => {
                        const d = document.createElement('div');
                        d.className = 'aspect-square rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/5';
                        const imgElem = document.createElement('img');
                        imgElem.className = 'w-full h-full object-cover';
                        
                        if (img instanceof File) {
                            const r = new FileReader();
                            r.onload = ev => imgElem.src = ev.target.result;
                            r.readAsDataURL(img);
                        } else {
                            imgElem.src = img.tour_img_url || img;
                        }
                        
                        d.appendChild(imgElem);
                        subPreview.appendChild(d);
                    });
                }
            }

            // Itinerary Summary (Full Detail Mode)
            const itineraryFlow = document.getElementById('review-itinerary-flow');
            if (itineraryFlow) {
                itineraryFlow.innerHTML = '';
                const totalDays = parseInt(durationInput.value) || 0;
                
                const renderAllReview = async () => {
                    const container = document.getElementById('review-itinerary-flow');
                    if (!container) return;

                    if (!allSchedules || allSchedules.length === 0) {
                        container.innerHTML = `<p class="text-sm text-on-surface-variant italic">Chưa có lịch trình chi tiết.</p>`;
                        return;
                    }

                    container.className = "relative mt-4";
                    const days = {};
                    allSchedules.forEach(s => {
                        const d = s.day_number || 1;
                        if (!days[d]) days[d] = [];
                        days[d].push(s);
                    });

                    const tourStartDate = startDateInput.value ? new Date(startDateInput.value) : new Date();

                    let html = '';
                    const dayKeys = Object.keys(days).sort((a,b) => a-b);
                    for (const day of dayKeys) {
                        const displayDay = day === 'undefined' ? 1 : parseInt(day);
                        const currentDate = new Date(tourStartDate);
                        currentDate.setDate(tourStartDate.getDate() + displayDay - 1);
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
                        `;

                        for (const sche of days[day]) {
                            let imgUrls = [];
                            if (sche.images && sche.images.length > 0) {
                                imgUrls = await Promise.all(sche.images.map(img => {
                                    if (img instanceof File) {
                                        return new Promise(r => { const reader = new FileReader(); reader.onload = e => r(e.target.result); reader.readAsDataURL(img); });
                                    }
                                    return Promise.resolve(img.tour_sche_img_url || img);
                                }));
                            }

                            const desc = sche.tour_sche_desc || 'Không có mô tả chi tiết.';
                            const isLongDesc = desc.split('\n').length > 5 || desc.length > 250;

                            html += `
                                <div class="relative bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group overflow-hidden review-day-${displayDay}-item">
                                    <!-- Header Toggle -->
                                    <div class="p-6 md:p-8 cursor-pointer flex items-center justify-between" onclick="toggleReviewActivity('${sche.tempId}')">
                                        <div class="flex flex-col md:flex-row md:items-center gap-4">
                                            <div class="px-4 py-2 bg-primary/10 text-primary text-sm font-black rounded-xl uppercase tracking-widest flex items-center gap-2 w-fit whitespace-nowrap shrink-0">
                                                <span class="material-symbols-outlined text-[18px]">schedule</span>
                                                ${sche.time_sche_start} ${sche.time_sche_end ? '- ' + sche.time_sche_end : ''}
                                            </div>
                                            <h4 class="text-xl font-extrabold text-slate-800 group-hover:text-primary transition-colors">${sche.tour_sche_name}</h4>
                                        </div>
                                        <span id="arrow-${sche.tempId}" class="material-symbols-outlined text-slate-400 transition-transform duration-300">expand_more</span>
                                    </div>

                                    <!-- Collapsible Content -->
                                    <div id="content-${sche.tempId}" class="px-8 pb-8 space-y-6">
                                        <div class="flex flex-col xl:flex-row gap-8">
                                            <div class="flex-1">
                                                <div class="relative">
                                                    <p id="desc-${sche.tempId}" class="text-base text-slate-600 font-medium leading-relaxed ${isLongDesc ? 'line-clamp-5' : ''}">
                                                        ${desc.replace(/\n/g, '<br>')}
                                                    </p>
                                                    ${isLongDesc ? `
                                                        <button onclick="toggleDescription('${sche.tempId}', this)" class="mt-2 text-sm font-bold text-primary hover:underline flex items-center gap-1">
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
                        }

                        html += `
                                </div>
                            </div>
                        `;
                    }

                    container.innerHTML = `
                        <!-- Vertical Timeline Line -->
                        <div class="absolute left-[31px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-outline-variant/20 to-transparent z-0"></div>
                        ${html}
                    `;
                };

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

                window.toggleReviewActivity = function(id) {
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
                renderAllReview();
            }

            // Guide Info
            const guideContainer = document.getElementById('review-guide-container');
            if (guideContainer) {
                if (selectedGuideIds.length > 0) {
                    guideContainer.innerHTML = selectedGuideIds.map(guideId => {
                        const guide = allGuides.find(g => g.user_id === guideId);
                        if (!guide) return '';
                        
                        const dob = guide.dob ? new Date(guide.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
                        const languages = guide.languages && guide.languages.length > 0 ? guide.languages : [];
                        const fields = guide.fields && guide.fields.length > 0 ? guide.fields : [];
                        
                        return `
                        <div class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10">
                            <!-- Top Info: Avatar, Name, DOB -->
                            <div class="flex items-center gap-4 mb-4">
                                <div class="relative group shrink-0">
                                    <img alt="Guide Avatar" class="w-20 h-20 rounded-full object-cover shadow-md ring-2 ring-primary/10" src="${guide.avatar || 'https://via.placeholder.com/200?text=HDV'}"/>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 block">Hướng dẫn viên</span>
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
                    guideContainer.innerHTML = `
                    <div class="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10 text-center">
                        <p class="text-on-surface-variant text-sm font-medium italic">Chưa chọn Hướng dẫn viên nào cho Tour này.</p>
                    </div>`;
                }
            }

            initReviewMap(parseFloat(info.tour_latit), parseFloat(info.tour_longit));
        }

        contents.forEach((id, idx) => {
            document.getElementById(id).classList.toggle('hidden', idx + 1 !== step);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update Stepper UI
        document.querySelectorAll('.step-indicator').forEach(indicator => {
            const s = parseInt(indicator.getAttribute('data-step'));
            const icon = indicator.querySelector('.step-icon');
            const label = indicator.querySelector('.step-label');
            if (s < step) {
                icon.innerHTML = '<span class="material-symbols-outlined">check</span>';
                icon.className = 'step-icon w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold';
                label.className = 'step-label text-xs font-bold text-primary';
            } else if (s === step) {
                icon.innerHTML = s;
                icon.className = 'step-icon w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-lg shadow-primary/20';
                label.className = 'step-label text-xs font-bold text-primary';
            } else {
                icon.innerHTML = s;
                icon.className = 'step-icon w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold';
                label.className = 'step-label text-xs font-medium text-on-surface-variant';
            }
        });

        document.querySelectorAll('.stepper-line').forEach(line => {
            const l = parseInt(line.getAttribute('data-line'));
            line.classList.toggle('bg-primary', l < step);
            line.classList.toggle('bg-surface-container-highest', l >= step);
        });
    };

    // --- Guides Assignment Logic ---
    const guidesListContainer = document.getElementById('guides-list-container');

    async function fetchGuides() {
        if (allGuides.length > 0) {
            renderGuides();
            return;
        }
        try {
            const response = await fetch('/api/guides/get-guides');
            const result = await response.json();
            if (result.success) {
                allGuides = result.data;
                renderGuides();
            }
        } catch (error) {
            console.error('Error fetching guides:', error);
            guidesListContainer.innerHTML = `<p class="col-span-full text-center text-error font-bold">Lỗi khi tải danh sách hướng dẫn viên!</p>`;
        }
    }

    function renderGuides() {
        guidesListContainer.innerHTML = '';
        if (allGuides.length === 0) {
            guidesListContainer.innerHTML = `<p class="col-span-full text-center text-on-surface-variant italic">Không có hướng dẫn viên nào khả dụng.</p>`;
            return;
        }

        allGuides.forEach(guide => {
            const isSelected = selectedGuideIds.includes(guide.user_id);
            const card = document.createElement('div');
            card.className = `group relative bg-surface-container-lowest p-6 rounded-xl transition-all cursor-pointer border-2 ${isSelected ? 'border-primary shadow-xl shadow-primary/10' : 'border-outline-variant/10 hover:border-primary/30'}`;
            
            const dobStr = guide.dob ? new Date(guide.dob).toLocaleDateString('vi-VN') : '--/--/----';
            const langs = guide.languages && guide.languages.length > 0 ? guide.languages : [];
            const fields = guide.fields && guide.fields.length > 0 ? guide.fields : [];

            card.innerHTML = `
                <!-- Top Info: Avatar, Name, DOB -->
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-4">
                        <img alt="${guide.full_name}" class="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-primary/10" src="${guide.avatar || 'https://via.placeholder.com/200?text=HDV'}"/>
                        <div class="flex-1 min-w-0">
                            <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 block">Hướng dẫn viên</span>
                            <h3 class="text-lg font-extrabold text-on-surface mb-0.5 truncate">${guide.full_name}</h3>
                            <div class="flex items-center gap-1.5 text-on-surface-variant">
                                <span class="material-symbols-outlined text-[14px] text-amber-500">cake</span>
                                <span class="text-[11px] font-bold">${dobStr}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Details Grid -->
                <div class="space-y-4 mb-6">
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
                        <p class="text-[13px] text-on-surface font-medium leading-relaxed italic line-clamp-3">${guide.bio || 'Chuyên gia dẫn đoàn'}</p>
                    </div>

                    <div>
                        <p class="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-primary">translate</span> Ngôn ngữ thông thạo</p>
                        <div class="flex flex-wrap gap-1.5 text-xs font-bold text-on-surface">
                            ${langs.length > 0 ? langs.map(lang => `<span class="px-2 py-1 bg-surface border border-outline-variant/10 rounded-md shadow-sm">${lang}</span>`).join('') : '--'}
                        </div>
                    </div>

                    <div>
                        <p class="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-primary">verified</span> Lĩnh vực chuyên môn</p>
                        <div class="flex flex-wrap gap-1.5 text-xs font-bold text-on-surface">
                            ${fields.length > 0 ? fields.map(field => `<span class="px-2 py-1 bg-surface border border-outline-variant/10 rounded-md shadow-sm">${field}</span>`).join('') : '--'}
                        </div>
                    </div>
                </div>

                <label class="flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all mt-auto ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/20 group-hover:border-primary/40'}">
                    <span class="text-xs font-bold ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}">${isSelected ? 'Đã chọn' : 'Chọn làm dẫn đoàn'}</span>
                    <input class="w-4 h-4 text-primary focus:ring-primary border-outline-variant" name="guide_select" type="checkbox" value="${guide.user_id}" ${isSelected ? 'checked' : ''}/>
                </label>
            `;
            
            // Handle visual state of selection
            const checkbox = card.querySelector('input');
            const label = card.querySelector('label');
            const labelText = card.querySelector('label span');
            
            checkbox.onchange = () => {
                const isChecked = checkbox.checked;
                if (isChecked) {
                    if (!selectedGuideIds.includes(guide.user_id)) selectedGuideIds.push(guide.user_id);
                } else {
                    selectedGuideIds = selectedGuideIds.filter(id => id !== guide.user_id);
                }

                card.classList.toggle('border-primary', isChecked);
                card.classList.toggle('border-outline-variant/10', !isChecked);
                card.classList.toggle('shadow-xl', isChecked);
                card.classList.toggle('shadow-primary/10', isChecked);
                label.classList.toggle('border-primary', isChecked);
                label.classList.toggle('border-outline-variant/20', !isChecked);
                label.classList.toggle('bg-primary/5', isChecked);
                labelText.classList.toggle('text-primary', isChecked);
                labelText.classList.toggle('text-on-surface', !isChecked);
                labelText.textContent = isChecked ? 'Đã chọn' : 'Chọn làm dẫn đoàn';
            };

            guidesListContainer.appendChild(card);
        });
    }

    // --- Review Map ---
    let reviewMap;
    function initReviewMap(lat, lng) {
        if (typeof L === 'undefined') return;
        if (!reviewMap) {
            const reviewMapElem = document.getElementById('review-map');
            if (!reviewMapElem) return;
            reviewMap = L.map('review-map', { zoomControl: true, attributionControl: false }).setView([lat, lng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(reviewMap);
        } else {
            reviewMap.setView([lat, lng], 13);
            reviewMap.eachLayer((layer) => { if (layer instanceof L.Marker) reviewMap.removeLayer(layer); });
        }
        
        const tourStartDate = startDateInput.value ? new Date(startDateInput.value) : new Date();
        const markers = [];
        
        if (lat && lng) {
            L.marker([lat, lng]).addTo(reviewMap).bindPopup(`<b>Điểm khởi hành</b>`).openPopup();
            markers.push([lat, lng]);
        }

        if (allSchedules && allSchedules.length > 0) {
            allSchedules.forEach((sche) => {
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
                    }).addTo(reviewMap).bindPopup(`
                        <div style="font-family: 'Inter', sans-serif;">
                            <b style="font-size: 13px; color: #0061A4;">Ngày ${dayNum} (${formattedDate})</b><br>
                            <span style="font-size: 11px; font-weight: bold; color: #64748b;">${timeRange}</span><br>
                            <span style="font-size: 12px; font-weight: 600;">${sche.tour_sche_name}</span>
                        </div>
                    `);
                    markers.push([sche.tour_sche_latit, sche.tour_sche_longit]);
                }
            });
        }
        
        if (markers.length > 1) {
            reviewMap.fitBounds(markers, { padding: [50, 50] });
        }

        setTimeout(() => reviewMap.invalidateSize(), 100);
    }

    // --- Activity Modal ---
    let currentDayForActivity = null;
    let activityMap;
    let activityMarker;
    const activityModal = document.getElementById('activity-modal');

    function ensureActivityMapInitialized() {
        if (!activityMap && typeof L !== 'undefined') {
            const actMapElem = document.getElementById('activity-map');
            if (actMapElem) {
                activityMap = L.map('activity-map').setView([16.0544, 108.2022], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(activityMap);
                activityMap.on('click', (e) => setActivityLocation(e.latlng.lat, e.latlng.lng));
            }
        }
    }

    window.openActivityModal = function(dayIndex) {
        currentDayForActivity = dayIndex;
        document.getElementById('modal-day-label').textContent = `Ngày ${dayIndex.toString().padStart(2, '0')} - Lịch trình`;
        document.getElementById('activity-continue-btn').querySelector('span').textContent = 'Thêm & Tiếp tục';
        activityModal.classList.remove('hidden');
        ensureActivityMapInitialized();
        if (activityMap) setTimeout(() => activityMap.invalidateSize(), 100);
    };

    window.closeActivityModal = function() {
        activityModal.classList.add('hidden');
        ['activity-name', 'activity-start', 'activity-end', 'activity-desc', 'activity-search'].forEach(id => document.getElementById(id).value = '');
        scheSelectedFiles = [];
        scheCoverIndexInput.value = 0;
        schePreviewGrid.innerHTML = '';
        document.getElementById('act-lat').textContent = '--';
        document.getElementById('act-lng').textContent = '--';
        editingActivityId = null;
    };

    window.openEditActivityModal = function(tempId) {
        const sche = allSchedules.find(s => s.tempId == tempId);
        if (!sche) return;

        editingActivityId = tempId;
        currentDayForActivity = sche.day_number;
        
        document.getElementById('modal-day-label').textContent = `Ngày ${sche.day_number.toString().padStart(2, '0')} - Chỉnh sửa`;
        document.getElementById('activity-name').value = sche.tour_sche_name || '';
        document.getElementById('activity-start').value = sche.time_sche_start || '';
        document.getElementById('activity-end').value = sche.time_sche_end || '';
        document.getElementById('activity-desc').value = sche.tour_sche_desc || '';
        document.getElementById('activity-search').value = sche.tour_sche_add || '';
        document.getElementById('activity-continue-btn').querySelector('span').textContent = 'Lưu & Tiếp tới';
        
        activityModal.classList.remove('hidden');
        ensureActivityMapInitialized();

        if (sche.tour_sche_latit && sche.tour_sche_longit) {
            setActivityLocation(sche.tour_sche_latit, sche.tour_sche_longit);
        }

        // Handle images
        scheSelectedFiles = [...(sche.images || [])];
        scheCoverIndexInput.value = sche.cover_index || 0;
        renderScheImagePreviews();

        if (activityMap) setTimeout(() => activityMap.invalidateSize(), 100);
    };

    async function updateActivityAddress(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                document.getElementById('activity-search').value = data.display_name;
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
    }

    function setActivityLocation(lat, lng) {
        if (!activityMap) return;
        activityMap.setView([lat, lng], 16);
        if (activityMarker) activityMarker.setLatLng([lat, lng]);
        else activityMarker = L.marker([lat, lng]).addTo(activityMap);
        document.getElementById('act-lat').textContent = lat.toFixed(6);
        document.getElementById('act-lng').textContent = lng.toFixed(6);
        updateActivityAddress(lat, lng);
    }

    window.searchActivityLocation = async function() {
        const query = document.getElementById('activity-search').value;
        if (!query) return;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.length > 0) setActivityLocation(parseFloat(data[0].lat), parseFloat(data[0].lon));
    };

    window.saveActivity = async function(isContinue = false) {
        const name = document.getElementById('activity-name').value;
        const start = document.getElementById('activity-start').value;
        const end = document.getElementById('activity-end').value;
        const desc = document.getElementById('activity-desc').value;
        const address = document.getElementById('activity-search').value;

        if (!name) return showNotification('Vui lòng nhập tên hoạt động!', 'error');

        // --- Prevent Double Data ---
        const continueBtn = document.getElementById('activity-continue-btn');
        const saveBtn = document.getElementById('activity-save-btn');
        if (continueBtn && saveBtn) {
            if (continueBtn.disabled) return;
            continueBtn.disabled = true;
            saveBtn.disabled = true;
        }

        const tempId = editingActivityId || Date.now();
        const activityImages = [...scheSelectedFiles];
        
        const scheObj = {
            tempId: tempId,
            day_number: parseInt(currentDayForActivity),
            tour_sche_name: name,
            tour_sche_desc: desc,
            time_sche_start: start,
            time_sche_end: end,
            tour_sche_add: address,
            tour_sche_longit: !isNaN(parseFloat(document.getElementById('act-lng').textContent)) ? parseFloat(document.getElementById('act-lng').textContent) : null,
            tour_sche_latit: !isNaN(parseFloat(document.getElementById('act-lat').textContent)) ? parseFloat(document.getElementById('act-lat').textContent) : null,
            cover_index: parseInt(scheCoverIndexInput.value) || 0,
            images: activityImages
        };

        // If editing, remove old entry (use != to handle string vs number comparison)
        if (editingActivityId) {
            allSchedules = allSchedules.filter(s => s.tempId != editingActivityId);
        }

        try {
            // Save to state
            allSchedules.push(scheObj);
            
            // Sort by day and time
            allSchedules.sort((a, b) => {
                if (a.day_number !== b.day_number) return a.day_number - b.day_number;
                return (a.time_sche_start || '').localeCompare(b.time_sche_start || '');
            });

            // Re-render the day's activities to ensure order
            const container = document.getElementById(`day-${currentDayForActivity}-activities`);
            if (container) {
                container.innerHTML = '';
                const dayActivities = allSchedules.filter(s => s.day_number == currentDayForActivity);
                for (const sche of dayActivities) {
                    let urls = [];
                    if (sche.images && sche.images.length > 0) {
                        urls = await Promise.all(sche.images.map(img => {
                            if (img instanceof File) {
                                return new Promise(resolve => {
                                    const reader = new FileReader();
                                    reader.onload = e => resolve(e.target.result);
                                    reader.readAsDataURL(img);
                                });
                            }
                            return Promise.resolve(img.tour_sche_img_url || img);
                        }));
                    }
                    container.insertAdjacentHTML('beforeend', renderActivityItemHTML(sche, urls));
                }
            }

            if (isContinue) {
                if (editingActivityId) {
                    // Find next activity in the same day or next day
                    const currentIndex = allSchedules.findIndex(s => s.tempId == tempId);
                    const nextActivity = allSchedules[currentIndex + 1];
                    
                    if (nextActivity) {
                        openEditActivityModal(nextActivity.tempId);
                    } else {
                        showNotification('Đã tới cuối lịch trình!');
                        closeActivityModal();
                    }
                } else {
                    // Add mode: Clear and stay on same day
                    const currentDay = currentDayForActivity;
                    closeActivityModal();
                    openActivityModal(currentDay);
                }
            } else {
                closeActivityModal();
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            showNotification('Lỗi khi lưu hoạt động!', 'error');
        } finally {
            if (continueBtn && saveBtn) {
                continueBtn.disabled = false;
                saveBtn.disabled = false;
            }
        }
    };

    window.removeActivity = function(tempId, btn) {
        allSchedules = allSchedules.filter(s => s.tempId != tempId);
        const item = btn.closest('[data-id]');
        if (item) item.remove();
    };

    window.setTourType = function(type) {
        document.getElementById('tour-type').value = type === 'intl' ? 'Quốc tế' : 'Nội địa';
        document.getElementById('btn-tour-intl').className = type === 'intl' ? 'flex-1 flex items-center justify-center gap-2 rounded-md bg-surface-container-lowest text-primary font-bold shadow-sm transition-all' : 'flex-1 flex items-center justify-center gap-2 rounded-md text-on-surface-variant font-medium hover:text-on-surface transition-all';
        document.getElementById('btn-tour-domestic').className = type === 'domestic' ? 'flex-1 flex items-center justify-center gap-2 rounded-md bg-surface-container-lowest text-primary font-bold shadow-sm transition-all' : 'flex-1 flex items-center justify-center gap-2 rounded-md text-on-surface-variant font-medium hover:text-on-surface transition-all';
    };

    // --- Tour Listing Logic ---
    const tourTableBody = document.getElementById('tour-table-body');
    if (tourTableBody) {
        loadTours();
    }

    async function loadTours() {
        try {
            const response = await fetch('/api/tours/view-tour');
            const result = await response.json();
            if (result.success) {
                renderTours(result.data);
                const countElem = document.getElementById('total-tours-count');
                if (countElem) countElem.textContent = result.data.length;
            }
        } catch (error) {
            console.error('Error loading tours:', error);
        }
    }

    function renderTours(tours) {
        tourTableBody.innerHTML = '';
        if (tours.length === 0) {
            tourTableBody.innerHTML = '<tr><td colspan="8" class="px-6 py-10 text-center text-on-surface-variant italic">Chưa có tour nào được tạo.</td></tr>';
            return;
        }

        tours.forEach(tour => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-surface-container-high transition-colors group border-b border-surface-container last:border-none';
            
            const startDate = tour.time.date_start ? new Date(tour.time.date_start).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '--/--';
            const endDate = tour.time.date_end ? new Date(tour.time.date_end).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '--/--';
            
            const priceAdult = tour.price.price_adult ? tour.price.price_adult.toLocaleString('vi-VN') : '0';
            const priceChild = tour.price.price_child ? tour.price.price_child.toLocaleString('vi-VN') : '0';
            
            const guidesHtml = tour.guides.length > 0 
                ? tour.guides.map(g => `
                    <div class="flex items-center justify-center mb-0.5 last:mb-0">
                        <span class="text-[11px] font-semibold text-on-surface/80">${g.full_name}</span>
                    </div>
                `).join('')
                : '<span class="text-[11px] text-on-surface-variant/60 italic">Chưa gán</span>';

            row.innerHTML = `
                <td class="px-6 py-4">
                    <div class="flex items-center gap-4">
                        <div class="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-black/5">
                            <img src="${tour.cover_img || 'https://via.placeholder.com/150'}" class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                        </div>
                        <div class="flex flex-col">
                            <p class="text-[13px] font-extrabold text-on-surface font-headline leading-tight group-hover:text-primary transition-colors">${tour.tour_name}</p>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter">${tour.tour_type}</span>
                                <span class="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">ID: ${tour.tour_id.slice(-6)}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-start text-on-surface-variant max-w-[200px]">
                        <span class="text-[11px] font-medium leading-relaxed line-clamp-2">${tour.tour_add || 'Chưa đặt'}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex flex-col items-center justify-center space-y-0.5">
                        <p class="text-[11px] font-bold text-on-surface">
                            ${startDate} - ${endDate}
                        </p>
                        <p class="text-[10px] text-on-surface-variant font-medium">${tour.time.tour_duration || 0} Ngày / ${(tour.time.tour_duration > 1 ? tour.time.tour_duration - 1 : 0)} Đêm</p>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center">
                        <span class="text-[11px] font-bold text-on-surface">0 <span class="text-on-surface-variant/40 font-medium">/ ${tour.price.tour_capacity || 0}</span></span>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex flex-col gap-1.5 min-w-[100px] items-center">
                        <div class="flex items-center justify-between w-full bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                            <span class="material-symbols-outlined text-[16px] text-primary">person</span>
                            <span class="text-[12px] font-black text-primary">${priceAdult} <span class="text-[8px] font-medium opacity-50">VNĐ</span></span>
                        </div>
                        <div class="flex items-center justify-between w-full bg-on-surface-variant/5 px-2 py-1 rounded-md border border-on-surface-variant/10">
                            <span class="material-symbols-outlined text-[16px] text-on-surface-variant">child_care</span>
                            <span class="text-[11px] font-bold text-on-surface-variant">${priceChild} <span class="text-[8px] font-medium opacity-40">VNĐ</span></span>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex flex-col items-center gap-0.5">
                        ${guidesHtml}
                    </div>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset ${
                        tour.tour_status === 'Bản nháp' 
                        ? 'bg-amber-50 text-amber-700 ring-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                    }">
                        <span class="w-1.5 h-1.5 rounded-full ${tour.tour_status === 'Bản nháp' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse"></span>
                        ${tour.tour_status}
                    </span>
                </td>
                <td class="px-6 py-6">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="window.location.href='tour_detail.html?id=${tour.tour_id}'" class="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm" title="Xem">
                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button onclick="window.location.href='tour_standard_add.html?id=${tour.tour_id}'" class="w-9 h-9 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm" title="Sửa">
                            <span class="material-symbols-outlined text-[20px]">edit_square</span>
                        </button>
                        <button onclick="deleteTour('${tour.tour_id}')" title="Xóa" class="w-9 h-9 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                </td>
            `;
            tourTableBody.appendChild(row);
        });
    }

    window.deleteTour = function(id) {
        showConfirmModal('Bạn có chắc chắn muốn xóa tour này và toàn bộ dữ liệu liên quan không?', async () => {
            try {
                const response = await fetch(`/api/tours/delete-tour/${id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (result.success) {
                    showNotification('Xóa tour thành công!');
                    loadTours();
                } else {
                    showNotification('Lỗi: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Error deleting tour:', error);
                showNotification('Lỗi kết nối máy chủ!', 'error');
            }
        });
    };

    function showNotification(message, type = 'success') {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-3';
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? 'check_circle' : 'error';

        notification.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 transform translate-x-full transition-all duration-300 ease-out font-['Manrope'] font-bold`;
        notification.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 10);

        setTimeout(() => {
            notification.classList.add('translate-x-[150%]');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function showConfirmModal(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-0';
        
        const modal = document.createElement('div');
        modal.className = 'bg-surface rounded-3xl shadow-2xl p-8 w-[400px] max-w-[90%] transform scale-95 transition-all duration-300';
        
        modal.innerHTML = `
            <div class="flex flex-col items-center text-center mb-6">
                <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-4xl">delete_forever</span>
                </div>
                <h3 class="text-2xl font-extrabold font-['Manrope'] text-on-surface mb-2">Xác nhận xóa</h3>
                <p class="text-on-surface-variant font-medium">${message}</p>
            </div>
            <div class="flex items-center justify-center gap-4">
                <button id="btn-cancel" class="flex-1 py-3 rounded-xl font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-highest transition-colors">Hủy</button>
                <button id="btn-confirm" class="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-all">Đồng ý Xóa</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // animate in
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            modal.classList.remove('scale-95');
            modal.classList.add('scale-100');
        }, 10);
        
        const closeModal = () => {
            overlay.classList.add('opacity-0');
            modal.classList.remove('scale-100');
            modal.classList.add('scale-95');
            setTimeout(() => overlay.remove(), 300);
        };
        
        document.getElementById('btn-cancel').onclick = closeModal;
        document.getElementById('btn-confirm').onclick = () => {
            closeModal();
            onConfirm();
        };
    }

    // Image Modal Gallery State
    let currentImages = [];
    let currentImageIndex = 0;

    window.openImageModal = function(images, index = 0) {
        if (typeof images === 'string') images = [images];
        currentImages = images;
        currentImageIndex = index;
        
        const modal = document.getElementById('image-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; 
        
        updateModalContent();
    }

    function updateModalContent() {
        const modalImg = document.getElementById('modal-image');
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');
        const counter = document.getElementById('modal-counter');
        
        modalImg.classList.add('scale-95');
        
        setTimeout(() => {
            modalImg.src = currentImages[currentImageIndex];
            
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

    window.nextImage = function() {
        if (currentImages.length <= 1) return;
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        updateModalContent();
    }

    window.prevImage = function() {
        if (currentImages.length <= 1) return;
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        updateModalContent();
    }

    window.closeImageModal = function() {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        
        modalImg.classList.remove('scale-100');
        modalImg.classList.add('scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }, 200);
    }

    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('image-modal');
        if (!modal || modal.classList.contains('hidden')) return;
        
        if (e.key === 'Escape') closeImageModal();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

    // --- Edit Mode Initialization ---
    if (editingTourId && document.getElementById('tour-name')) {
        loadTourData(editingTourId);
    }

    async function loadTourData(id) {
        try {
            const response = await fetch(`/api/tours/view-tour/${id}`);
            const result = await response.json();
            if (result.success) {
                const tour = result.data;
                
                // Basic Info
                document.getElementById('tour-name').value = tour.tour_name;
                document.getElementById('tour-desc').value = tour.tour_desc;
                document.getElementById('tour-type').value = tour.tour_type;
                setTourType(tour.tour_type === 'Quốc tế' ? 'intl' : 'domestic');
                document.getElementById('search-input').value = tour.tour_add;
                if (tour.tour_latit && tour.tour_longit) {
                    setLocation(parseFloat(tour.tour_latit), parseFloat(tour.tour_longit));
                }
                
                // Duration & Prices
                document.getElementById('duration-days').value = tour.time.tour_duration;
                document.getElementById('price-adult').value = tour.price.price_adult.toLocaleString('vi-VN');
                document.getElementById('price-child').value = tour.price.price_child.toLocaleString('vi-VN');
                document.getElementById('tour-capacity').value = tour.price.tour_capacity;
                document.getElementById('start-date').value = tour.time.date_start.split('T')[0];
                updateDuration();

                // Status
                const statusSelect = document.getElementById('tour-status-select');
                if (statusSelect && tour.tour_status) {
                    statusSelect.value = tour.tour_status;
                    if (typeof window.updateTourStatusBadge === 'function') window.updateTourStatusBadge();
                }

                // Images
                selectedFiles = tour.images || [];
                const coverIdx = selectedFiles.findIndex(img => img.img_is_cover);
                coverIndexInput.value = coverIdx >= 0 ? coverIdx : 0;
                renderImagePreviews();

                // Guides
                selectedGuideIds = tour.guides.map(g => g.user_id);
                // Ensure allGuides has these guides so Step 4 can render them
                tour.guides.forEach(g => {
                    if (!allGuides.find(ag => ag.user_id === g.user_id)) {
                        allGuides.push(g);
                    }
                });
                // Schedules
                allSchedules = tour.schedules.map(sche => ({
                    tempId: sche.tour_sche_id,
                    day_number: sche.day_number,
                    tour_sche_name: sche.tour_sche_name,
                    tour_sche_desc: sche.tour_sche_desc,
                    time_sche_start: sche.time_sche_start,
                    time_sche_end: sche.time_sche_end,
                    tour_sche_add: sche.tour_sche_add,
                    tour_sche_longit: sche.tour_sche_longit,
                    tour_sche_latit: sche.tour_sche_latit,
                    cover_index: sche.images.findIndex(img => img.img_is_cover) || 0,
                    images: sche.images || []
                }));
                
                generateTimeline();
            }
        } catch (error) {
            console.error('Error loading tour data:', error);
        }
    }
});
