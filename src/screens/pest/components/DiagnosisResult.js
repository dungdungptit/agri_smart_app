import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../../theme';

// Parse JSON answer from API
export const parseAnswerJSON = (answerStr) => {
    try {
        return JSON.parse(answerStr);
    } catch (e) {
        return null;
    }
};

const DiagnosisResult = ({ result, onNewDiagnosis }) => {
    if (!result) return null;

    // Try to parse JSON from answer
    const parsedData = result.answer ? parseAnswerJSON(result.answer) : null;

    if (!parsedData) {
        // Raw text display
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="medkit" size={24} color={colors.error} />
                    <Text style={styles.title}>Kết quả chẩn đoán</Text>
                </View>
                <Text style={styles.rawText}>{result.answer || 'Không có dữ liệu'}</Text>
                {onNewDiagnosis && (
                    <TouchableOpacity style={styles.newButton} onPress={onNewDiagnosis}>
                        <Ionicons name="refresh" size={20} color={colors.primary} />
                        <Text style={styles.newButtonText}>Chẩn đoán mới</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="medkit" size={24} color={colors.error} />
                <Text style={styles.title}>Kết quả chẩn đoán</Text>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={true}>
                {/* Disease Name */}
                {parsedData.disease_name_vi && (
                    <View style={styles.diseaseNameBox}>
                        <Text style={styles.diseaseNameVi}>{parsedData.disease_name_vi}</Text>
                        {parsedData.disease_name_en && (
                            <Text style={styles.diseaseNameEn}>({parsedData.disease_name_en})</Text>
                        )}
                    </View>
                )}

                {/* Description Sections */}
                {parsedData.description && (
                    <View style={styles.section}>
                        {parsedData.description.overview && (
                            <View style={styles.descItem}>
                                <Text style={styles.descLabel}>📋 Tổng quan</Text>
                                <Text style={styles.descText}>{parsedData.description.overview}</Text>
                            </View>
                        )}
                        {parsedData.description.visible_signs && (
                            <View style={styles.descItem}>
                                <Text style={styles.descLabel}>🔍 Dấu hiệu nhận biết</Text>
                                <Text style={styles.descText}>{parsedData.description.visible_signs}</Text>
                            </View>
                        )}
                        {parsedData.description.causes && (
                            <View style={styles.descItem}>
                                <Text style={styles.descLabel}>⚠️ Nguyên nhân</Text>
                                <Text style={styles.descText}>{parsedData.description.causes}</Text>
                            </View>
                        )}
                        {parsedData.description.prevention && (
                            <View style={styles.descItem}>
                                <Text style={styles.descLabel}>🛡️ Phòng ngừa</Text>
                                <Text style={styles.descText}>{parsedData.description.prevention}</Text>
                            </View>
                        )}
                        {parsedData.description.quick_treatment && (
                            <View style={[styles.descItem, styles.treatmentHighlight]}>
                                <Text style={styles.descLabel}>💊 Điều trị nhanh</Text>
                                <Text style={styles.descText}>{parsedData.description.quick_treatment}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Detailed Symptoms */}
                {parsedData.detailed_symptoms?.length > 0 && (
                    <View style={styles.detailSection}>
                        <Text style={styles.detailTitle}>🩺 Triệu chứng chi tiết</Text>
                        {parsedData.detailed_symptoms.map((item, idx) => (
                            <View key={idx} style={styles.bulletItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Detailed Causes */}
                {parsedData.detailed_causes?.length > 0 && (
                    <View style={styles.detailSection}>
                        <Text style={styles.detailTitle}>🔬 Nguyên nhân chi tiết</Text>
                        {parsedData.detailed_causes.map((item, idx) => (
                            <View key={idx} style={styles.bulletItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.bulletText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Detailed Treatment */}
                {parsedData.detailed_treatment?.length > 0 && (
                    <View style={[styles.detailSection, styles.treatmentSection]}>
                        <Text style={styles.detailTitle}>💉 Phác đồ điều trị</Text>
                        {parsedData.detailed_treatment.map((item, idx) => (
                            <View key={idx} style={styles.treatmentItem}>
                                <View style={styles.treatmentNumber}>
                                    <Text style={styles.treatmentNumberText}>{idx + 1}</Text>
                                </View>
                                <Text style={styles.treatmentText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {onNewDiagnosis && (
                <TouchableOpacity style={styles.newButton} onPress={onNewDiagnosis}>
                    <Ionicons name="refresh" size={20} color={colors.primary} />
                    <Text style={styles.newButtonText}>Chẩn đoán mới</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginTop: spacing.md,
        ...shadows.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        ...typography.h3,
        color: colors.textPrimary,
        marginLeft: spacing.sm,
    },
    scrollContent: { // max content height
        maxHeight: '100%',
    },
    rawText: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    newButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    newButtonText: {
        ...typography.bodySmall,
        color: colors.primary,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },

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
        ...typography.h2,
        color: colors.error,
        fontWeight: '700',
    },
    diseaseNameEn: {
        ...typography.body,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginTop: spacing.xs,
    },

    // Description section
    section: {
        marginBottom: spacing.md,
    },
    descItem: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    treatmentHighlight: {
        backgroundColor: colors.success + '10',
        borderWidth: 1,
        borderColor: colors.success + '30',
    },
    descLabel: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    descText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
    },

    // Detail sections
    detailSection: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    treatmentSection: {
        backgroundColor: colors.primary + '08',
        borderWidth: 1,
        borderColor: colors.primary + '20',
    },
    detailTitle: {
        ...typography.body,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginTop: 6,
        marginRight: spacing.sm,
    },
    bulletText: {
        flex: 1,
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
    },

    // Treatment items
    treatmentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    treatmentNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    treatmentNumberText: {
        ...typography.caption,
        color: colors.textLight,
        fontWeight: '700',
    },
    treatmentText: {
        flex: 1,
        ...typography.bodySmall,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});

export default DiagnosisResult;
