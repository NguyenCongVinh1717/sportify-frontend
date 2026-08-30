const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8081'
    : (window.__API_BASE__ || '/api');

const FALLBACK_API_BASE = 'https://sportify-backend-6dou.onrender.com';
let accessToken = null;

function normalizeBase(base) {
    return (base || '').replace(/\/$/, '');
}

function buildApiUrl(path, base = API_BASE) {
    if (path.startsWith('http')) return path;
    const normalizedBase = normalizeBase(base);
    return `${normalizedBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

function getCandidateApiUrls(path) {
    if (path.startsWith('http')) return [path];

    const bases = [normalizeBase(API_BASE)];
    if (normalizeBase(API_BASE) === '/api') {
        bases.push(normalizeBase(FALLBACK_API_BASE));
    }

    return bases.map(base => buildApiUrl(path, base));
}

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

    const candidateUrls = getCandidateApiUrls(path);
    const opts = { method, headers, credentials: 'include' };
    if (body != null) opts.body = isFormData ? body : JSON.stringify(body);

    let lastRes = null;
    let lastError = null;

    for (let i = 0; i < candidateUrls.length; i++) {
        const url = candidateUrls[i];
        try {
            const res = await fetch(url, opts);
            lastRes = res;

            // Nếu là lỗi 502/503/504 từ Render/Vercel rewrite, thử URL dự phòng tiếp theo nếu còn
            if ((res.status === 502 || res.status === 503 || res.status === 504) && i < candidateUrls.length - 1) {
                continue;
            }

            // 1. XỬ LÝ KHI ACCESS TOKEN HẾT HẠN HOẶC THIẾU QUYỀN (401 HOẶC 403)
            if ((res.status === 401 || res.status === 403) && !path.includes('/auth/refresh')) {
                try {
                    const newToken = await doRefresh();
                    headers['Authorization'] = `Bearer ${newToken}`;
                    const retryRes = await fetch(url, { ...opts, headers });
                    lastRes = retryRes;
                    if (retryRes.status === 401 || retryRes.status === 403) {
                        throw new Error('Phiên đăng nhập đã hết hạn.');
                    }
                    return await handleApiResponse(retryRes, path, redirectOnAuthError);
                } catch (e) {
                    accessToken = null;
                    ['role', 'fullName', 'email'].forEach(key => localStorage.removeItem(key));

                    if (redirectOnAuthError) {
                        const redirectUrl = encodeURIComponent(window.location.href);
                        window.location.href = `login.html?redirect=${redirectUrl}`;
                    }
                    throw new Error("Phiên đăng nhập đã hết hạn.");
                }
            }

            return await handleApiResponse(res, path, redirectOnAuthError);
        } catch (error) {
            lastError = error;
            if (i === candidateUrls.length - 1) {
                throw error;
            }
        }
    }

    if (lastRes) {
        return await handleApiResponse(lastRes, path, redirectOnAuthError);
    }

    throw lastError || new Error('Không thể kết nối tới máy chủ.');
}

async function handleApiResponse(res, path, redirectOnAuthError) {
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

    if (!res.ok) {
        if (data && typeof data === 'object' && !data.message && !data.error) {
            throw data;
        }

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