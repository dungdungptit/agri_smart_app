import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../../theme';
import { parseAnswerJSON } from './DiagnosisResult';

const DetailModal = ({ visible, detail, loading, onClose }) => {
    if (!visible) return null;

    const renderMessageContent = (msg) => {
        const parsedAnswer = msg.answer ? parseAnswerJSON(msg.answer) : null;

        return (
            <View style={styles.messageItem}>
                {/* Image if exists */}
                {msg.message_files?.length > 0 && (
                    <Image
                        source={{ uri: msg.message_files[0].url }}
                        style={styles.messageImage}
                        resizeMode="cover"
                    />
                )}

                {/* Query */}
                <Text style={styles.messageQuery}>❓ {msg.query}</Text>

                {/* Answer */}
                {msg.status === 'error' ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>⚠️ Lỗi: {msg.error}</Text>
                    </View>
                ) : parsedAnswer ? (
                    <View style={styles.answerContent}>
                        {/* Disease Name */}
                        {parsedAnswer.disease_name_vi && (
                            <View style={styles.diseaseNameBox}>
                                <Text style={styles.diseaseNameVi}>{parsedAnswer.disease_name_vi}</Text>
                                {parsedAnswer.disease_name_en && (
                                    <Text style={styles.diseaseNameEn}>({parsedAnswer.disease_name_en})</Text>
                                )}
                            </View>
                        )}

                        {/* Description */}
                        {parsedAnswer.description && (
                            <>
                                {parsedAnswer.description.overview && (
                                    <View style={styles.descItem}>
                                        <Text style={styles.descLabel}>📋 Tổng quan</Text>
                                        <Text style={styles.descText}>{parsedAnswer.description.overview}</Text>
                                    </View>
                                )}
                                {parsedAnswer.description.visible_signs && (
                                    <View style={styles.descItem}>
                                        <Text style={styles.descLabel}>🔍 Dấu hiệu</Text>
                                        <Text style={styles.descText}>{parsedAnswer.description.visible_signs}</Text>
                                    </View>
                                )}
                                {parsedAnswer.description.causes && (
                                    <View style={styles.descItem}>
                                        <Text style={styles.descLabel}>⚠️ Nguyên nhân</Text>
                                        <Text style={styles.descText}>{parsedAnswer.description.causes}</Text>
                                    </View>
                                )}
                                {parsedAnswer.description.prevention && (
                                    <View style={styles.descItem}>
                                        <Text style={styles.descLabel}>🛡️ Phòng ngừa</Text>
                                        <Text style={styles.descText}>{parsedAnswer.description.prevention}</Text>
                                    </View>
                                )}
                                {parsedAnswer.description.quick_treatment && (
                                    <View style={[styles.descItem, styles.treatmentHighlight]}>
                                        <Text style={styles.descLabel}>💊 Điều trị</Text>
                                        <Text style={styles.descText}>{parsedAnswer.description.quick_treatment}</Text>
                                    </View>
                                )}
                            </>
                        )}

                        {/* Detailed Symptoms */}
                        {parsedAnswer.detailed_symptoms?.length > 0 && (
                            <View style={styles.detailSection}>
                                <Text style={styles.detailTitle}>🩺 Triệu chứng chi tiết</Text>
                                {parsedAnswer.detailed_symptoms.map((item, idx) => (
                                    <View key={idx} style={styles.bulletItem}>
                                        <View style={styles.bullet} />
                                        <Text style={styles.bulletText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Detailed Treatment */}
                        {parsedAnswer.detailed_treatment?.length > 0 && (
                            <View style={[styles.detailSection, styles.treatmentSection]}>
                                <Text style={styles.detailTitle}>💉 Phác đồ điều trị</Text>
                                {parsedAnswer.detailed_treatment.map((item, idx) => (
                                    <View key={idx} style={styles.treatmentItem}>
                                        <View style={styles.treatmentNumber}>
                                            <Text style={styles.treatmentNumberText}>{idx + 1}</Text>
                                        </View>
                                        <Text style={styles.treatmentText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                ) : msg.answer ? (
                    <Text style={styles.rawAnswer}>{msg.answer}</Text>
                ) : null}
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Chi tiết chẩn đoán</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>Đang tải...</Text>
                        </View>
                    ) : detail?.messages?.length > 0 ? (
                        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {detail.messages.map((msg, idx) => (
                                <View key={idx}>
                                    {renderMessageContent(msg)}
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                            <Text style={styles.emptyText}>Không có dữ liệu</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    scrollContent: {
        marginTop: spacing.md,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    loadingText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textMuted,
        marginTop: spacing.md,
    },

    // Message item
    messageItem: {
        marginBottom: spacing.lg,
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    messageImage: {
        width: '100%',
        height: 180,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        backgroundColor: colors.background,
    },
    messageQuery: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
        marginBottom: spacing.md,
    },
    errorBox: {
        backgroundColor: colors.error + '10',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.error,
    },
    errorText: {
        ...typography.bodySmall,
        color: colors.error,
    },
    rawAnswer: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    answerContent: {},

    // Disease name
    diseaseNameBox: {
        backgroundColor: colors.error + '10',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
    },
    diseaseNameVi: {
        ...typography.h3,
        color: colors.error,
        fontWeight: '700',
    },
    diseaseNameEn: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 2,
    },

    // Description items
    descItem: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginBottom: spacing.xs,
    },
    treatmentHighlight: {
        backgroundColor: colors.success + '10',
        borderWidth: 1,
        borderColor: colors.success + '30',
    },
    descLabel: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    descText: {
        ...typography.caption,
        color: colors.textSecondary,
        lineHeight: 18,
    },

    // Detail sections
    detailSection: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        marginTop: spacing.sm,
    },
    treatmentSection: {
        backgroundColor: colors.primary + '08',
        borderWidth: 1,
        borderColor: colors.primary + '20',
    },
    detailTitle: {
        ...typography.bodySmall,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 2,
    },
    bullet: {
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 5,
        marginRight: spacing.xs,
    },
    bulletText: {
        flex: 1,
        ...typography.caption,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    treatmentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    treatmentNumber: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    treatmentNumberText: {
        ...typography.caption,
        color: colors.textLight,
        fontWeight: '700',
        fontSize: 11,
    },
    treatmentText: {
        flex: 1,
        ...typography.caption,
        color: colors.textSecondary,
        lineHeight: 18,
    },
});

export default DetailModal;
