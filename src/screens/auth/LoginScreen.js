import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { sendOTP } from '../../services/authService';

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formatPhoneNumber = (text) => {
        // Remove non-numeric characters
        const cleaned = text.replace(/\D/g, '');
        // Limit to 10 digits
        const limited = cleaned.slice(0, 10);
        setPhoneNumber(limited);
    };

    const isValidPhone = phoneNumber.length === 10;

    const handleSendOTP = async () => {
        if (!isValidPhone) return;

        setIsLoading(true);
        try {
            const result = await sendOTP(phoneNumber);

            if (result.success) {
                // Navigate to OTP screen with phone number and expiry info
                navigation.navigate('OTP', {
                    phoneNumber,
                    expiresIn: result.data.expiresIn || 5,
                    otpCode: result.data.otpCode,
                });
            } else {
                Alert.alert(
                    'Lỗi',
                    result.error || 'Không thể gửi mã OTP. Vui lòng thử lại.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            Alert.alert(
                'Lỗi',
                'Đã xảy ra lỗi. Vui lòng thử lại.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="phone-portrait" size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Đăng nhập</Text>
                    <Text style={styles.subtitle}>
                        Nhập số điện thoại để nhận mã xác thực OTP
                    </Text>
                </View>

                {/* Phone Input */}
                <View style={styles.inputSection}>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <View style={[
                        styles.inputContainer,
                        isFocused && styles.inputContainerFocused,
                        isValidPhone && styles.inputContainerValid
                    ]}>
                        <View style={styles.countryCode}>
                            <Text style={styles.flag}>🇻🇳</Text>
                            <Text style={styles.codeText}>+84</Text>
                        </View>
                        <View style={styles.divider} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số điện thoại"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={formatPhoneNumber}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            maxLength={10}
                            editable={!isLoading}
                        />
                        {isValidPhone && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                        )}
                    </View>
                    <Text style={styles.hint}>
                        Ví dụ: 0901234567
                    </Text>
                </View>

                {/* Benefits */}
                <View style={styles.benefits}>
                    <View style={styles.benefitItem}>
                        <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                        <Text style={styles.benefitText}>Bảo mật an toàn</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="flash" size={20} color={colors.primary} />
                        <Text style={styles.benefitText}>Đăng nhập nhanh</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Ionicons name="sync" size={20} color={colors.primary} />
                        <Text style={styles.benefitText}>Đồng bộ dữ liệu</Text>
                    </View>
                </View>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.loginButton, (!isValidPhone || isLoading) && styles.buttonDisabled]}
                    onPress={handleSendOTP}
                    disabled={!isValidPhone || isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.textLight} />
                    ) : (
                        <>
                            <Text style={styles.loginButtonText}>Gửi mã OTP</Text>
                            <Ionicons name="arrow-forward" size={20} color={colors.textLight} />
                        </>
                    )}
                </TouchableOpacity>

                {/* Skip Option */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => navigation.navigate('MainTabs')}
                    activeOpacity={0.7}
                    disabled={isLoading}
                >
                    <Text style={styles.skipButtonText}>Bỏ qua, dùng thử trước</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    backButton: {
        position: 'absolute',
        top: spacing.xl,
        left: spacing.lg,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        ...shadows.sm,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        alignItems: 'center',
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    inputSection: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.bodySmall,
        color: colors.textPrimary,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        height: 60,
        ...shadows.sm,
    },
    inputContainerFocused: {
        borderColor: colors.primary,
    },
    inputContainerValid: {
        borderColor: colors.success,
    },
    countryCode: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flag: {
        fontSize: 24,
        marginRight: spacing.xs,
    },
    codeText: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
    },
    input: {
        flex: 1,
        ...typography.body,
        color: colors.textPrimary,
        fontSize: 18,
        letterSpacing: 1,
    },
    hint: {
        ...typography.caption,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    benefits: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.sm,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    benefitText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    spacer: {
        flex: 1,
    },
    loginButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        minHeight: 52,
    },
    buttonDisabled: {
        backgroundColor: colors.border,
    },
    loginButtonText: {
        ...typography.button,
        color: colors.textLight,
        marginRight: spacing.sm,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.lg,
    },
    skipButtonText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
});

export default LoginScreen;
