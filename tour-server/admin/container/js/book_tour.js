document.addEventListener("DOMContentLoaded", function () {
  const bookingTableBody = document.getElementById("booking-table-body");
  const totalBookingsElem = document.getElementById("total-bookings-count");
  const paidBookingsElem = document.getElementById("paid-bookings-count");
  const pendingBookingsElem = document.getElementById("pending-bookings-count");
  const cancelledBookingsElem = document.getElementById(
    "cancelled-bookings-count",
  );

  let allBookings = [];
  let currentPage = 1;
  const rowsPerPage = 3;

  if (bookingTableBody) {
    loadBookings();
  }

  async function loadBookings() {
    try {
      const response = await fetch("/api/bookings/all");
      const result = await response.json();
      if (result.success) {
        allBookings = result.data;
        renderBookings();
        updateStats(allBookings);
      } else {
        console.error("Lỗi khi tải danh sách đơn hàng:", result.message);
        bookingTableBody.innerHTML = `<tr><td colspan="9" class="px-6 py-10 text-center text-error font-bold">Lỗi: ${result.message}</td></tr>`;
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      bookingTableBody.innerHTML = `<tr><td colspan="9" class="px-6 py-10 text-center text-error font-bold">Lỗi kết nối máy chủ!</td></tr>`;
    }
  }

  function updateStats(bookings) {
    const total = bookings.length;
    const paid = bookings.filter((b) => b.status === "paid").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    if (totalBookingsElem)
      totalBookingsElem.textContent = total.toLocaleString("vi-VN");
    if (paidBookingsElem)
      paidBookingsElem.textContent = paid.toLocaleString("vi-VN");
    if (pendingBookingsElem)
      pendingBookingsElem.textContent = pending.toLocaleString("vi-VN");
    if (cancelledBookingsElem)
      cancelledBookingsElem.textContent = cancelled.toLocaleString("vi-VN");
  }

  function renderBookings() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedBookings = allBookings.slice(startIndex, endIndex);

    bookingTableBody.innerHTML = "";
    if (allBookings.length === 0) {
      bookingTableBody.innerHTML =
        '<tr><td colspan="9" class="px-6 py-10 text-center text-on-surface-variant italic">Chưa có đơn hàng nào.</td></tr>';
      return;
    }

    paginatedBookings.forEach((booking) => {
      const row = document.createElement("tr");
      row.className =
        "hover:bg-surface-container-low/30 transition-colors group";

      const contact = booking.contact_info || {};
      const tour = booking.tour_details || {};
      const time = booking.time_details || {};
      const price = booking.price_details || {};
      const guides = booking.guide_infos || [];

      const startDate = booking.date_start 
        ? new Date(booking.date_start).toLocaleDateString("vi-VN")
        : (time.date_start ? new Date(time.date_start).toLocaleDateString("vi-VN") : "---");
      const endDate = booking.date_end
        ? new Date(booking.date_end).toLocaleDateString("vi-VN")
        : (time.date_end ? new Date(time.date_end).toLocaleDateString("vi-VN") : "---");
      const durationText = time.tour_duration
        ? `${time.tour_duration} Ngày / ${time.tour_duration > 1 ? time.tour_duration - 1 : 0} Đêm`
        : "---";

      const statusClass = getStatusClass(booking.status);
      const statusLabel = getStatusLabel(booking.status);

      const initials = contact.full_name
        ? contact.full_name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "KH";

      row.innerHTML = `
                <td class="px-6 py-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shadow-sm">${initials}</div>
                        <div>
                            <p class="text-sm font-bold text-on-surface">${contact.full_name || "Khách hàng"}</p>
                            <p class="text-[10px] text-on-surface-variant/70 font-medium">${booking.user_id ? "Thành viên" : "Khách vãng lai"}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-6">
                    <p class="text-sm font-bold text-primary mb-0.5">#${booking.booking_info_id}</p>
                    <p class="text-xs font-medium text-on-surface truncate max-w-[150px]" title="${tour.tour_name || "Tour đã bị xóa"}">${tour.tour_name || "ID: " + booking.tour_id}</p>
                </td>
                <td class="px-6 py-6">
                    <p class="text-sm font-medium text-on-surface">${contact.email || "---"}</p>
                    <p class="text-xs text-on-surface-variant">${contact.phone || "---"}</p>
                </td>
                <td class="px-6 py-6">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-2 text-xs text-on-surface font-medium">
                            <span class="material-symbols-outlined text-[14px] text-green-500">login</span>
                            ${startDate}
                        </div>
                        <div class="flex items-center gap-2 text-xs text-on-surface font-medium">
                            <span class="material-symbols-outlined text-[14px] text-red-400">logout</span>
                            ${endDate}
                        </div>
                        <p class="text-[10px] text-on-surface-variant font-medium mt-1">${durationText}</p>
                    </div>
                </td>
                <td class="px-6 py-6 text-center">
                    <div class="inline-flex flex-col items-center">
                        <span class="text-sm font-bold text-on-surface">${String(booking.adult_count + booking.child_count).padStart(2, "0")} <span class="text-on-surface-variant/40 font-medium">/ ${price.tour_capacity || 0}</span></span>
                        <span class="text-[10px] text-on-surface-variant font-medium">${booking.adult_count} Lớn, ${booking.child_count} Trẻ</span>
                    </div>
                </td>
                <td class="px-6 py-6">
                    ${renderGuides(guides)}
                </td>
                <td class="px-6 py-6">
                    <p class="text-sm font-bold text-on-surface">${(booking.total_price || 0).toLocaleString("vi-VN")}đ</p>
                </td>
                <td class="px-6 py-6 text-center">
                    <span class="${statusClass} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight inline-block">${statusLabel}</span>
                </td>
                <td class="px-6 py-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="viewBooking('${booking.booking_info_id}')" class="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm" title="Chi tiết">
                            <span class="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button onclick="editBooking('${booking.booking_info_id}')" class="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm" title="Sửa">
                            <span class="material-symbols-outlined text-[18px]">edit_square</span>
                        </button>
                        <button onclick="deleteBooking('${booking.booking_info_id}')" class="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm" title="Hủy đơn">
                            <span class="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                    </div>
                </td>
            `;
      bookingTableBody.appendChild(row);
    });

    renderPagination();
  }

  function renderPagination() {
    const totalPages = Math.ceil(allBookings.length / rowsPerPage);
    const container = document.getElementById("pagination-container");
    const infoElem = document.getElementById("pagination-info");
    const buttonsElem = document.getElementById("pagination-buttons");

    if (!container || totalPages <= 1) {
      if (container) container.classList.add("hidden");
      return;
    }

    container.classList.remove("hidden");

    // Update info
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, allBookings.length);
    infoElem.textContent = `Hiển thị ${start}-${end} trong số ${allBookings.length} đơn hàng`;

    // Render buttons
    buttonsElem.innerHTML = "";

    // Prev button
    const prevBtn = createPageButton("chevron_left", currentPage > 1, () => {
      currentPage--;
      renderBookings();
    }, true);
    buttonsElem.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = createPageButton(i, true, () => {
        currentPage = i;
        renderBookings();
      }, false, i === currentPage);
      buttonsElem.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = createPageButton("chevron_right", currentPage < totalPages, () => {
      currentPage++;
      renderBookings();
    }, true);
    buttonsElem.appendChild(nextBtn);
  }

  function createPageButton(content, enabled, onClick, isIcon = false, isActive = false) {
    const btn = document.createElement("button");
    btn.className = `w-9 h-9 flex items-center justify-center rounded-lg transition-all text-xs font-bold ${
      isActive
        ? "bg-primary text-on-primary shadow-sm shadow-primary/20"
        : "hover:bg-surface-container-high text-on-surface-variant"
    } ${!enabled ? "opacity-30 cursor-not-allowed" : ""}`;

    if (isIcon) {
      btn.innerHTML = `<span class="material-symbols-outlined text-sm">${content}</span>`;
    } else {
      btn.textContent = content;
    }

    if (enabled) {
      btn.onclick = onClick;
    }

    return btn;
  }

  window.viewBooking = function (id) {
    window.location.href = `book_detail.html?id=${id}`;
  };

  window.editBooking = function (id) {
    window.location.href = `book_edit.html?id=${id}`;
  };

  window.deleteBooking = function (id) {
    showConfirmModal(
      "Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn hàng này không? Thao tác này không thể hoàn tác.",
      async () => {
        try {
          const response = await fetch(`/api/bookings/${id}`, {
            method: "DELETE",
          });
          const result = await response.json();
          if (result.success) {
            showNotification("Đã xóa đơn hàng thành công!");
            loadBookings();
          } else {
            showNotification("Lỗi: " + result.message, "error");
          }
        } catch (error) {
          console.error("Error deleting booking:", error);
          showNotification("Lỗi kết nối máy chủ!", "error");
        }
      },
    );
  };

  function showNotification(message, type = "success") {
    let container = document.getElementById("notification-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "notification-container";
      container.className = "fixed top-5 right-5 z-[9999] flex flex-col gap-3";
      document.body.appendChild(container);
    }

    const notification = document.createElement("div");
    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    const icon = type === "success" ? "check_circle" : "error";

    notification.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 transform translate-x-full transition-all duration-300 ease-out font-['Manrope'] font-bold`;
    notification.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            <span>${message}</span>
        `;

    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 10);

    setTimeout(() => {
      notification.classList.add("translate-x-[150%]");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  function showConfirmModal(message, onConfirm) {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 opacity-0";

    const modal = document.createElement("div");
    modal.className =
      "bg-surface rounded-3xl shadow-2xl p-8 w-[400px] max-w-[90%] transform scale-95 transition-all duration-300";

    modal.innerHTML = `
            <div class="flex flex-col items-center text-center mb-6">
                <div class="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <span class="material-symbols-outlined text-4xl">warning</span>
                </div>
                <h3 class="text-2xl font-extrabold font-['Manrope'] text-on-surface mb-2">Xác nhận</h3>
                <p class="text-on-surface-variant font-medium">${message}</p>
            </div>
            <div class="flex items-center justify-center gap-4">
                <button id="btn-cancel" class="flex-1 py-3 rounded-xl font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-highest transition-colors">Hủy</button>
                <button id="btn-confirm" class="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg transition-all">Đồng ý</button>
            </div>
        `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.remove("opacity-0");
      modal.classList.remove("scale-95");
      modal.classList.add("scale-100");
    }, 10);

    const closeModal = () => {
      overlay.classList.add("opacity-0");
      modal.classList.remove("scale-100");
      modal.classList.add("scale-95");
      setTimeout(() => overlay.remove(), 300);
    };

    document.getElementById("btn-cancel").onclick = closeModal;
    document.getElementById("btn-confirm").onclick = () => {
      closeModal();
      onConfirm();
    };
  }

  function getStatusClass(status) {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Đang thanh toán";
      case "confirmed":
        return "Đã xác nhận";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  }

  function renderGuides(guides) {
    if (guides && guides.length > 0) {
      return guides
        .map(
          (guide) => `
                <div class="flex items-center gap-2 mb-1 last:mb-0">
                    <img src="${guide.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(guide.full_name) + "&background=random"}" class="w-6 h-6 rounded-full border border-surface shadow-sm" alt="Guide">
                    <span class="text-xs font-medium truncate max-w-[100px]">${guide.full_name}</span>
                </div>
            `,
        )
        .join("");
    }
    return `<span class="text-xs text-on-surface-variant italic font-medium">Chưa gán</span>`;
  }

  // --- Booking Edit Page Logic ---
  const saveBtn = document.getElementById('save-status-btn');
  const statusSelect = document.getElementById('booking-status-select');
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('id');

  if (saveBtn && bookingId) {
    loadBookingForEdit(bookingId);

    saveBtn.addEventListener('click', async () => {
        const newStatus = statusSelect.value;
        try {
            const response = await fetch(`/api/bookings/${bookingId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await response.json();
            if (result.success) {
                renderEditDetail(result.data);
                showNotification('Cập nhật trạng thái đơn hàng thành công!');
            } else {
                showNotification('Lỗi: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showNotification('Lỗi kết nối máy chủ!', 'error');
        }
    });

    statusSelect.addEventListener('change', () => {
        // Visual feedback when status changed but not saved
        const statusBadge = document.getElementById('booking-status-badge');
        statusBadge.classList.add('ring-offset-4', 'ring-primary');
    });
  }

  async function loadBookingForEdit(id) {
    try {
        const response = await fetch(`/api/bookings/${id}`);
        const result = await response.json();
        if (result.success) {
            renderEditDetail(result.data);
        }
    } catch (error) {
        console.error('Error loading booking for edit:', error);
    }
  }

  function renderEditDetail(booking) {
    const contact = booking.contact_info || {};
    const tour = booking.tour_details || {};
    const time = booking.time_details || {};
    const price = booking.price_details || {};
    const images = booking.tour_images || [];

    // Header Status
    const statusBadge = document.getElementById('booking-status-badge');
    const statusText = document.getElementById('booking-status-text');
    const statusSelect = document.getElementById('booking-status-select');
    const status = booking.status;

    statusSelect.value = status;
    statusBadge.classList.remove('ring-offset-4', 'ring-primary');

    if (status === 'paid') {
        statusBadge.className = 'px-5 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3 font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ring-2 ring-emerald-500/20';
        statusText.textContent = 'Đã thanh toán';
    } else if (status === 'pending') {
        statusBadge.className = 'px-5 py-2.5 bg-orange-100 text-orange-700 rounded-xl flex items-center gap-3 font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ring-2 ring-orange-500/20';
        statusText.textContent = 'Đang thanh toán';
    } else if (status === 'confirmed') {
        statusBadge.className = 'px-5 py-2.5 bg-blue-100 text-blue-700 rounded-xl flex items-center gap-3 font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ring-2 ring-blue-500/20';
        statusText.textContent = 'Đã xác nhận';
    } else {
        statusBadge.className = 'px-5 py-2.5 bg-red-100 text-red-700 rounded-xl flex items-center gap-3 font-bold text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm ring-2 ring-red-500/20';
        statusText.textContent = 'Đã hủy';
    }

    // Customer Info
    if (document.getElementById('customer-name')) document.getElementById('customer-name').textContent = contact.full_name || '---';
    if (document.getElementById('booking-id-text')) document.getElementById('booking-id-text').textContent = `#${booking.booking_info_id}`;
    if (document.getElementById('booking-time')) document.getElementById('booking-time').textContent = new Date(booking.createdAt).toLocaleString('vi-VN');
    if (document.getElementById('customer-email')) document.getElementById('customer-email').textContent = contact.email || '---';
    if (document.getElementById('customer-phone')) document.getElementById('customer-phone').textContent = contact.phone || '---';

    // Passengers
    const passengerContainer = document.getElementById('passenger-list-container');
    if (passengerContainer) {
        document.getElementById('total-passengers-badge').textContent = `${booking.adult_count + booking.child_count} Người`;
        passengerContainer.innerHTML = '';
        const adults = (booking.passengers || []).filter(p => p.type === 'adult');
        const children = (booking.passengers || []).filter(p => p.type === 'child');
        if (adults.length > 0) passengerContainer.appendChild(createPassengerCategoryDetail('Người lớn', adults, 'family_restroom', 'border-primary'));
        if (children.length > 0) passengerContainer.appendChild(createPassengerCategoryDetail('Trẻ em', children, 'child_care', 'border-emerald-500'));
    }

    // Pricing
    if (document.getElementById('grand-total-price')) {
        const adultPrice = price.price_adult || 0;
        const childPrice = price.price_child || 0;
        document.getElementById('adult-price-label').textContent = `Người lớn (${adultPrice.toLocaleString('vi-VN')}đ x ${booking.adult_count})`;
        document.getElementById('adult-total-price').textContent = `${(adultPrice * booking.adult_count).toLocaleString('vi-VN')}đ`;
        document.getElementById('child-price-label').textContent = `Trẻ em (${childPrice.toLocaleString('vi-VN')}đ x ${booking.child_count})`;
        document.getElementById('child-total-price').textContent = `${(childPrice * booking.child_count).toLocaleString('vi-VN')}đ`;
        document.getElementById('grand-total-price').textContent = `${(booking.total_price || 0).toLocaleString('vi-VN')}đ`;
    }

    // Tour Summary
    if (document.getElementById('tour-name')) {
        if (images.length > 0) document.getElementById('tour-image').src = images[0].tour_img_url;
        document.getElementById('tour-id-badge').textContent = tour.tour_id || '---';
        document.getElementById('tour-name').textContent = tour.tour_name || '---';

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
                availableSlotsElem.parentElement.parentElement.className = 'flex gap-4 p-4 bg-red-50 rounded-xl items-center border border-red-100';
                availableSlotsElem.className = 'text-sm font-black text-red-600';
            } else {
                availableSlotsElem.parentElement.parentElement.className = 'flex gap-4 p-4 bg-emerald-50 rounded-xl items-center border border-emerald-100';
                availableSlotsElem.className = 'text-sm font-black text-emerald-700';
            }
        }

        // Guides
        const guidesContainer = document.getElementById('guides-container');
        if (guidesContainer) {
            const guides = booking.guide_infos || [];
            guidesContainer.innerHTML = '';
            if (guides.length > 0) {
                guides.forEach(guide => {
                    const div = document.createElement('div');
                    div.className = 'flex items-center gap-4 p-3 bg-surface-container-low rounded-xl';
                    div.innerHTML = `
                        <div class="w-10 h-10 rounded-full overflow-hidden border border-primary/10">
                            <img src="${guide.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(guide.full_name) + '&background=random'}" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-grow">
                            <p class="font-bold text-xs text-on-surface">${guide.full_name}</p>
                            <p class="text-[9px] text-on-surface-variant uppercase font-bold tracking-tighter">Hướng dẫn viên</p>
                        </div>
                        <button onclick="window.location.href='../tour-guide/guide_detail.html?id=${guide.user_id}'" class="w-7 h-7 flex items-center justify-center bg-blue-600/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Xem chi tiết">
                            <span class="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                    `;
                    guidesContainer.appendChild(div);
                });
            } else {
                guidesContainer.innerHTML = '<p class="text-xs text-on-surface-variant italic">Chưa gán hướng dẫn viên</p>';
            }
        }
    }
  }

  function createPassengerCategoryDetail(title, list, icon, borderColor) {
    const div = document.createElement('div');
    div.innerHTML = `
        <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-sm text-on-surface-variant">${icon}</span>
            <h4 class="text-sm font-bold text-on-surface-variant uppercase tracking-widest">${title} (${list.length})</h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${list.map(p => `
                <div class="p-4 bg-surface-container-low rounded-xl border-l-4 ${borderColor}">
                    <p class="font-bold text-on-surface text-sm">${p.name}</p>
                    <p class="text-[10px] text-on-surface-variant mt-1">Giới tính: ${p.gender} | Ngày sinh: ${p.dob ? new Date(p.dob).toLocaleDateString('vi-VN') : '---'}</p>
                </div>
            `).join('')}
        </div>
    `;
    return div;
  }
});

