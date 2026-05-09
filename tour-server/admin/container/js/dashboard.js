document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

async function fetchDashboardData() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const result = await response.json();

        if (result.success) {
            renderStats(result.data.stats);
            renderRevenueTrend(result.data.revenueTrend);
            renderCategoryDistribution(result.data.categoryStats);
            renderRecentBookings(result.data.recentBookings);
            renderTopTour(result.data.topTour);
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

function renderStats(stats) {
    document.getElementById('total-revenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('total-customers').textContent = stats.totalCustomers.toLocaleString();
    document.getElementById('total-tours').textContent = stats.totalTours;
    document.getElementById('ongoing-tours').textContent = stats.ongoingTours;
}

function renderRevenueTrend(trend) {
    const container = document.getElementById('revenue-trend-container');
    container.innerHTML = '';

    if (!trend || trend.length === 0) {
        container.innerHTML = '<p class="text-on-surface-variant text-sm w-full text-center pb-8">Chưa có dữ liệu doanh thu</p>';
        return;
    }

    const maxRevenue = Math.max(...trend.map(t => t.revenue), 1);
    
    // Create month labels at the bottom too
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'absolute -bottom-8 left-0 right-0 flex gap-3 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-center';

    trend.forEach((item, index) => {
        const heightPercentage = (item.revenue / maxRevenue) * 90;
        const bar = document.createElement('div');
        bar.className = `flex-1 ${index === trend.length - 1 ? 'bg-primary' : 'bg-surface-container-high'} rounded-t-lg transition-all hover:opacity-80 group relative cursor-pointer`;
        bar.style.height = `${heightPercentage}%`;
        
        bar.innerHTML = `
            <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-on-primary text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                Tháng ${item._id.month}: ${formatCurrency(item.revenue)}
            </div>
        `;
        container.appendChild(bar);

        const label = document.createElement('span');
        label.className = 'flex-1';
        label.textContent = `Tháng ${item._id.month}`;
        labelsContainer.appendChild(label);
    });

    container.parentElement.appendChild(labelsContainer);
}

function renderCategoryDistribution(categoryStats) {
    const container = document.getElementById('category-distribution-container');
    container.innerHTML = '';

    const total = categoryStats.totalAdults + categoryStats.totalChildren;
    if (total === 0) {
        container.innerHTML = '<p class="text-on-surface-variant text-sm">Chưa có dữ liệu hành khách</p>';
        return;
    }

    const adultPercent = Math.round((categoryStats.totalAdults / total) * 100);
    const childPercent = 100 - adultPercent;

    container.innerHTML = `
        <div class="space-y-2">
            <div class="flex justify-between text-sm font-medium">
                <span>Người lớn (${categoryStats.totalAdults})</span>
                <span class="text-primary font-bold">${adultPercent}%</span>
            </div>
            <div class="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                <div class="bg-primary h-full transition-all duration-1000" style="width: ${adultPercent}%"></div>
            </div>
        </div>
        <div class="space-y-2">
            <div class="flex justify-between text-sm font-medium">
                <span>Trẻ em (${categoryStats.totalChildren})</span>
                <span class="text-primary font-bold">${childPercent}%</span>
            </div>
            <div class="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                <div class="bg-secondary h-full transition-all duration-1000" style="width: ${childPercent}%"></div>
            </div>
        </div>
    `;
}

function renderRecentBookings(bookings) {
    const tbody = document.getElementById('recent-bookings-list');
    tbody.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-8 py-10 text-center text-on-surface-variant">Chưa có đơn đặt tour nào</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-surface-container-high transition-colors group cursor-pointer';
        row.onclick = () => window.location.href = `../book-tour/book_detail.html?bookingId=${booking.booking_info_id}`;
        
        const statusClass = getStatusClass(booking.status);
        const initials = booking.contact_info.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        row.innerHTML = `
            <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        ${initials}
                    </div>
                    <div>
                        <p class="text-sm font-bold">${booking.contact_info.full_name}</p>
                        <p class="text-xs text-on-surface-variant">${booking.contact_info.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-8 py-5 text-sm font-medium">${booking.tour_info ? booking.tour_info.tour_name : 'N/A'}</td>
            <td class="px-8 py-5 text-sm text-on-surface-variant">${new Date(booking.createdAt).toLocaleDateString('vi-VN')}</td>
            <td class="px-8 py-5 text-sm font-bold text-primary">${formatCurrency(booking.total_price)}</td>
            <td class="px-8 py-5 text-right">
                <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${statusClass}">
                    ${translateStatus(booking.status)}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderTopTour(topTour) {
    const el = document.getElementById('hot-tour-name');
    if (topTour && topTour.tour_info) {
        el.textContent = topTour.tour_info.tour_name;
    } else {
        el.textContent = 'Chưa có dữ liệu';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function translateStatus(status) {
    const map = {
        'pending': 'Chờ thanh toán',
        'paid': 'Đã thanh toán',
        'confirmed': 'Đã xác nhận',
        'cancelled': 'Đã hủy',
        'completed': 'Hoàn tất'
    };
    return map[status] || status;
}

function getStatusClass(status) {
    const map = {
        'pending': 'bg-orange-100 text-orange-700',
        'paid': 'bg-green-100 text-green-700',
        'confirmed': 'bg-blue-100 text-blue-700',
        'cancelled': 'bg-red-100 text-red-700',
        'completed': 'bg-secondary-fixed text-on-secondary-fixed'
    };
    return map[status] || 'bg-surface-container-highest text-on-surface-variant';
}
