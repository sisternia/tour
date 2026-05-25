document.addEventListener("DOMContentLoaded", function () {
  fetchCustomBookings();
});

async function fetchCustomBookings() {
  try {
    const response = await fetch("/api/bookings/all");
    const result = await response.json();

    if (!result.success || !result.data) {
      showError("Không thể tải danh sách tour tự túc.");
      return;
    }

    // Filter for bookings where the tour is custom
    const customBookings = result.data.filter(
      (booking) =>
        booking.tour_details && booking.tour_details.is_custom === true,
    );

    renderStats(customBookings);
    renderTable(customBookings);
    renderRecentActivities(customBookings);
  } catch (error) {
    console.error("Fetch Custom Bookings Error:", error);
    showError("Lỗi kết nối máy chủ khi tải tour tự túc.");
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "--/--";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch (e) {
    return "--/--";
  }
}

function formatPrice(amount) {
  if (amount === undefined || amount === null) return "0đ";
  return Number(amount).toLocaleString("vi-VN") + "đ";
}

function renderStats(bookings) {
  const totalRequests = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter(
    (b) => b.status === "paid" || b.status === "confirmed",
  ).length;

  const projectedRevenue = bookings
    .filter((b) => b.status === "paid" || b.status === "confirmed")
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

  document.getElementById("stat-total").textContent = totalRequests;
  document.getElementById("stat-pending").textContent = pendingCount;
  document.getElementById("stat-approved").textContent = approvedCount;
  document.getElementById("stat-revenue").textContent =
    "₫" + (projectedRevenue / 1e6).toFixed(1) + "M";
}

function renderTable(bookings) {
  const tableBody = document.getElementById("custom-tour-table-body");
  tableBody.innerHTML = "";

  if (bookings.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-10 text-center text-on-surface-variant italic">
                    Chưa có hành trình du lịch tự túc nào được tạo.
                </td>
            </tr>
        `;
    return;
  }

  bookings.forEach((booking) => {
    const tour = booking.tour_details || {};
    const contact = booking.contact_info || {};

    const tourName = tour.tour_name || "Tour tự túc";
    const customerName = contact.full_name || "Ẩn danh";

    const dateStart = formatDate(booking.date_start);
    const dateEnd = formatDate(booking.date_end);
    const duration =
      (booking.time_details && booking.time_details.tour_duration) ||
      tour.tour_duration ||
      1;
    const totalPeople = (booking.adult_count || 0) + (booking.child_count || 0);
    const priceAdult = booking.price_details
      ? Number(booking.price_details.price_adult).toLocaleString("vi-VN")
      : "0";
    const priceChild = booking.price_details
      ? Number(booking.price_details.price_child).toLocaleString("vi-VN")
      : "0";

    let statusText = "Chờ xử lý";
    let statusClass = "bg-gray-50 text-gray-700 ring-gray-200";
    let dotClass = "bg-gray-400";

    if (booking.status === "pending") {
      statusText = "Chờ thanh toán";
      statusClass = "bg-amber-50 text-amber-700 ring-amber-200";
      dotClass = "bg-amber-400";
    } else if (booking.status === "paid") {
      statusText = "Đã thanh toán";
      statusClass = "bg-blue-50 text-blue-700 ring-blue-200";
      dotClass = "bg-blue-400";
    } else if (booking.status === "confirmed") {
      statusText = "Đã xác nhận";
      statusClass = "bg-emerald-50 text-emerald-700 ring-emerald-200";
      dotClass = "bg-emerald-400";
    } else if (booking.status === "cancelled") {
      statusText = "Đã hủy";
      statusClass = "bg-red-50 text-red-700 ring-red-200";
      dotClass = "bg-red-400";
    }

    const row = document.createElement("tr");
    row.className = "hover:bg-surface-container-high transition-colors group";
    row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-4 whitespace-nowrap max-w-[300px]">
                    <div class="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm ring-1 ring-black/5 bg-primary/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[22px] text-primary">map</span>
                    </div>
                    <div class="flex flex-col min-w-0">
                        <p class="text-[13px] font-extrabold text-on-surface font-headline leading-tight group-hover:text-primary transition-colors truncate" title="${tourName}">${tourName}</p>
                        <div class="flex items-center gap-2 mt-1 whitespace-nowrap">
                            <span class="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">${tour.tour_type || 'Nội địa'}</span>
                            <span class="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest truncate">ID: ${booking.booking_info_id.slice(-6)}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-5 text-[13px] font-medium text-on-surface max-w-[150px] truncate" title="${customerName}">${customerName}</td>
            <td class="px-6 py-5">
                <div class="flex flex-col items-center justify-center space-y-0.5 whitespace-nowrap">
                    <p class="text-[11px] font-bold text-on-surface">
                        ${dateStart} - ${dateEnd}
                    </p>
                    <p class="text-[10px] text-on-surface-variant font-medium">${duration} Ngày / ${duration > 1 ? duration - 1 : 0} Đêm</p>
                </div>
            </td>
            <td class="px-6 py-5 text-center">
                <span class="text-[11px] font-bold text-on-surface whitespace-nowrap">${totalPeople} người</span>
            </td>
            <td class="px-6 py-5 text-center">
                <div class="flex flex-col gap-1.5 min-w-[100px] items-center whitespace-nowrap">
                    <div class="flex items-center justify-between w-full bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                        <span class="material-symbols-outlined text-[16px] text-primary">person</span>
                        <span class="text-[12px] font-black text-primary">${priceAdult} <span class="text-[8px] font-medium opacity-50">VNĐ</span></span>
                    </div>
                    <div class="flex items-center justify-between w-full bg-on-surface-variant/5 px-2 py-1 rounded-md border border-on-surface-variant/10">
                        <span class="material-symbols-outlined text-[16px] text-on-surface-variant">child_care</span>
                        <span class="text-[12px] font-bold text-on-surface-variant">${priceChild} <span class="text-[8px] font-medium opacity-40">VNĐ</span></span>
                    </div>
                </div>
            </td>
            <td class="px-6 py-5 text-center">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ring-1 ring-inset whitespace-nowrap ${statusClass}">
                    <span class="w-1.5 h-1.5 rounded-full ${dotClass} animate-pulse"></span>
                    ${statusText}
                </span>
            </td>
            <td class="px-6 py-5">
                <div class="flex items-center justify-center gap-2 whitespace-nowrap">
                    <button onclick="window.location.href='../book-tour/book_detail.html?id=${booking.booking_info_id}'" class="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm" title="Xem chi tiết đơn">
                        <span class="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button onclick="window.location.href='../book-tour/book_edit.html?id=${booking.booking_info_id}'" class="w-9 h-9 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm" title="Chỉnh sửa trạng thái">
                        <span class="material-symbols-outlined text-[20px]">edit_square</span>
                    </button>
                    <button onclick="deleteCustomBooking('${booking.booking_info_id}')" title="Xóa" class="w-9 h-9 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

function renderRecentActivities(bookings) {
  const activityContainer = document.getElementById("recent-custom-activities");
  activityContainer.innerHTML = "";

  // Show top 3 recent custom bookings
  const recent = bookings.slice(0, 3);

  if (recent.length === 0) {
    activityContainer.innerHTML = `<p class="text-on-surface-variant italic">Không có hoạt động gần đây.</p>`;
    return;
  }

  recent.forEach((booking) => {
    const timeDiff = getRandomTimeDiff(); // Simulated friendly timestamp
    const activityHtml = `
            <div class="flex flex-col gap-1 border-b border-surface-container pb-3 last:border-0 last:pb-0">
                <p><strong>Yêu cầu mới: "${booking.tour_details?.tour_name || "Tour tự thiết kế"}"</strong></p>
                <p class="text-xs text-on-surface-variant">Khách hàng: ${booking.contact_info?.full_name || "Ẩn danh"} • Trạng thái: ${booking.status.toUpperCase()} • ${timeDiff}</p>
            </div>
        `;
    activityContainer.innerHTML += activityHtml;
  });
}

function getRandomTimeDiff() {
  const diffs = [
    "Vừa xong",
    "10 phút trước",
    "45 phút trước",
    "2 giờ trước",
    "Hôm qua",
  ];
  return diffs[Math.floor(Math.random() * diffs.length)];
}

function showError(msg) {
  const tableBody = document.getElementById("custom-tour-table-body");
  if (tableBody) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-10 text-center text-red-600 font-semibold">
                    ${msg}
                </td>
            </tr>
        `;
  }
}

window.deleteCustomBooking = async function (bookingId) {
  if (!confirm("Bạn có chắc chắn muốn xóa đơn đặt tour tự túc này?")) {
    return;
  }

  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (result.success) {
      alert("Xóa yêu cầu thành công!");
      fetchCustomBookings();
    } else {
      alert("Lỗi: " + result.message);
    }
  } catch (error) {
    console.error("Lỗi khi xóa:", error);
    alert("Lỗi kết nối máy chủ!");
  }
};
