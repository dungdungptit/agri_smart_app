/**
 * Location Service
 * Handles user location-related API calls
 */

// Get API base URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.dienbien-smart-agri.app/api/v1';

/**
 * Update user's location
 * @param {string} token - JWT token
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const updateMyLocation = async (token, latitude, longitude) => {
    try {
        const response = await fetch(`${API_BASE_URL}/locations/update-my-location`, {
            method: 'PATCH',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ latitude, longitude }),
        });

        const data = await response.json();

        if (data.status === 'success') {
            return {
                success: true,
                data: {
                    user: data.data.user,
                    location: data.data.location,
                },
                message: data.message,
            };
        } else {
            return {
                success: false,
                error: data.message || 'Không thể cập nhật vị trí',
            };
        }
    } catch (error) {
        console.error('updateMyLocation error:', error);
        return {
            success: false,
            error: 'Lỗi kết nối. Vui lòng thử lại.',
        };
    }
};

/**
 * Get user's saved location
 * @param {string} token - JWT token
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getMyLocation = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/locations/my-location`, {
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
                    location: data.data.location,
                },
            };
        } else {
            return {
                success: false,
                error: data.message || 'Không thể lấy vị trí',
            };
        }
    } catch (error) {
        console.error('getMyLocation error:', error);
        return {
            success: false,
            error: 'Lỗi kết nối. Vui lòng thử lại.',
        };
    }
};
