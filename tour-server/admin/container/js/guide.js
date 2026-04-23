document.addEventListener('DOMContentLoaded', () => {
    // List Page Logic
    const guideList = document.getElementById('guide-list');
    if (guideList) {
        fetchGuides();
    }

    // Add Page Logic
    const form = document.getElementById('guide-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            if (password !== confirmPassword) {
                showNotification('Mật khẩu xác nhận không khớp!', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('full_name', document.getElementById('full_name').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('password', password);
            formData.append('phone', document.getElementById('phone').value);
            formData.append('dob', document.getElementById('dob').value);
            formData.append('add', document.getElementById('add').value);
            formData.append('bio', document.getElementById('bio').value);

            const avatarFile = document.getElementById('avatar-input').files[0];
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang xử lý...</span>
                `;

                const response = await fetch('/api/guides/create-guide', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    showNotification('Thêm hướng dẫn viên thành công!', 'success');
                    setTimeout(() => {
                        window.location.href = 'guide.html';
                    }, 1500);
                } else {
                    showNotification(result.message || 'Có lỗi xảy ra', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Lỗi kết nối hệ thống', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});

// --- Common Functions ---

async function fetchGuides() {
    try {
        const response = await fetch('/api/guides/view-guide');
        const result = await response.json();

        if (result.success) {
            renderGuides(result.data);
        } else {
            console.error('Lỗi khi lấy danh sách hướng dẫn viên:', result.message);
        }
    } catch (error) {
        console.error('Error fetching guides:', error);
    }
}

function getInitials(name) {
    if (!name) return "VG";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderGuides(guides) {
    const guideList = document.getElementById('guide-list');
    if (!guideList) return;
    
    guideList.innerHTML = '';

    if (guides.length === 0) {
        guideList.innerHTML = `
            <tr>
                <td colspan="6" class="px-8 py-10 text-center text-on-surface-variant italic">
                    Chưa có hướng dẫn viên nào trong hệ thống.
                </td>
            </tr>
        `;
        return;
    }

    guides.forEach(guide => {
        const initials = getInitials(guide.full_name || "Guide");
        const avatarHtml = (guide.avatar && guide.avatar !== '') 
            ? `<img src="${guide.avatar}" class="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="${guide.full_name}">`
            : `<div class="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm shadow-sm">${initials}</div>`;

        const row = `
            <tr class="group hover:bg-surface-container-high transition-all duration-200">
                <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                        ${avatarHtml}
                        <div>
                            <p class="font-headline font-bold text-on-surface">${guide.full_name || 'Chưa cập nhật'}</p>
                            <p class="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-70">ID: ${guide._id.substring(18).toUpperCase()}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-6 text-sm">
                    <div class="flex flex-col gap-0.5">
                        <span class="font-semibold text-on-surface flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-xs text-primary">mail</span>
                            ${guide.email}
                        </span>
                        <span class="text-xs text-on-surface-variant flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-xs text-secondary">call</span>
                            ${guide.phone || 'Chưa cập nhật'}
                        </span>
                    </div>
                </td>
                <td class="px-6 py-6 text-sm text-on-surface-variant">
                    <div class="flex items-start gap-1.5">
                        <span class="material-symbols-outlined text-xs mt-0.5">location_on</span>
                        <span class="max-w-[180px] line-clamp-2">${guide.add || 'Chưa cập nhật'}</span>
                    </div>
                </td>
                <td class="px-6 py-6 text-sm text-on-surface-variant">
                    <p class="max-w-[200px] line-clamp-2 italic">"${guide.bio || 'Chưa có tiểu sử'}"</p>
                </td>
                <td class="px-6 py-6 text-center">
                    <span class="px-3 py-1.5 ${guide.verifies_status == 1 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'} rounded-full text-[10px] font-bold uppercase tracking-wide">
                        ${guide.verifies_status == 1 ? 'Đã xác nhận' : 'Chưa xác nhận'}
                    </span>
                </td>
                <td class="px-8 py-6">
                    <div class="flex items-center justify-center gap-2">
                        <button class="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm" title="Xem">
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
            </tr>
        `;
        guideList.insertAdjacentHTML('beforeend', row);
    });
}

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
