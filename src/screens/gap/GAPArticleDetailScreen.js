import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

const GAPArticleDetailScreen = ({ route, navigation }) => {
    const { article } = route.params;

    const markdownStyles = {
        body: { color: colors.textPrimary, fontSize: 15, lineHeight: 24 },
        heading2: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: 20, marginBottom: 8 },
        heading3: { fontSize: 15, fontWeight: '700', color: colors.primary, marginTop: 16, marginBottom: 6 },
        bullet_list: { marginBottom: 8 },
        bullet_list_item: { color: colors.textPrimary },
        bullet_list_icon: { color: colors.primary },
        strong: { color: colors.textPrimary, fontWeight: '700' },
        paragraph: { marginBottom: 12, lineHeight: 24 },
        list_item: { marginBottom: 6 },
        code_inline: {
            backgroundColor: colors.primaryLight + '20',
            color: colors.primary,
            borderRadius: 4,
            paddingHorizontal: 4,
        },
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Kiến thức GAP</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Thumbnail */}
                {article.thumbnail && (
                    <Image
                        source={article.thumbnail}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                )}

                <View style={styles.content}>
                    {/* Category + meta */}
                    <View style={styles.metaRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{article.category}</Text>
                        </View>
                        {article.crop && (
                            <View style={[styles.badge, styles.badgeCrop]}>
                                <Text style={[styles.badgeText, { color: colors.secondary }]}>{article.crop}</Text>
                            </View>
                        )}
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{article.title}</Text>

                    {/* Date + readTime */}
                    <View style={styles.infoRow}>
                        {article.date && (
                            <View style={styles.infoItem}>
                                <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                                <Text style={styles.infoText}>{article.date}</Text>
                            </View>
                        )}
                        {article.readTime && (
                            <View style={styles.infoItem}>
                                <Ionicons name="time-outline" size={14} color={colors.textMuted} />
                                <Text style={styles.infoText}>{article.readTime}</Text>
                            </View>
                        )}
                    </View>

                    {/* Excerpt */}
                    {article.excerpt && (
                        <View style={styles.excerptBox}>
                            <Text style={styles.excerptText}>{article.excerpt}</Text>
                        </View>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Main content */}
                    {article.content ? (
                        <Markdown style={markdownStyles}>{article.content}</Markdown>
                    ) : (
                        <Text style={styles.noContent}>Nội dung đang được cập nhật.</Text>
                    )}
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        backgroundColor: colors.surface,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
    scrollView: { flex: 1 },
    heroImage: {
        width: '100%',
        height: 220,
        backgroundColor: colors.border,
    },
    content: { padding: spacing.lg },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primary + '15',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    badgeCrop: { backgroundColor: colors.secondary + '15' },
    badgeText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
    title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, lineHeight: 28 },
    infoRow: { flexDirection: 'row', gap: 16, marginBottom: spacing.md },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoText: { ...typography.caption, color: colors.textMuted },
    excerptBox: {
        backgroundColor: colors.primaryLight + '15',
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.md,
    },
    excerptText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },
    divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
    noContent: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },
});

export default GAPArticleDetailScreen;
