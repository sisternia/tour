document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');

    if (!bookingId) {
        window.location.href = 'book_tour.html';
        return;
    }

    loadBookingDetail(bookingId);

    async function loadBookingDetail(id) {
        try {
            const response = await fetch(`/api/bookings/${id}`);
            const result = await response.json();
            if (result.success) {
                renderDetail(result.data);
            } else {
                console.error('Lỗi khi tải chi tiết đơn hàng:', result.message);
                alert('Không tìm thấy thông tin đơn hàng!');
                window.location.href = 'book_tour.html';
            }
        } catch (error) {
            console.error('Error loading booking detail:', error);
            alert('Lỗi kết nối máy chủ!');
        }
    }

    function renderDetail(booking) {
        const contact = booking.contact_info || {};
        const tour = booking.tour_details || {};
        const time = booking.time_details || {};
        const price = booking.price_details || {};
        const guides = booking.guide_infos || [];
        const images = booking.tour_images || [];

        // Status
        document.getElementById('booking-id-text').textContent = `#${booking.booking_info_id}`;
        
        const statusBadge = document.getElementById('booking-status-badge');
        const statusText = document.getElementById('booking-status-text');
        const status = booking.status;
        
        if (status === 'paid') {
            statusBadge.className = 'px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-2 font-bold text-sm';
            statusText.textContent = 'Đã thanh toán';
        } else if (status === 'pending') {
            statusBadge.className = 'px-4 py-2 bg-orange-100 text-orange-700 rounded-lg flex items-center gap-2 font-bold text-sm';
            statusText.textContent = 'Đang thanh toán';
        } else if (status === 'confirmed') {
            statusBadge.className = 'px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2 font-bold text-sm';
            statusText.textContent = 'Đã xác nhận';
        } else {
            statusBadge.className = 'px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 font-bold text-sm';
            statusText.textContent = 'Đã hủy';
        }

        // Customer Info
        document.getElementById('customer-name').textContent = contact.full_name || '---';
        document.getElementById('booking-time').textContent = new Date(booking.createdAt).toLocaleString('vi-VN');
        document.getElementById('customer-email').textContent = contact.email || '---';
        document.getElementById('customer-phone').textContent = contact.phone || '---';

        // Passenger List
        const passengerContainer = document.getElementById('passenger-list-container');
        document.getElementById('total-passengers-badge').textContent = `${booking.adult_count + booking.child_count} Người`;
        
        passengerContainer.innerHTML = '';
        
        // Group passengers
        const adults = (booking.passengers || []).filter(p => p.type === 'adult');
        const children = (booking.passengers || []).filter(p => p.type === 'child');

        if (adults.length > 0) {
            passengerContainer.appendChild(createPassengerCategory('Người lớn', adults, 'family_restroom', 'border-primary'));
        }
        if (children.length > 0) {
            passengerContainer.appendChild(createPassengerCategory('Trẻ em', children, 'child_care', 'border-secondary'));
        }

        // Financial Detail
        const adultPrice = price.price_adult || 0;
        const childPrice = price.price_child || 0;
        
        document.getElementById('adult-price-label').textContent = `Người lớn (${adultPrice.toLocaleString('vi-VN')}đ x ${booking.adult_count})`;
        document.getElementById('adult-total-price').textContent = `${(adultPrice * booking.adult_count).toLocaleString('vi-VN')}đ`;
        
        document.getElementById('child-price-label').textContent = `Trẻ em (${childPrice.toLocaleString('vi-VN')}đ x ${booking.child_count})`;
        document.getElementById('child-total-price').textContent = `${(childPrice * booking.child_count).toLocaleString('vi-VN')}đ`;
        
        document.getElementById('grand-total-price').textContent = `${(booking.total_price || 0).toLocaleString('vi-VN')}đ`;

        // Tour Summary
        if (images.length > 0) {
            document.getElementById('tour-image').src = images[0].tour_img_url;
        }
        document.getElementById('tour-id-badge').textContent = tour.tour_id || '---';
        document.getElementById('tour-name').textContent = tour.tour_name || '---';
        document.getElementById('tour-location').textContent = tour.tour_add || '---';
        
        const viewTourBtn = document.getElementById('view-tour-btn');
        if (viewTourBtn && tour.tour_id) {
            viewTourBtn.onclick = () => window.location.href = `../tour/tour_detail.html?id=${tour.tour_id}`;
        }
        const displayStartDate = booking.date_start || time.date_start;
        document.getElementById('tour-start-date').textContent = displayStartDate ? new Date(displayStartDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : '---';
        document.getElementById('tour-duration').textContent = time.tour_duration ? `${time.tour_duration} Ngày ${time.tour_duration - 1} Đêm` : '---';
        
        const availableSlotsElem = document.getElementById('available-slots');
        if (availableSlotsElem) {
            const slots = booking.available_slots || 0;
            availableSlotsElem.textContent = `${slots} chỗ`;
            if (slots <= 5) {
                availableSlotsElem.parentElement.parentElement.className = 'flex gap-4 p-4 bg-red-50 rounded-lg items-center border border-red-100';
                availableSlotsElem.className = 'text-sm font-black text-red-600';
            }
        }

        // Guides
        const guidesContainer = document.getElementById('guides-container');
        guidesContainer.innerHTML = '';
        if (guides.length > 0) {
            guides.forEach(guide => {
                const div = document.createElement('div');
                div.className = 'flex items-center gap-4 p-3 bg-surface-container-low rounded-xl';
                div.innerHTML = `
                    <div class="w-12 h-12 rounded-full overflow-hidden border border-primary/10">
                        <img src="${guide.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(guide.full_name) + '&background=random'}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-grow">
                        <p class="font-bold text-sm text-on-surface">${guide.full_name}</p>
                        <p class="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Hướng dẫn viên</p>
                    </div>
                    <button onclick="window.location.href='../tour-guide/guide_detail.html?id=${guide.user_id}'" class="w-8 h-8 flex items-center justify-center bg-blue-600/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Xem chi tiết">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                `;
                guidesContainer.appendChild(div);
            });
        } else {
            guidesContainer.innerHTML = '<p class="text-xs text-on-surface-variant italic">Chưa gán hướng dẫn viên</p>';
        }
    }


    function createPassengerCategory(title, list, icon, borderColor) {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-sm text-on-surface-variant">${icon}</span>
                <h4 class="text-sm font-bold text-on-surface-variant uppercase tracking-widest">${title} (${list.length})</h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${list.map(p => `
                    <div class="p-4 bg-surface-container-low rounded-lg border-l-4 ${borderColor}">
                        <p class="font-bold text-on-surface">${p.name}</p>
                        <p class="text-xs text-on-surface-variant">Giới tính: ${p.gender} | Ngày sinh: ${p.dob ? new Date(p.dob).toLocaleDateString('vi-VN') : '---'}</p>
                    </div>
                `).join('')}
            </div>
        `;
        return div;
    }
});
