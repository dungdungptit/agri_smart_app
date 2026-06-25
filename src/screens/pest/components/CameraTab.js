import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../../theme';

const CameraTab = ({
    selectedImage,
    uploadedUrl,
    isUploading,
    isDiagnosing,
    diagnosisResult,
    onTakePhoto,
    onPickImage,
    onClearImage,
    onDiagnose,
}) => {
    return (
        <View style={styles.container}>
            {/* Image Preview or Placeholder */}
            {selectedImage ? (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.clearImageButton} onPress={onClearImage}>
                        <Ionicons name="close-circle" size={32} color={colors.error} />
                    </TouchableOpacity>
                    {isUploading && (
                        <View style={styles.uploadingOverlay}>
                            <ActivityIndicator size="large" color={colors.textLight} />
                            <Text style={styles.uploadingText}>Đang upload...</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.placeholder}>
                    <Ionicons name="camera" size={60} color={colors.textMuted} />
                    <Text style={styles.placeholderTitle}>Chẩn đoán sâu bệnh bằng AI</Text>
                    <Text style={styles.placeholderDesc}>Chụp ảnh lá cây để AI phân tích</Text>
                </View>
            )}

            {/* Diagnose Button */}
            {uploadedUrl && !isDiagnosing && !diagnosisResult && (
                <TouchableOpacity style={styles.diagnoseButton} onPress={onDiagnose}>
                    <Ionicons name="scan" size={24} color={colors.textLight} />
                    <Text style={styles.diagnoseButtonText}>Chẩn đoán bệnh</Text>
                </TouchableOpacity>
            )}

            {/* Camera Buttons */}
            <View style={styles.cameraButtons}>
                <TouchableOpacity style={styles.cameraButton} onPress={onTakePhoto} disabled={isUploading}>
                    <View style={[styles.cameraButtonIcon, isUploading && styles.buttonDisabled]}>
                        <Ionicons name="camera" size={28} color={colors.textLight} />
                    </View>
                    <Text style={styles.cameraButtonText}>Chụp ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.cameraButton, styles.galleryButton]} onPress={onPickImage} disabled={isUploading}>
                    <View style={[styles.cameraButtonIcon, styles.galleryButtonIcon, isUploading && styles.buttonDisabled]}>
                        <Ionicons name="images" size={28} color={colors.primary} />
                    </View>
                    <Text style={[styles.cameraButtonText, styles.galleryButtonText]}>Thư viện</Text>
                </TouchableOpacity>
            </View>

            {/* Tips */}
            <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 Mẹo chụp ảnh tốt</Text>
                <View style={styles.tipItem}>
                    <View style={styles.tipBullet} />
                    <Text style={styles.tipText}>Chụp gần vùng bị bệnh, rõ nét</Text>
                </View>
                <View style={styles.tipItem}>
                    <View style={styles.tipBullet} />
                    <Text style={styles.tipText}>Đảm bảo ánh sáng đủ, không bị mờ</Text>
                </View>
                <View style={styles.tipItem}>
                    <View style={styles.tipBullet} />
                    <Text style={styles.tipText}>Bao gồm cả phần lá khỏe để so sánh</Text>
                </View>
            </View>

            {/* Diagnosing Indicator */}
            {isDiagnosing && (
                <View style={styles.diagnosingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.diagnosingText}>Đang phân tích ảnh...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        ...shadows.md,
    },
    imagePreview: {
        width: '100%',
        height: 220,
        borderRadius: borderRadius.xl,
    },
    clearImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        color: colors.textLight,
        marginTop: spacing.sm,
        ...typography.body,
    },
    placeholder: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xxl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    placeholderTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    placeholderDesc: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    diagnoseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        marginTop: spacing.md,
        ...shadows.md,
    },
    diagnoseButtonText: {
        ...typography.body,
        color: colors.textLight,
        fontWeight: '700',
        marginLeft: spacing.sm,
    },
    cameraButtons: {
        flexDirection: 'row',
        marginTop: spacing.md,
        gap: spacing.md,
    },
    cameraButton: {
        flex: 1,
        alignItems: 'center',
    },
    cameraButtonIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    galleryButton: {},
    galleryButtonIcon: {
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    cameraButtonText: {
        ...typography.caption,
        color: colors.textPrimary,
        fontWeight: '500',
        marginTop: spacing.xs,
    },
    galleryButtonText: {
        color: colors.primary,
    },
    buttonDisabled: {
        opacity: 0.5,
    },

    // Tips
    tipsContainer: {
        backgroundColor: colors.info + '10',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginTop: spacing.lg,
    },
    tipsTitle: {
        ...typography.body,
        color: colors.info,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    tipBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.info,
        marginRight: spacing.sm,
    },
    tipText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },

    // Diagnosing
    diagnosingContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        marginTop: spacing.md,
    },
    diagnosingText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
        marginTop: spacing.md,
    },
});

export default CameraTab;
