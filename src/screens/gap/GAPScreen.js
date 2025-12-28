import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    SafeAreaView, TextInput, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { gapArticles } from '../../data/mockData';

const { width } = Dimensions.get('window');

const GAPScreen = ({ navigation }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const categories = ['all', 'Kỹ thuật trồng', 'Phân bón', 'Sâu bệnh'];
    const filteredArticles = gapArticles.filter(a =>
        activeCategory === 'all' || a.category === activeCategory
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Kiến thức GAP</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Topics */}
                <View style={styles.topicsGrid}>
                    {[
                        { title: 'Lịch mùa vụ', icon: 'calendar', color: colors.primary },
                        { title: 'Quy trình GAP', icon: 'checkmark-circle', color: colors.success },
                        { title: 'Phân bón', icon: 'leaf', color: colors.secondary },
                        { title: 'Bảo quản', icon: 'cube', color: colors.accent },
                    ].map((topic, i) => (
                        <TouchableOpacity key={i} style={styles.topicCard}>
                            <View style={[styles.topicIcon, { backgroundColor: topic.color + '20' }]}>
                                <Ionicons name={topic.icon} size={24} color={topic.color} />
                            </View>
                            <Text style={styles.topicTitle}>{topic.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
                            onPress={() => setActiveCategory(cat)}
                        >
                            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
                                {cat === 'all' ? 'Tất cả' : cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Articles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bài viết mới nhất</Text>
                    {filteredArticles.map((article) => (
                        <TouchableOpacity key={article.id} style={styles.articleCard}>
                            <View style={styles.articleThumb}><Text style={{ fontSize: 32 }}>📚</Text></View>
                            <View style={styles.articleContent}>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{article.category}</Text>
                                </View>
                                <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                                <Text style={styles.articleMeta}>{article.readTime}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Season Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📅 Thông tin mùa vụ</Text>
                    <View style={styles.seasonCard}>
                        <Text style={styles.seasonTitle}>Vụ Đông Xuân 2024-2025</Text>
                        <Text style={styles.seasonDate}>Tháng 11/2024 - 02/2025</Text>
                        <View style={styles.seasonItem}>
                            <View style={styles.dot} /><Text style={styles.seasonText}>Đang gieo sạ</Text>
                        </View>
                        <View style={styles.seasonItem}>
                            <View style={[styles.dot, styles.dotPending]} /><Text style={styles.seasonText}>Chăm sóc đẻ nhánh</Text>
                        </View>
                    </View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.lg },
    headerTitle: { ...typography.h2, color: colors.textPrimary },
    scrollView: { flex: 1, paddingHorizontal: spacing.lg },
    topicsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
    topicCard: { alignItems: 'center', width: (width - spacing.lg * 2) / 4 - 8 },
    topicIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    topicTitle: { ...typography.caption, color: colors.textPrimary, textAlign: 'center' },
    catScroll: { marginBottom: spacing.lg },
    catChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: colors.border },
    catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    catText: { ...typography.bodySmall, color: colors.textSecondary },
    catTextActive: { color: colors.textLight, fontWeight: '600' },
    section: { marginBottom: spacing.lg },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    articleCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, marginBottom: 10, ...shadows.sm },
    articleThumb: { width: 80, height: 80, backgroundColor: colors.primaryLight + '20', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
    articleContent: { flex: 1, padding: spacing.md },
    badge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
    badgeText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
    articleTitle: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600' },
    articleMeta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
    seasonCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg, ...shadows.sm },
    seasonTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
    seasonDate: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
    seasonItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 8 },
    dotPending: { backgroundColor: colors.border },
    seasonText: { ...typography.bodySmall, color: colors.textSecondary },
});

export default GAPScreen;
