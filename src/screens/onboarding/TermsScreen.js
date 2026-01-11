import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

const TermsScreen = ({ navigation }) => {
    const [agreed, setAgreed] = useState(false);

    const handleContinue = () => {
        navigation.navigate('Location');
    };

    const handleSkip = () => {
        navigation.navigate('Location');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="document-text" size={32} color={colors.primary} />
                </View>
                <Text style={styles.title}>Điều khoản & Chính sách</Text>
                <Text style={styles.subtitle}>
                    Vui lòng đọc và đồng ý với điều khoản sử dụng
                </Text>
            </View>

            {/* Terms Content */}
            <View style={styles.termsContainer}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={true}
                >
                    <Text style={styles.sectionTitle}>1. Điều khoản sử dụng</Text>
                    <Text style={styles.termsText}>
                        Chào mừng bạn đến với Trợ lý AI Nông nghiệp tỉnh Điện Biên - Nền tảng nông nghiệp thông minh tỉnh Điện Biên.
                        Khi sử dụng ứng dụng này, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.
                    </Text>
                    <Text style={styles.termsText}>
                        Trợ lý AI Nông nghiệp tỉnh Điện Biên cung cấp các công cụ hỗ trợ canh tác, thông tin thời tiết,
                        cảnh báo sâu bệnh và kết nối thị trường nông sản. Các thông tin được
                        cung cấp chỉ mang tính chất tham khảo.
                    </Text>

                    <Text style={styles.sectionTitle}>2. Quyền riêng tư</Text>
                    <Text style={styles.termsText}>
                        Chúng tôi thu thập thông tin vị trí để cung cấp dữ liệu thời tiết chính xác
                        và giá cả thị trường tại khu vực của bạn. Thông tin này được bảo mật và
                        không chia sẻ với bên thứ ba.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Quyền và trách nhiệm</Text>
                    <Text style={styles.termsText}>
                        Người dùng có trách nhiệm cung cấp thông tin chính xác khi đăng ký
                        và sử dụng dịch vụ. Trợ lý AI Nông nghiệp tỉnh Điện Biên không chịu trách nhiệm về các quyết định
                        canh tác dựa trên thông tin từ ứng dụng.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Cập nhật điều khoản</Text>
                    <Text style={styles.termsText}>
                        Trợ lý AI Nông nghiệp tỉnh Điện Biên có quyền cập nhật điều khoản sử dụng bất cứ lúc nào.
                        Các thay đổi sẽ được thông báo qua ứng dụng hoặc email.
                    </Text>

                    <Text style={styles.sectionTitle}>5. Liên hệ</Text>
                    <Text style={styles.termsText}>
                        Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ:
                        support@Trợ lý AI Nông nghiệp tỉnh Điện Biên.vn hoặc hotline: 1900-xxxx
                    </Text>

                    <View style={styles.spacer} />
                </ScrollView>
            </View>

            {/* Checkbox */}
            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.7}
            >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                    {agreed && <Ionicons name="checkmark" size={18} color={colors.textLight} />}
                </View>
                <Text style={styles.checkboxLabel}>
                    Tôi đã đọc và đồng ý với Điều khoản sử dụng
                </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.primaryButton, !agreed && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={!agreed}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>Đồng ý & Tiếp tục</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    activeOpacity={0.7}
                >
                    <Text style={styles.skipButtonText}>Bỏ qua</Text>
                </TouchableOpacity>
            </View>
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
    header: {
        alignItems: 'center',
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    termsContainer: {
        flex: 1,
        marginHorizontal: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
        overflow: 'hidden',
    },
    scrollView: {
        flex: 1,
        padding: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        fontSize: 16,
        color: colors.primary,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    termsText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: spacing.sm,
    },
    spacer: {
        height: spacing.xl,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxLabel: {
        ...typography.bodySmall,
        color: colors.textPrimary,
        flex: 1,
    },
    buttonContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    buttonDisabled: {
        backgroundColor: colors.border,
    },
    primaryButtonText: {
        ...typography.button,
        color: colors.textLight,
        marginRight: spacing.sm,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    skipButtonText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
});

export default TermsScreen;
