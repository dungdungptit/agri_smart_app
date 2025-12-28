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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

const OTPScreen = ({ navigation, route }) => {
    const { phoneNumber } = route.params || { phoneNumber: '0901234567' };
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

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

    const handleVerify = (code) => {
        // Simulate OTP verification
        console.log('Verifying OTP:', code);
        navigation.navigate('MainTabs');
    };

    const handleResend = () => {
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    const isComplete = otp.every(digit => digit !== '');

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
                        />
                    ))}
                </View>

                {/* Countdown / Resend */}
                <View style={styles.resendContainer}>
                    {canResend ? (
                        <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                            <Text style={styles.resendButton}>Gửi lại mã OTP</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.countdown}>
                            Gửi lại mã sau <Text style={styles.countdownNumber}>{countdown}s</Text>
                        </Text>
                    )}
                </View>

                {/* Demo Hint */}
                <View style={styles.demoHint}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={styles.demoHintText}>
                        Demo: Nhập bất kỳ 6 số để tiếp tục
                    </Text>
                </View>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.verifyButton, !isComplete && styles.buttonDisabled]}
                    onPress={() => handleVerify(otp.join(''))}
                    disabled={!isComplete}
                    activeOpacity={0.8}
                >
                    <Text style={styles.verifyButtonText}>Xác nhận</Text>
                    <Ionicons name="checkmark-circle" size={20} color={colors.textLight} />
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
    demoHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.info + '15',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.lg,
    },
    demoHintText: {
        ...typography.bodySmall,
        color: colors.info,
        marginLeft: spacing.sm,
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
