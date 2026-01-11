import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { marketPrices } from '../../data/mockData';

const { width } = Dimensions.get('window');

const MarketPriceDetailScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Get unique categories from product names
    const categories = [
        { id: 'all', name: 'Tất cả', icon: 'apps' },
        { id: 'coffee', name: 'Cà phê', icon: 'cafe' },
        { id: 'macca', name: 'Mắc ca', icon: 'nutrition' },
        { id: 'pineapple', name: 'Dứa', icon: 'leaf' },
        { id: 'lemon', name: 'Chanh', icon: 'water' },
    ];

    const regions = ['all', 'Điện Biên', 'Đắk Lắk', 'Lâm Đồng', 'Gia Lai', 'Đắk Nông'];

    const filteredPrices = marketPrices.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = selectedRegion === 'all' || p.region === selectedRegion;
        let matchesCategory = selectedCategory === 'all';

        if (selectedCategory === 'coffee') matchesCategory = p.name.includes('Cà phê');
        if (selectedCategory === 'macca') matchesCategory = p.name.includes('Mắc ca');
        if (selectedCategory === 'pineapple') matchesCategory = p.name.includes('Dứa');
        if (selectedCategory === 'lemon') matchesCategory = p.name.includes('Chanh');

        return matchesSearch && matchesRegion && matchesCategory;
    });

    // Calculate summary stats
    const upPrices = marketPrices.filter(p => p.change > 0);
    const downPrices = marketPrices.filter(p => p.change < 0);
    const avgUp = upPrices.length > 0 ? (upPrices.reduce((acc, p) => acc + p.change, 0) / upPrices.length).toFixed(1) : 0;
    const avgDown = downPrices.length > 0 ? (downPrices.reduce((acc, p) => acc + p.change, 0) / downPrices.length).toFixed(1) : 0;

    const getProductIcon = (name) => {
        if (name.includes('Cà phê')) return 'cafe';
        if (name.includes('Mắc ca')) return 'nutrition';
        if (name.includes('Dứa')) return 'leaf';
        if (name.includes('Chanh')) return 'water';
        if (name.includes('Chè')) return 'cafe-outline';
        if (name.includes('Gạo')) return 'restaurant';
        return 'leaf';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>📊 Giá thị trường</Text>
                    <Text style={styles.headerSubtitle}>Cập nhật: 11/01/2026</Text>
                </View>
                <TouchableOpacity style={styles.refreshButton}>
                    <Ionicons name="refresh" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Cards */}
                <View style={styles.summarySection}>
                    <View style={[styles.summaryCard, styles.summaryUp]}>
                        <View style={styles.summaryIconBox}>
                            <Ionicons name="trending-up" size={24} color={colors.success} />
                        </View>
                        <View>
                            <Text style={[styles.summaryValue, { color: colors.success }]}>+{avgUp}%</Text>
                            <Text style={styles.summaryLabel}>{upPrices.length} sản phẩm tăng</Text>
                        </View>
                    </View>
                    <View style={[styles.summaryCard, styles.summaryDown]}>
                        <View style={styles.summaryIconBox}>
                            <Ionicons name="trending-down" size={24} color={colors.error} />
                        </View>
                        <View>
                            <Text style={[styles.summaryValue, { color: colors.error }]}>{avgDown}%</Text>
                            <Text style={styles.summaryLabel}>{downPrices.length} sản phẩm giảm</Text>
                        </View>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm nông sản..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryContainer}
                    contentContainerStyle={styles.categoryContent}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <Ionicons
                                name={cat.icon}
                                size={16}
                                color={selectedCategory === cat.id ? colors.textLight : colors.textSecondary}
                            />
                            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Region Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.regionContainer}
                    contentContainerStyle={styles.regionContent}
                >
                    {regions.map((region) => (
                        <TouchableOpacity
                            key={region}
                            style={[styles.regionChip, selectedRegion === region && styles.regionChipActive]}
                            onPress={() => setSelectedRegion(region)}
                        >
                            <Text style={[styles.regionText, selectedRegion === region && styles.regionTextActive]}>
                                {region === 'all' ? '🌏 Tất cả' : `📍 ${region}`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Price List Header */}
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Bảng giá ({filteredPrices.length} sản phẩm)</Text>
                </View>

                {/* Price Cards */}
                {filteredPrices.map((item) => (
                    <View key={item.id} style={styles.priceCard}>
                        <View style={styles.priceCardLeft}>
                            <View style={[styles.productIcon, { backgroundColor: item.change > 0 ? colors.success + '15' : colors.error + '15' }]}>
                                <Ionicons
                                    name={getProductIcon(item.name)}
                                    size={24}
                                    color={item.change > 0 ? colors.success : colors.error}
                                />
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName}>{item.name}</Text>
                                <View style={styles.productLocation}>
                                    <Ionicons name="location" size={12} color={colors.textMuted} />
                                    <Text style={styles.locationText}>{item.region}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.priceCardRight}>
                            <Text style={styles.priceAmount}>
                                {item.price.toLocaleString()}đ
                            </Text>
                            <Text style={styles.priceUnit}>/{item.unit}</Text>
                            <View style={[
                                styles.changeTag,
                                { backgroundColor: item.change > 0 ? colors.success + '20' : colors.error + '20' }
                            ]}>
                                <Ionicons
                                    name={item.change > 0 ? 'caret-up' : 'caret-down'}
                                    size={12}
                                    color={item.change > 0 ? colors.success : colors.error}
                                />
                                <Text style={[
                                    styles.changeText,
                                    { color: item.change > 0 ? colors.success : colors.error }
                                ]}>
                                    {item.change > 0 ? '+' : ''}{item.change}%
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}

                {/* No Results */}
                {filteredPrices.length === 0 && (
                    <View style={styles.noResults}>
                        <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                        <Text style={styles.noResultsText}>Không tìm thấy sản phẩm</Text>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                                setSelectedRegion('all');
                            }}
                        >
                            <Text style={styles.resetButtonText}>Xóa bộ lọc</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Data Source */}
                <View style={styles.dataSource}>
                    <Ionicons name="information-circle" size={16} color={colors.textMuted} />
                    <Text style={styles.dataSourceText}>
                        Dữ liệu giá tham khảo từ giacaphe.com, giatieu.com và thị trường địa phương.
                    </Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    headerSubtitle: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    summarySection: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    summaryCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    summaryUp: {
        backgroundColor: colors.success + '10',
        borderWidth: 1,
        borderColor: colors.success + '30',
    },
    summaryDown: {
        backgroundColor: colors.error + '10',
        borderWidth: 1,
        borderColor: colors.error + '30',
    },
    summaryIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    summaryValue: {
        ...typography.h3,
        fontWeight: '700',
    },
    summaryLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        ...typography.body,
        color: colors.textPrimary,
    },
    categoryContainer: {
        marginBottom: spacing.sm,
    },
    categoryContent: {
        paddingRight: spacing.lg,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
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
        marginLeft: spacing.xs,
    },
    categoryTextActive: {
        color: colors.textLight,
        fontWeight: '600',
    },
    regionContainer: {
        marginBottom: spacing.lg,
    },
    regionContent: {
        paddingRight: spacing.lg,
    },
    regionChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    regionChipActive: {
        backgroundColor: colors.primaryLight + '30',
        borderColor: colors.primary,
    },
    regionText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    regionTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    listTitle: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    priceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    priceCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    productIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    productLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationText: {
        ...typography.caption,
        color: colors.textMuted,
        marginLeft: 4,
    },
    priceCardRight: {
        alignItems: 'flex-end',
    },
    priceAmount: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    priceUnit: {
        ...typography.caption,
        color: colors.textMuted,
    },
    changeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginTop: 4,
    },
    changeText: {
        ...typography.caption,
        fontWeight: '600',
        marginLeft: 2,
    },
    noResults: {
        alignItems: 'center',
        paddingVertical: spacing.xl * 2,
    },
    noResultsText: {
        ...typography.body,
        color: colors.textMuted,
        marginTop: spacing.md,
    },
    resetButton: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
    },
    resetButtonText: {
        ...typography.bodySmall,
        color: colors.textLight,
        fontWeight: '600',
    },
    dataSource: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    dataSourceText: {
        ...typography.caption,
        color: colors.textMuted,
        marginLeft: spacing.sm,
        flex: 1,
    },
    bottomSpacer: {
        height: 40,
    },
});

export default MarketPriceDetailScreen;
