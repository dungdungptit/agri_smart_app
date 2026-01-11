import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { verifyOTP, sendOTP } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const OTPScreen = ({ navigation, route }) => {
    const { phoneNumber, expiresIn = 5 } = route.params || { phoneNumber: '0901234567' };
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(expiresIn * 60); // Convert minutes to seconds
    const [canResend, setCanResend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef([]);
    const { login } = useAuth();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (newOtp.every(digit => digit !== '')) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (code) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const result = await verifyOTP(phoneNumber, code);

            if (result.success) {
                // Save token and user to auth context
                const loginResult = await login(result.data.token, result.data.user);

                if (loginResult.success) {
                    // Show success message for new users
                    if (result.data.isNewUser) {
                        Alert.alert(
                            'Chào mừng!',
                            'Tài khoản của bạn đã được tạo thành công.',
                            [
                                {
                                    text: 'Tiếp tục',
                                    onPress: () => navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'MainTabs' }],
                                    }),
                                }
                            ]
                        );
                    } else {
                        // Navigate directly for returning users
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTabs' }],
                        });
                    }
                } else {
                    Alert.alert('Lỗi', loginResult.error || 'Không thể lưu thông tin đăng nhập');
                }
            } else {
                Alert.alert(
                    'Lỗi',
                    result.error || 'Mã OTP không đúng. Vui lòng thử lại.',
                    [{ text: 'OK' }]
                );
                // Clear OTP inputs on error
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            Alert.alert(
                'Lỗi',
                'Đã xảy ra lỗi. Vui lòng thử lại.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const result = await sendOTP(phoneNumber);

            if (result.success) {
                setCountdown((result.data.expiresIn || 5) * 60);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();

                Alert.alert(
                    'Đã gửi lại',
                    result.message || 'Mã OTP mới đã được gửi đến số điện thoại của bạn.',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Lỗi',
                    result.error || 'Không thể gửi lại mã OTP.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
        } finally {
            setIsResending(false);
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    // Format countdown as mm:ss
    const formatCountdown = () => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    disabled={isLoading}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="mail-open" size={40} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Xác thực OTP</Text>
                    <Text style={styles.subtitle}>
                        Nhập mã 6 số đã gửi đến số điện thoại
                    </Text>
                    <Text style={styles.phoneNumber}>+84 {phoneNumber}</Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => inputRefs.current[index] = ref}
                            style={[
                                styles.otpInput,
                                digit && styles.otpInputFilled,
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            autoFocus={index === 0}
                            editable={!isLoading}
                        />
                    ))}
                </View>

                {/* Countdown / Resend */}
                <View style={styles.resendContainer}>
                    {canResend ? (
                        <TouchableOpacity
                            onPress={handleResend}
                            activeOpacity={0.7}
                            disabled={isResending}
                        >
                            {isResending ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Text style={styles.resendButton}>Gửi lại mã OTP</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.countdown}>
                            Gửi lại mã sau <Text style={styles.countdownNumber}>{formatCountdown()}</Text>
                        </Text>
                    )}
                </View>

                {/* Info Hint */}
                <View style={styles.infoHint}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={styles.infoHintText}>
                        Mã OTP sẽ được gửi qua SMS. Nếu không nhận được, vui lòng liên hệ quản trị viên.
                    </Text>
                </View>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.verifyButton, (!isComplete || isLoading) && styles.buttonDisabled]}
                    onPress={() => handleVerify(otp.join(''))}
                    disabled={!isComplete || isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.textLight} />
                    ) : (
                        <>
                            <Text style={styles.verifyButtonText}>Xác nhận</Text>
                            <Ionicons name="checkmark-circle" size={20} color={colors.textLight} />
                        </>
                    )}
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
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    backButton: {
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        alignSelf: 'flex-start',
    },
    header: {
        alignItems: 'center',
        paddingTop: spacing.lg,
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
    },
    phoneNumber: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
        marginTop: spacing.xs,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    otpInput: {
        width: 48,
        height: 56,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: colors.textPrimary,
        ...shadows.sm,
    },
    otpInputFilled: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight + '10',
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: spacing.xl,
        minHeight: 24,
    },
    countdown: {
        ...typography.body,
        color: colors.textSecondary,
    },
    countdownNumber: {
        color: colors.primary,
        fontWeight: '600',
    },
    resendButton: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
    infoHint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.info + '15',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.lg,
    },
    infoHintText: {
        ...typography.bodySmall,
        color: colors.info,
        marginLeft: spacing.sm,
        flex: 1,
        lineHeight: 20,
    },
    spacer: {
        flex: 1,
    },
    verifyButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xl,
        minHeight: 52,
    },
    buttonDisabled: {
        backgroundColor: colors.border,
    },
    verifyButtonText: {
        ...typography.button,
        color: colors.textLight,
        marginRight: spacing.sm,
    },
});

export default OTPScreen;
