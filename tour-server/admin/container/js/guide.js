document.addEventListener('DOMContentLoaded', () => {
    // List Page Logic
    const guideList = document.getElementById('guide-list');
    if (guideList) {
        fetchGuides();
    }

    // Add Page Logic (Add / View / Edit)
    const form = document.getElementById('guide-form');
    const urlParams = new URLSearchParams(window.location.search);
    const guideId = urlParams.get('id');
    const isEditMode = urlParams.get('edit') === 'true';

    if (form) {
        if (guideId) {
            const pageTitle = document.querySelector('h2');
            const submitBtn = form.querySelector('button[type="submit"]');
            const passwordInput = document.getElementById('password');

            if (isEditMode) {
                // --- Edit Mode ---
                if (pageTitle) pageTitle.textContent = 'Chỉnh sửa thông tin Hướng Dẫn Viên';
                if (submitBtn) submitBtn.innerHTML = '<span>Cập nhật thông tin</span>';
                
                // Show security section but update labels/placeholders
                if (passwordInput) {
                    const securitySection = passwordInput.closest('section');
                    if (securitySection) {
                        securitySection.style.display = 'block';
                        const h3 = securitySection.querySelector('h3');
                        if (h3) h3.textContent = 'Bảo mật tài khoản';
                    }
                }
            } else {
                // --- View Mode ---
                if (pageTitle) pageTitle.textContent = 'Thông tin chi tiết Hướng Dẫn Viên';
                if (submitBtn) submitBtn.style.display = 'none';
                
                // Hide security section
                if (passwordInput) {
                    const securitySection = passwordInput.closest('section');
                    if (securitySection) securitySection.style.display = 'none';
                }

                // Hide camera button
                const cameraBtn = document.querySelector('label[for="avatar-input"]');
                if (cameraBtn) cameraBtn.style.display = 'none';

                // Disable all inputs and select
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    if (input.type !== 'file') {
                        input.readOnly = true;
                        input.disabled = true;
                        input.classList.add('bg-surface-container');
                    } else {
                        input.disabled = true;
                    }
                });

                // Also disable the status toggle buttons
                const btn1 = document.getElementById('btn-status-1');
                const btn0 = document.getElementById('btn-status-0');
                if (btn1) { btn1.onclick = null; btn1.style.cursor = 'default'; }
                if (btn0) { btn0.onclick = null; btn0.style.cursor = 'default'; }
            }

            // Fetch and fill data (used by both View and Edit)
            fetchGuideDetails(guideId);
        } else {
            // --- Add Mode ---
            if (typeof fetchAddGuideSkills === 'function') {
                fetchAddGuideSkills();
            }
            // Initialize default status to "Đã xác nhận" (1)
            if (typeof updateVerifiesStatus === 'function') {
                updateVerifiesStatus(1);
            }
        }
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const isUpdating = !!guideId && isEditMode;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;

            // Validate password:
            // - If adding: must not be empty and must match.
            // - If updating: only validate if password is not empty.
            if (!isUpdating) {
                if (!password) {
                    showNotification('Vui lòng nhập mật khẩu!', 'error');
                    return;
                }
                if (password !== confirmPassword) {
                    showNotification('Mật khẩu xác nhận không khớp!', 'error');
                    return;
                }
            } else {
                if (password && password !== confirmPassword) {
                    showNotification('Mật khẩu xác nhận không khớp!', 'error');
                    return;
                }
            }

            const formData = new FormData();
            formData.append('full_name', document.getElementById('full_name').value);
            formData.append('email', document.getElementById('email').value);
            
            // Chỉ gửi password nếu đang thêm mới HOẶC nếu đang cập nhật và password không trống
            if (!isUpdating || (isUpdating && password)) {
                formData.append('password', password);
            }

            formData.append('phone', document.getElementById('phone').value);
            formData.append('dob', document.getElementById('dob').value);
            formData.append('add', document.getElementById('add').value);
            formData.append('bio', document.getElementById('bio').value);

            // Thu thập trạng thái xác nhận
            const verifiesInput = document.getElementById('verifies_status');
            if (verifiesInput) formData.append('verifies_status', verifiesInput.value);

            // Thu thập Kỹ năng
            const selectedLanguages = Array.from(document.querySelectorAll('input[name="guide_languages"]:checked')).map(cb => cb.value);
            const selectedFields = Array.from(document.querySelectorAll('input[name="guide_fields"]:checked')).map(cb => cb.value);
            formData.append('languages', JSON.stringify(selectedLanguages));
            formData.append('fields', JSON.stringify(selectedFields));

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

                const url = isUpdating ? `/api/guides/update-guide/${guideId}` : '/api/guides/create-guide';
                const response = await fetch(url, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    showNotification(isUpdating ? 'Cập nhật thành công!' : 'Thêm thành công!', 'success');
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

// --- Add Guide Skills Functions ---
async function fetchAddGuideSkills(selectedLangs = [], selectedFields = []) {
    try {
        const [langRes, fieldRes] = await Promise.all([
            fetch('/api/guides/get-languages'),
            fetch('/api/guides/get-fields')
        ]);
        
        const langData = await langRes.json();
        const fieldData = await fieldRes.json();
        
        const urlParams = new URLSearchParams(window.location.search);
        const isEditMode = urlParams.get('edit') === 'true';
        const isViewMode = urlParams.get('id') !== null && !isEditMode;

        const langContainer = document.getElementById('add-guide-language-list');
        if (langContainer && langData.success) {
            let languagesToRender = langData.data;
            if (isViewMode) {
                languagesToRender = languagesToRender.filter(lang => selectedLangs.includes(lang.guide_lan_id));
            }

            langContainer.innerHTML = languagesToRender.map(lang => {
                const isChecked = selectedLangs.includes(lang.guide_lan_id) ? 'checked' : '';
                const isDisabled = isViewMode ? 'disabled' : '';
                return `
                    <label class="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded cursor-pointer transition-colors">
                        <input type="checkbox" name="guide_languages" value="${lang.guide_lan_id}" ${isChecked} ${isDisabled} class="w-4 h-4 text-primary rounded border-outline-variant/50 focus:ring-primary focus:ring-2">
                        <span class="text-sm font-medium flex items-center gap-2">
                            <span>${getLanguageFlag(lang.country_code)}</span>
                            ${lang.guide_lan_name}
                        </span>
                    </label>
                `;
            }).join('') || `<p class="text-xs text-on-surface-variant italic">${isViewMode ? 'Chưa chọn ngôn ngữ nào.' : 'Chưa có ngôn ngữ nào trong hệ thống.'}</p>`;
        }

        const fieldContainer = document.getElementById('add-guide-field-list');
        if (fieldContainer && fieldData.success) {
            let fieldsToRender = fieldData.data;
            if (isViewMode) {
                fieldsToRender = fieldsToRender.filter(field => selectedFields.includes(field.guide_fie_id));
            }

            fieldContainer.innerHTML = fieldsToRender.map(field => {
                const isChecked = selectedFields.includes(field.guide_fie_id) ? 'checked' : '';
                const isDisabled = isViewMode ? 'disabled' : '';
                return `
                    <label class="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded cursor-pointer transition-colors">
                        <input type="checkbox" name="guide_fields" value="${field.guide_fie_id}" ${isChecked} ${isDisabled} class="w-4 h-4 text-primary rounded border-outline-variant/50 focus:ring-primary focus:ring-2">
                        <div class="flex flex-col">
                            <span class="text-sm font-medium">${field.guide_fie_name}</span>
                            ${field.guide_fie_desc ? `<span class="text-[10px] text-on-surface-variant">${field.guide_fie_desc}</span>` : ''}
                        </div>
                    </label>
                `;
            }).join('') || `<p class="text-xs text-on-surface-variant italic">${isViewMode ? 'Chưa chọn lĩnh vực nào.' : 'Chưa có lĩnh vực nào trong hệ thống.'}</p>`;
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu kỹ năng:', error);
    }
}

async function fetchGuideDetails(id) {
    try {
        const response = await fetch(`/api/guides/get-guide/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const guide = result.data;
            
            // Điền thông tin cơ bản
            document.getElementById('full_name').value = guide.full_name || '';
            document.getElementById('email').value = guide.email || '';
            document.getElementById('phone').value = guide.phone || '';
            if (guide.dob) {
                document.getElementById('dob').value = guide.dob.split('T')[0];
            }
            document.getElementById('add').value = guide.add || '';
            document.getElementById('bio').value = guide.bio || '';

            // Trạng thái xác nhận
            const verifiesStatus = guide.verifies_status !== undefined ? guide.verifies_status : 0;
            if (typeof updateVerifiesStatus === 'function') {
                updateVerifiesStatus(verifiesStatus);
            }

            // Avatar
            if (guide.avatar) {
                const preview = document.getElementById('preview-avatar');
                if (preview) {
                    const icon = preview.previousElementSibling;
                    preview.src = guide.avatar;
                    preview.classList.remove('hidden');
                    if (icon) icon.classList.add('hidden');
                }
            }

            // Tải kỹ năng và tick chọn
            fetchAddGuideSkills(guide.languages || [], guide.fields || []);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Error fetching details:', error);
        showNotification('Lỗi khi tải dữ liệu', 'error');
    }
}

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
                        <button onclick="window.location.href='guide_add.html?id=${guide.user_id}'" class="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm" title="Xem">
                            <span class="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button onclick="window.location.href='guide_add.html?id=${guide.user_id}&edit=true'" class="w-9 h-9 flex items-center justify-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm" title="Sửa">
                            <span class="material-symbols-outlined text-[20px]">edit_square</span>
                        </button>
                        <button onclick="confirmDeleteGuide('${guide.user_id}', '${guide.full_name || 'Hướng dẫn viên'}')" class="w-9 h-9 flex items-center justify-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-sm" title="Xóa">
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

// --- Languages & Fields Functions ---
async function fetchLanguages() {
    try {
        const response = await fetch('/api/guides/get-languages');
        const result = await response.json();
        if (result.success) {
            renderLanguages(result.data);
        } else {
            console.error('Lỗi lấy ngôn ngữ:', result.message);
        }
    } catch (error) {
        console.error('Lỗi kết nối server khi lấy ngôn ngữ:', error);
    }
}

function getLanguageFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const code = countryCode.toUpperCase();
    // Chuyển đổi mã 2 chữ cái (VD: VN, US) thành mã Unicode Emoji Cờ
    const codePoints = code.split('').map(char => 127397 + char.charCodeAt());
    try {
        return String.fromCodePoint(...codePoints);
    } catch (e) {
        return '🌐';
    }
}

function renderLanguages(languages) {
    const list = document.getElementById('language-list');
    if (!list) return;
    list.innerHTML = '';
    languages.forEach(lang => {
        const flag = getLanguageFlag(lang.country_code);
        list.innerHTML += `
            <div class="flex items-center justify-between p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container-high transition-colors">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">${flag}</div>
                    <div>
                        <p class="text-sm font-semibold">${lang.guide_lan_name}</p>
                    </div>
                </div>
                <button class="text-error opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-xl" data-icon="close">close</span>
                </button>
            </div>
        `;
    });
}

async function fetchFields() {
    try {
        const response = await fetch('/api/guides/get-fields');
        const result = await response.json();
        if (result.success) {
            renderFields(result.data);
        } else {
            console.error('Lỗi lấy lĩnh vực:', result.message);
        }
    } catch (error) {
        console.error('Lỗi kết nối server khi lấy lĩnh vực:', error);
    }
}

function renderFields(fields) {
    const grid = document.getElementById('field-list-grid');
    if (!grid) return;
    
    // Xóa các card cũ đi (nhưng giữ lại card Thêm lĩnh vực)
    // Cách an toàn: Tạo HTML các field rồi cộng thêm HTML của nút Thêm
    let fieldsHtml = '';
    
    // Danh sách icon xoay vòng cho đẹp
    const icons = ['history_edu', 'restaurant', 'hiking', 'palette', 'flight', 'map', 'explore'];
    const colors = ['primary', 'secondary', 'tertiary', 'error'];

    fields.forEach((field, index) => {
        const icon = icons[index % icons.length];
        const color = colors[index % colors.length];
        fieldsHtml += `
            <div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all flex flex-col h-full">
                <div class="w-12 h-12 bg-${color}/10 rounded-full flex items-center justify-center text-${color} mb-4">
                    <span class="material-symbols-outlined" data-icon="${icon}">${icon}</span>
                </div>
                <h3 class="text-lg font-bold mb-2">${field.guide_fie_name}</h3>
                <p class="text-sm text-on-surface-variant mb-4 flex-grow">${field.guide_fie_desc || 'Không có mô tả chi tiết.'}</p>
            </div>
        `;
    });

    // Thêm card nút "Thêm lĩnh vực" ở cuối cùng
    const addCardHtml = `
        <div onclick="openFieldModal()" class="bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container transition-all h-full min-h-[200px]">
            <div class="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:scale-110 group-hover:bg-primary group-hover:text-on-primary transition-all mb-3">
                <span class="material-symbols-outlined" data-icon="add">add</span>
            </div>
            <p class="text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">Thêm lĩnh vực</p>
        </div>
    `;

    grid.innerHTML = fieldsHtml + addCardHtml;
}
// --- Verification Status Toggle ---
window.updateVerifiesStatus = function(status) {
    const hiddenInput = document.getElementById('verifies_status');
    const btn1 = document.getElementById('btn-status-1');
    const btn0 = document.getElementById('btn-status-0');
    
    if (!hiddenInput || !btn1 || !btn0) return;
    
    hiddenInput.value = status;
    
    // Reset styles for both
    const baseClass = "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-300";
    const inactiveClass = " text-on-surface-variant hover:bg-surface-container-high";
    
    btn1.className = baseClass + inactiveClass;
    btn0.className = baseClass + inactiveClass;
    
    if (status == 1) {
        btn1.className = baseClass + " bg-green-500 text-white shadow-lg shadow-green-200";
    } else {
        btn0.className = baseClass + " bg-red-500 text-white shadow-lg shadow-red-200";
    }
};

window.confirmDeleteGuide = async function(id, name) {
    if (confirm(`Bạn có chắc chắn muốn xóa hướng dẫn viên "${name}"?\nHành động này sẽ xóa toàn bộ dữ liệu, tài khoản và hình ảnh trên hệ thống (không thể khôi phục).`)) {
        try {
            const response = await fetch(`/api/guides/delete-guide/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.success) {
                showNotification('Xóa hướng dẫn viên thành công');
                fetchGuides(); // Tải lại danh sách
            } else {
                showNotification(result.message || 'Lỗi khi xóa', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showNotification('Lỗi kết nối máy chủ khi xóa', 'error');
        }
    }
}
