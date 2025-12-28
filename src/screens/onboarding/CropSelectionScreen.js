import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { crops } from '../../data/mockData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

const CropSelectionScreen = ({ navigation }) => {
    const [selectedCrops, setSelectedCrops] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = ['all', 'Lương thực', 'Công nghiệp', 'Cây ăn quả', 'Rau củ'];

    const filteredCrops = activeCategory === 'all'
        ? crops
        : crops.filter(c => c.category === activeCategory);

    const toggleCrop = (cropId) => {
        setSelectedCrops(prev =>
            prev.includes(cropId)
                ? prev.filter(id => id !== cropId)
                : [...prev, cropId]
        );
    };

    const handleContinue = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, styles.stepCompleted]} />
                    <View style={[styles.stepLine, styles.stepLineCompleted]} />
                    <View style={[styles.stepDot, styles.stepActive]} />
                </View>
                <Text style={styles.stepText}>Bước 2/2</Text>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Chọn cây trồng chính</Text>
                <Text style={styles.subtitle}>
                    Chọn các loại cây bạn đang canh tác để nhận tư vấn phù hợp
                </Text>
            </View>

            {/* Category Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryContainer}
                contentContainerStyle={styles.categoryContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryChip,
                            activeCategory === category && styles.categoryChipActive
                        ]}
                        onPress={() => setActiveCategory(category)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.categoryText,
                            activeCategory === category && styles.categoryTextActive
                        ]}>
                            {category === 'all' ? 'Tất cả' : category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Crops Grid */}
            <ScrollView
                style={styles.cropsContainer}
                contentContainerStyle={styles.cropsContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.cropsGrid}>
                    {filteredCrops.map((crop) => {
                        const isSelected = selectedCrops.includes(crop.id);
                        return (
                            <TouchableOpacity
                                key={crop.id}
                                style={[styles.cropCard, isSelected && styles.cropCardSelected]}
                                onPress={() => toggleCrop(crop.id)}
                                activeOpacity={0.8}
                            >
                                {isSelected && (
                                    <View style={styles.checkMark}>
                                        <Ionicons name="checkmark" size={16} color={colors.textLight} />
                                    </View>
                                )}
                                <Text style={styles.cropIcon}>{crop.icon}</Text>
                                <Text style={[styles.cropName, isSelected && styles.cropNameSelected]}>
                                    {crop.name}
                                </Text>
                                <Text style={styles.cropCategory}>{crop.category}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Selected Count */}
            {selectedCrops.length > 0 && (
                <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>
                        Đã chọn {selectedCrops.length} loại cây
                    </Text>
                </View>
            )}

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, selectedCrops.length === 0 && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={selectedCrops.length === 0}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>Hoàn tất thiết lập</Text>
                    <Ionicons name="checkmark-circle" size={20} color={colors.textLight} />
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.md,
        paddingHorizontal: spacing.lg,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: spacing.lg,
        top: spacing.md,
        padding: spacing.xs,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.border,
    },
    stepActive: {
        backgroundColor: colors.primary,
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    stepCompleted: {
        backgroundColor: colors.success,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.border,
        marginHorizontal: spacing.xs,
    },
    stepLineCompleted: {
        backgroundColor: colors.success,
    },
    stepText: {
        position: 'absolute',
        bottom: -20,
        ...typography.caption,
        color: colors.textSecondary,
    },
    titleContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.md,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    categoryContainer: {
        maxHeight: 50,
    },
    categoryContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    categoryChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.round,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: colors.textLight,
    },
    cropsContainer: {
        flex: 1,
    },
    cropsContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    cropsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cropCard: {
        width: CARD_WIDTH,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        position: 'relative',
        ...shadows.sm,
    },
    cropCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight + '10',
    },
    checkMark: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cropIcon: {
        fontSize: 40,
        marginBottom: spacing.sm,
    },
    cropName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    cropNameSelected: {
        color: colors.primary,
    },
    cropCategory: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    selectedBadge: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: colors.primaryDark,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.round,
        ...shadows.md,
    },
    selectedBadgeText: {
        ...typography.bodySmall,
        color: colors.textLight,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        paddingTop: spacing.md,
    },
    continueButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    buttonDisabled: {
        backgroundColor: colors.border,
    },
    continueButtonText: {
        ...typography.button,
        color: colors.textLight,
        marginRight: spacing.sm,
    },
});

export default CropSelectionScreen;
