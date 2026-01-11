/**
 * Authentication Context
 * Manages authentication state across the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe, logout as logoutApi } from '../services/authService';

// Storage keys
const AUTH_TOKEN_KEY = '@auth_token';
const AUTH_USER_KEY = '@auth_user';

// Create context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wrap the app with this to provide auth state
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Load auth state from AsyncStorage on app start
    useEffect(() => {
        loadAuthState();
    }, []);

    /**
     * Load saved auth state from AsyncStorage
     */
    const loadAuthState = async () => {
        try {
            const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            const savedUser = await AsyncStorage.getItem(AUTH_USER_KEY);

            if (savedToken && savedUser) {
                // Verify token is still valid
                const result = await getMe(savedToken);

                if (result.success) {
                    setToken(savedToken);
                    setUser(result.data.user);
                    setIsLoggedIn(true);
                } else {
                    // Token expired or invalid, clear storage
                    await clearAuthState();
                }
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
            await clearAuthState();
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Save auth state to AsyncStorage and update context
     * @param {string} newToken - JWT token
     * @param {object} newUser - User object
     */
    const login = async (newToken, newUser) => {
        try {
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
            await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);
            setIsLoggedIn(true);

            return { success: true };
        } catch (error) {
            console.error('Error saving auth state:', error);
            return { success: false, error: 'Không thể lưu thông tin đăng nhập' };
        }
    };

    /**
     * Clear auth state and logout
     */
    const logout = async () => {
        try {
            // Call logout API if we have a token
            if (token) {
                await logoutApi(token);
            }
        } catch (error) {
            console.error('Logout API error:', error);
        }

        // Always clear local state
        await clearAuthState();
    };

    /**
     * Clear auth state from storage and context
     */
    const clearAuthState = async () => {
        try {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
            await AsyncStorage.removeItem(AUTH_USER_KEY);
        } catch (error) {
            console.error('Error clearing auth state:', error);
        }

        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
    };

    /**
     * Update user data in context and storage
     * @param {object} updatedUser - Updated user object
     */
    const updateUser = async (updatedUser) => {
        try {
            await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const value = {
        user,
        token,
        isLoading,
        isLoggedIn,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to use auth context
 * @returns {object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
