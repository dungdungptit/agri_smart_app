import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../../theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primaryGradientStart, colors.primaryGradientEnd, colors.primaryDark]}
                style={styles.gradient}
            >
                {/* Background Pattern */}
                <View style={styles.patternContainer}>
                    <Text style={styles.patternEmoji}>🌾</Text>
                    <Text style={[styles.patternEmoji, styles.pattern2]}>🌿</Text>
                    <Text style={[styles.patternEmoji, styles.pattern3]}>🌱</Text>
                    <Text style={[styles.patternEmoji, styles.pattern4]}>🍃</Text>
                    <Text style={[styles.patternEmoji, styles.pattern5]}>☀️</Text>
                </View>

                {/* Logo Container */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Image
                            source={require('../../../assets/logo.webp')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.appNamePrimary}>Điện Biên</Text>
                    <Text style={styles.appNameSecondary}>Smart Agri</Text>
                    <Text style={styles.tagline}>Nền tảng nông nghiệp thông minh tỉnh Điện Biên</Text>
                </View>

                {/* Loading Indicator */}
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingDots}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                    </View>
                    <Text style={styles.loadingText}>Đang khởi động...</Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>Phiên bản 1.0.0</Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    patternContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.15,
    },
    patternEmoji: {
        position: 'absolute',
        fontSize: 60,
    },
    pattern2: {
        top: 100,
        right: 30,
        fontSize: 50,
        transform: [{ rotate: '15deg' }],
    },
    pattern3: {
        top: 200,
        left: 50,
        fontSize: 40,
    },
    pattern4: {
        bottom: 200,
        right: 50,
        fontSize: 55,
        transform: [{ rotate: '-20deg' }],
    },
    pattern5: {
        bottom: 300,
        left: 30,
        fontSize: 45,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    appNamePrimary: {
        ...typography.h1,
        fontSize: 38,
        color: colors.textLight,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 2,
    },
    appNameSecondary: {
        ...typography.h1,
        fontSize: 38,
        color: colors.textLight,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: 2,
        marginTop: 4,
    },
    tagline: {
        ...typography.body,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 120,
        alignItems: 'center',
    },
    loadingDots: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        marginHorizontal: 5,
    },
    dot1: {
        opacity: 1,
    },
    dot2: {
        opacity: 0.6,
    },
    dot3: {
        opacity: 0.3,
    },
    loadingText: {
        ...typography.bodySmall,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        ...typography.caption,
        color: 'rgba(255, 255, 255, 0.6)',
    },
});

export default SplashScreen;
