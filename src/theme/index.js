// Trợ lý AI Nông nghiệp tỉnh Điện Biên Design System - Colors & Theme
export const colors = {
    // Primary - Agricultural Green
    primary: '#2E7D32',
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    primaryGradientStart: '#43A047',
    primaryGradientEnd: '#2E7D32',

    // Secondary - Earth Brown
    secondary: '#795548',
    secondaryLight: '#8D6E63',
    secondaryDark: '#5D4037',

    // Accent - Sunshine Yellow
    accent: '#FFC107',
    accentLight: '#FFD54F',
    accentDark: '#FFA000',

    // Weather Colors
    weatherSunny: '#FF9800',
    weatherRainy: '#42A5F5',
    weatherCloudy: '#78909C',
    weatherStormy: '#5C6BC0',

    // Status Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Background & Surface
    background: '#F5F7F5',
    backgroundDark: '#1A1A1A',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Text
    textPrimary: '#212121',
    textSecondary: '#757575',
    textLight: '#FFFFFF',
    textMuted: '#9E9E9E',

    // Border & Divider
    border: '#E0E0E0',
    divider: '#EEEEEE',

    // Gradient Overlays
    overlayLight: 'rgba(255, 255, 255, 0.9)',
    overlayDark: 'rgba(0, 0, 0, 0.5)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700',
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
    },
};

export default {
    colors,
    spacing,
    borderRadius,
    shadows,
    typography,
};
