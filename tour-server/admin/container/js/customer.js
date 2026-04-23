document.addEventListener('DOMContentLoaded', () => {
    // List Page Logic
    const tbody = document.getElementById('customer-table-body');
    if (tbody) {
        fetchCustomers();
    }

    // Detail Page Logic
    const detailContainer = document.getElementById('customer-name'); // Using one of the IDs from detail page
    if (detailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        if (email) {
            fetchCustomerDetail(email);
        }
    }
});

// --- Common Functions ---

function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa cập nhật";
    return date.toLocaleDateString('vi-VN');
}

// --- List Page Functions ---

async function fetchCustomers() {
    try {
        const response = await fetch('/api/users/view-customer');
        const result = await response.json();

        if (result.success) {
            renderCustomers(result.data);
        } else {
            console.error('Failed to fetch customers:', result.message);
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

function renderCustomers(customers) {
    const tbody = document.getElementById('customer-table-body');
    const stats = document.getElementById('customer-stats');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    customers.forEach(customer => {
        const initials = getInitials(customer.full_name || "");
        const row = document.createElement('tr');
        row.className = 'group hover:bg-surface-container-high transition-colors';
        
        row.innerHTML = `
            <td class="px-6 py-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-headline">
                        ${initials}
                    </div>
                    <div>
                        <p class="font-bold text-on-surface text-sm">${customer.full_name || ''}</p>
                        <p class="text-[10px] text-primary font-bold uppercase">Member</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-6">
                <div class="flex flex-col">
                    <span class="text-sm text-on-surface font-medium">${customer.email || ''}</span>
                    <span class="text-xs text-on-surface-variant">${customer.phone || ''}</span>
                </div>
            </td>
            <td class="px-6 py-6 text-sm text-on-surface-variant">${formatDate(customer.dob)}</td>
            <td class="px-6 py-6 text-sm text-on-surface-variant max-w-[150px] truncate">${customer.add || ''}</td>
            <td class="px-6 py-6 text-sm text-on-surface-variant italic max-w-[200px] truncate">${customer.bio || ''}</td>
            <td class="px-6 py-6 text-center">
                <span class="px-3 py-1 ${customer.verifies_status == 1 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'} rounded-full text-[10px] font-bold uppercase tracking-wide">
                    ${customer.verifies_status == 1 ? 'Đã xác nhận' : 'Chưa xác nhận'}
                </span>
            </td>
            <td class="px-6 py-6">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="window.location.href='customer_detail.html?email=${customer.email}'" class="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm" title="Xem">
                        <span class="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button class="w-9 h-9 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm" title="Sửa">
                        <span class="material-symbols-outlined text-[20px]">edit_square</span>
                    </button>
                    <button class="w-9 h-9 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm" title="Xóa">
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (stats) {
        stats.textContent = `Hiển thị ${customers.length} khách hàng`;
    }
}

// --- Detail Page Functions ---

async function fetchCustomerDetail(email) {
    try {
        const response = await fetch('/api/users/view-customer');
        const result = await response.json();

        if (result.success) {
            const customer = result.data.find(c => c.email === email);
            if (customer) {
                renderCustomerDetail(customer);
            } else {
                console.error('Customer not found');
            }
        }
    } catch (error) {
        console.error('Error fetching customer detail:', error);
    }
}

function renderCustomerDetail(customer) {
    // Basic Info
    const nameEl = document.getElementById('customer-name');
    const emailEl = document.getElementById('customer-email');
    const phoneEl = document.getElementById('customer-phone');
    const dobEl = document.getElementById('customer-dob');
    const addressEl = document.getElementById('customer-address');
    const bioEl = document.getElementById('customer-bio');

    if (nameEl) nameEl.textContent = customer.full_name || 'Chưa cập nhật';
    if (emailEl) emailEl.textContent = customer.email || 'Chưa cập nhật';
    if (phoneEl) phoneEl.textContent = customer.phone || 'Chưa cập nhật';
    if (dobEl) dobEl.textContent = formatDate(customer.dob);
    if (addressEl) addressEl.textContent = customer.add || 'Chưa cập nhật';
    if (bioEl) bioEl.textContent = customer.bio ? `"${customer.bio}"` : '"Chưa có tiểu sử"';

    // Avatar & Initials
    const avatar = document.getElementById('customer-avatar');
    const initialsDiv = document.getElementById('customer-initials');
    
    if (avatar && initialsDiv) {
        if (customer.avatar && customer.avatar !== 'null' && customer.avatar !== '') {
            avatar.src = customer.avatar;
            avatar.classList.remove('hidden');
            initialsDiv.classList.add('hidden');
        } else {
            avatar.classList.add('hidden');
            initialsDiv.textContent = getInitials(customer.full_name || "Guest");
            initialsDiv.classList.remove('hidden');
        }
    }

    // Cover Image
    const cover = document.getElementById('customer-cover');
    if (cover && customer.background && customer.background !== 'null' && customer.background !== '') {
        cover.src = customer.background;
    }

    // Status Badge
    const badge = document.getElementById('customer-status-badge');
    if (badge) {
        if (customer.verifies_status == 1) {
            badge.textContent = 'Đã xác nhận';
            badge.className = 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200';
        } else {
            badge.textContent = 'Chưa xác nhận';
            badge.className = 'bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200';
        }
    }

    // Member Since
    const memberSince = document.getElementById('member-since');
    if (memberSince && customer.createdAt) {
        const joinDate = new Date(customer.createdAt);
        memberSince.textContent = `• Thành viên từ ${joinDate.getFullYear()}`;
    }
}
