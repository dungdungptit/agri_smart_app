/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

// Get API base URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.dienbien-smart-agri.app/api/v1';

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number (e.g., "0869040236")
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const sendOTP = async (phoneNumber) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber }),
        });

        const data = await response.json();

        if (data.status === 'success') {
            return {
                success: true,
                data: {
                    phoneNumber: data.data.phoneNumber,
                    expiresAt: data.data.expiresAt,
                    expiresIn: data.data.expiresIn,
                },
                message: data.message,
            };
        } else {
            return {
                success: false,
                error: data.message || 'Không thể gửi mã OTP',
            };
        }
    } catch (error) {
        console.error('sendOTP error:', error);
        return {
            success: false,
            error: 'Lỗi kết nối. Vui lòng thử lại.',
        };
    }
};

/**
 * Verify OTP code
 * @param {string} phoneNumber - Phone number
 * @param {string} otpCode - 6-digit OTP code
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const verifyOTP = async (phoneNumber, otpCode) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber, otpCode }),
        });

        const data = await response.json();

        if (data.status === 'success') {
            return {
                success: true,
                data: {
                    user: data.data.user,
                    token: data.data.token,
                    tokenExpiration: data.data.tokenExpiration,
                    isNewUser: data.data.isNewUser,
                },
                message: data.message,
            };
        } else {
            return {
                success: false,
                error: data.message || 'Mã OTP không đúng',
            };
        }
    } catch (error) {
        console.error('verifyOTP error:', error);
        return {
            success: false,
            error: 'Lỗi kết nối. Vui lòng thử lại.',
        };
    }
};

/**
 * Get current user info
 * @param {string} token - JWT token
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getMe = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.status === 'success') {
            return {
                success: true,
                data: {
                    user: data.data.user,
                },
            };
        } else {
            return {
                success: false,
                error: data.message || 'Không thể lấy thông tin người dùng',
            };
        }
    } catch (error) {
        console.error('getMe error:', error);
        return {
            success: false,
            error: 'Lỗi kết nối. Vui lòng thử lại.',
        };
    }
};

/**
 * Logout user
 * @param {string} token - JWT token
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const logout = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.status === 'success') {
            return {
                success: true,
                message: data.message,
            };
        } else {
            return {
                success: false,
                error: data.message || 'Không thể đăng xuất',
            };
        }
    } catch (error) {
        console.error('logout error:', error);
        // Even if logout API fails, we still want to clear local state
        return {
            success: true,
            message: 'Đã đăng xuất',
        };
    }
};
