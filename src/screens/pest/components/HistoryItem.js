import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../../theme';

const HistoryItem = ({
    item,
    isEditing,
    editName,
    onEditNameChange,
    onSaveEdit,
    onCancelEdit,
    onStartEdit,
    onDelete,
    onViewDetail
}) => {
    const treeEmoji = item.inputs?.tree_type === 1 ? '☕' : '🌰';
    const treeName = item.inputs?.tree_type === 1 ? 'Cà phê' : 'Mắc ca';

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isEditing) {
        return (
            <View style={styles.container}>
                <View style={styles.editRow}>
                    <TextInput
                        style={styles.editInput}
                        value={editName}
                        onChangeText={onEditNameChange}
                        autoFocus
                        onSubmitEditing={onSaveEdit}
                        placeholder="Nhập tên mới..."
                        placeholderTextColor={colors.textMuted}
                    />
                    <TouchableOpacity onPress={onSaveEdit} style={styles.editBtn}>
                        <Ionicons name="checkmark" size={20} color={colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onCancelEdit} style={styles.editBtn}>
                        <Ionicons name="close" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.content} onPress={onViewDetail}>
                <View style={styles.iconBox}>
                    <Text style={styles.emoji}>{treeEmoji}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {item.name || 'Chẩn đoán bệnh'}
                    </Text>
                    <View style={styles.meta}>
                        <View style={styles.treeTag}>
                            <Text style={styles.treeName}>{treeName}</Text>
                        </View>
                        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={styles.actions}>
                <TouchableOpacity onPress={onStartEdit} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
                    <Ionicons name="trash" size={18} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    content: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    emoji: {
        fontSize: 20,
    },
    info: {
        flex: 1,
    },
    name: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    treeTag: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginRight: spacing.sm,
    },
    treeName: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    date: {
        ...typography.caption,
        color: colors.textMuted,
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        padding: spacing.xs,
        marginLeft: spacing.xs,
    },

    // Edit mode
    editRow: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    editInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        ...typography.body,
        color: colors.textPrimary,
    },
    editBtn: {
        padding: spacing.xs,
        marginLeft: spacing.xs,
    },
});

export default HistoryItem;
