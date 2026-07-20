const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8081'
    : '/api';
let accessToken = null;

// ✨ THÊM MỚI: giữ 1 Promise refresh đang chạy (nếu có), để mọi request 401 xảy ra
// gần như cùng lúc đều CHỜ CHUNG kết quả của đúng 1 lần gọi /auth/refresh, thay vì
// mỗi request tự bắn 1 lệnh refresh riêng (gây đụng độ nếu backend dùng refresh token
// xoay vòng — refresh token cũ bị vô hiệu ngay sau lần refresh đầu tiên thành công).
let refreshPromise = null;

async function doRefresh() {
    if (refreshPromise) {
        // Đã có 1 lần refresh khác đang chạy -> chờ chung, không gọi thêm
        return refreshPromise;
    }

    refreshPromise = (async () => {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!refreshRes.ok) {
            throw new Error("Refresh token expired");
        }

        const data = await refreshRes.json();
        accessToken = data.accessToken;
        return accessToken;
    })();

    try {
        return await refreshPromise;
    } finally {
        // Dọn lại để lần accessToken hết hạn KẾ TIẾP vẫn refresh được bình thường
        refreshPromise = null;
    }
}

async function apiFetch(path, { method = 'GET', body = null, redirectOnAuthError = false } = {}) {
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };

    // Tự động gắn AccessToken từ bộ nhớ vào Header
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
    const opts = { method, headers, credentials: 'include' };
    if (body != null) opts.body = isFormData ? body : JSON.stringify(body);

    let res = await fetch(url, opts);

    // 1. XỬ LÝ KHI ACCESS TOKEN HẾT HẠN HOẶC THIẾU QUYỀN (401 HOẶC 403)
    if ((res.status === 401 || res.status === 403) && !path.includes('/auth/refresh')) {
        try {
            // ✨ SỬA: dùng doRefresh() dùng chung thay vì mỗi request tự fetch('/auth/refresh') riêng
            const newToken = await doRefresh();

            // Thử lại request ban đầu với token mới vừa nhận được
            headers['Authorization'] = `Bearer ${newToken}`;
            res = await fetch(url, { ...opts, headers });
        } catch (e) {
            // Chỉ xoá dữ liệu xác thực, không ép redirect cho các trang công khai
            accessToken = null;
            ['role', 'fullName', 'email'].forEach(key => localStorage.removeItem(key));

            if (redirectOnAuthError) {
                const redirectUrl = encodeURIComponent(window.location.href);
                window.location.href = `login.html?redirect=${redirectUrl}`;
            }
            throw new Error("Phiên đăng nhập đã hết hạn.");
        }
    }

    // 2. Xử lý lưu Access Token khi đăng nhập thành công
    if (res.ok && (path.includes('/login') || path.includes('/verify-otp') || path.includes('/google'))) {
        const data = await res.json();
        accessToken = data.accessToken;
        return data;
    }

    // 3. Xử lý phản hồi từ server
    if (res.status === 204) return null;

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

    // 💥 ĐOẠN ĐƯỢC CẢI TIẾN: XỬ LÝ NÉM LỖI THÔNG MINH HƠN
    if (!res.ok) {
        // Nếu Server trả về dạng Object chứa Map lỗi Validation (không có trường .message cố định)
        if (data && typeof data === 'object' && !data.message && !data.error) {
            throw data; // Ném nguyên Object ròng { password: "...", email: "..." } về cho HTML tự xử lý
        }

        // Nếu có trường message hoặc error cụ thể từ Backend hoặc lỗi text thuần
        throw new Error((data && (data.message || data.error)) || `Lỗi ${res.status}`);
    }

    return data;
}

// Hàm hỗ trợ đăng xuất sạch
window.apiLogout = async () => {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {
        console.error("Lỗi hệ thống khi gọi API đăng xuất:", e);
    } finally {
        // Chỉ dọn dẹp biến và bộ nhớ lưu trữ
        accessToken = null;
        ['role', 'fullName', 'email'].forEach(key => localStorage.removeItem(key));
    }
};
window.apiGet = (path, options = {}) => apiFetch(path, { method: 'GET', ...options });
window.apiPost = (path, body, options = {}) => apiFetch(path, { method: 'POST', body, ...options });
window.apiPut = (path, body, options = {}) => apiFetch(path, { method: 'PUT', body, ...options });
window.apiDelete = (path, options = {}) => apiFetch(path, { method: 'DELETE', ...options });