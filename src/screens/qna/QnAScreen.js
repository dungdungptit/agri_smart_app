import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    SafeAreaView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { questions } from '../../data/mockData';

const QnAScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [questionText, setQuestionText] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hỏi & Đáp</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'list' && styles.tabActive]}
                    onPress={() => setActiveTab('list')}
                >
                    <Ionicons name="list" size={18} color={activeTab === 'list' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>Câu hỏi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'ask' && styles.tabActive]}
                    onPress={() => setActiveTab('ask')}
                >
                    <Ionicons name="add-circle" size={18} color={activeTab === 'ask' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'ask' && styles.tabTextActive]}>Đặt câu hỏi</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {activeTab === 'list' && (
                    <>
                        {/* Filter */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                            {['Tất cả', 'Lúa', 'Sầu riêng', 'Thanh long', 'Phân bón'].map((tag, i) => (
                                <TouchableOpacity key={i} style={[styles.filterChip, i === 0 && styles.filterChipActive]}>
                                    <Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Questions */}
                        {questions.map((q) => (
                            <TouchableOpacity key={q.id} style={styles.questionCard}>
                                <View style={styles.questionHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{q.user.charAt(0)}</Text>
                                    </View>
                                    <View style={styles.questionMeta}>
                                        <Text style={styles.userName}>{q.user}</Text>
                                        <Text style={styles.questionDate}>{q.date}</Text>
                                    </View>
                                </View>
                                <Text style={styles.questionText}>{q.question}</Text>
                                <View style={styles.questionFooter}>
                                    <View style={styles.tags}>
                                        {q.tags.map((tag, i) => (
                                            <View key={i} style={styles.tag}>
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.answers}>
                                        <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
                                        <Text style={styles.answersText}>{q.answers} trả lời</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {activeTab === 'ask' && (
                    <View style={styles.askContainer}>
                        <View style={styles.askCard}>
                            <Text style={styles.askTitle}>Đặt câu hỏi mới</Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Câu hỏi của bạn</Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                    numberOfLines={5}
                                    textAlignVertical="top"
                                    value={questionText}
                                    onChangeText={setQuestionText}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Đính kèm ảnh (tùy chọn)</Text>
                                <TouchableOpacity style={styles.uploadButton}>
                                    <Ionicons name="camera" size={24} color={colors.primary} />
                                    <Text style={styles.uploadText}>Chụp ảnh hoặc chọn từ thư viện</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Chủ đề</Text>
                                <TouchableOpacity style={styles.selectButton}>
                                    <Text style={styles.selectText}>Chọn chủ đề liên quan</Text>
                                    <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.submitButton}>
                                <Ionicons name="send" size={18} color={colors.textLight} />
                                <Text style={styles.submitText}>Gửi câu hỏi</Text>
                            </TouchableOpacity>

                            {/* AI Response Preview */}
                            <View style={styles.aiPreview}>
                                <View style={styles.aiHeader}>
                                    <Ionicons name="sparkles" size={18} color={colors.accent} />
                                    <Text style={styles.aiTitle}>AI sẽ trả lời ngay</Text>
                                </View>
                                <Text style={styles.aiDescription}>
                                    Hệ thống AI sẽ tự động phân tích và đưa ra gợi ý ban đầu.
                                    Chuyên gia sẽ xem xét và bổ sung nếu cần.
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.lg, paddingBottom: spacing.sm },
    headerTitle: { ...typography.h2, color: colors.textPrimary },
    tabContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, marginHorizontal: 4 },
    tabActive: { backgroundColor: colors.primaryLight + '20' },
    tabText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: 6 },
    tabTextActive: { color: colors.primary, fontWeight: '600' },
    scrollView: { flex: 1, paddingHorizontal: spacing.lg },
    filterScroll: { marginBottom: spacing.md },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.border },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { ...typography.bodySmall, color: colors.textSecondary },
    filterTextActive: { color: colors.textLight, fontWeight: '600' },
    questionCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    questionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { color: colors.textLight, fontWeight: '600' },
    questionMeta: { flex: 1 },
    userName: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600' },
    questionDate: { ...typography.caption, color: colors.textMuted },
    questionText: { ...typography.body, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.sm },
    questionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tags: { flexDirection: 'row' },
    tag: { backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
    tagText: { ...typography.caption, color: colors.primary },
    answers: { flexDirection: 'row', alignItems: 'center' },
    answersText: { ...typography.caption, color: colors.textMuted, marginLeft: 4 },
    askContainer: {},
    askCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg, ...shadows.sm },
    askTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.lg },
    formGroup: { marginBottom: spacing.md },
    label: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600', marginBottom: 8 },
    textArea: { backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, minHeight: 120, borderWidth: 1, borderColor: colors.border, ...typography.body, color: colors.textPrimary },
    uploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
    uploadText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: 10 },
    selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
    selectText: { ...typography.body, color: colors.textMuted },
    submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, marginTop: spacing.md },
    submitText: { ...typography.button, color: colors.textLight, marginLeft: 8 },
    aiPreview: { marginTop: spacing.lg, backgroundColor: colors.accent + '10', borderRadius: 10, padding: spacing.md },
    aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    aiTitle: { ...typography.bodySmall, color: colors.accent, fontWeight: '600', marginLeft: 6 },
    aiDescription: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
});

export default QnAScreen;
