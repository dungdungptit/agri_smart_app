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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { marketPrices, buyListings } from '../../data/mockData';

const { width } = Dimensions.get('window');

const MarketScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('prices');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('all');

    const filteredPrices = marketPrices.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedRegion === 'all' || p.region === selectedRegion)
    );

    const regions = ['all', 'Cần Thơ', 'An Giang', 'Đắk Lắk', 'Bình Thuận', 'Tiền Giang'];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thị trường</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'prices' && styles.tabActive]}
                    onPress={() => setActiveTab('prices')}
                >
                    <Ionicons
                        name="trending-up"
                        size={20}
                        color={activeTab === 'prices' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'prices' && styles.tabTextActive]}>
                        Giá cả
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'buy' && styles.tabActive]}
                    onPress={() => setActiveTab('buy')}
                >
                    <Ionicons
                        name="cart"
                        size={20}
                        color={activeTab === 'buy' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'buy' && styles.tabTextActive]}>
                        Nhu cầu mua
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sell' && styles.tabActive]}
                    onPress={() => setActiveTab('sell')}
                >
                    <Ionicons
                        name="pricetag"
                        size={20}
                        color={activeTab === 'sell' ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.tabText, activeTab === 'sell' && styles.tabTextActive]}>
                        Đăng bán
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'prices' && (
                    <>
                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={colors.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm nông sản..."
                                placeholderTextColor={colors.textMuted}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {/* Region Filter */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.filterContainer}
                            contentContainerStyle={styles.filterContent}
                        >
                            {regions.map((region) => (
                                <TouchableOpacity
                                    key={region}
                                    style={[styles.filterChip, selectedRegion === region && styles.filterChipActive]}
                                    onPress={() => setSelectedRegion(region)}
                                >
                                    <Text style={[styles.filterText, selectedRegion === region && styles.filterTextActive]}>
                                        {region === 'all' ? 'Tất cả' : region}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Summary Cards */}
                        <View style={styles.summaryCards}>
                            <View style={[styles.summaryCard, { backgroundColor: colors.success + '15' }]}>
                                <Ionicons name="trending-up" size={24} color={colors.success} />
                                <Text style={styles.summaryValue}>+3.2%</Text>
                                <Text style={styles.summaryLabel}>Tăng trung bình</Text>
                            </View>
                            <View style={[styles.summaryCard, { backgroundColor: colors.error + '15' }]}>
                                <Ionicons name="trending-down" size={24} color={colors.error} />
                                <Text style={styles.summaryValue}>-1.5%</Text>
                                <Text style={styles.summaryLabel}>Giảm trung bình</Text>
                            </View>
                        </View>

                        {/* Price List */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Bảng giá hôm nay</Text>
                            {filteredPrices.map((item) => (
                                <TouchableOpacity key={item.id} style={styles.priceCard} activeOpacity={0.8}>
                                    <View style={styles.priceInfo}>
                                        <Text style={styles.priceName}>{item.name}</Text>
                                        <View style={styles.priceLocation}>
                                            <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                                            <Text style={styles.priceLocationText}>{item.region}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.priceValue}>
                                        <Text style={styles.priceAmount}>
                                            {item.price.toLocaleString()}đ/{item.unit}
                                        </Text>
                                        <View style={[
                                            styles.priceChange,
                                            item.change > 0 ? styles.priceUp : styles.priceDown
                                        ]}>
                                            <Ionicons
                                                name={item.change > 0 ? 'caret-up' : 'caret-down'}
                                                size={12}
                                                color={item.change > 0 ? colors.success : colors.error}
                                            />
                                            <Text style={[
                                                styles.priceChangeText,
                                                item.change > 0 ? styles.priceUpText : styles.priceDownText
                                            ]}>
                                                {Math.abs(item.change)}%
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Chart Placeholder */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Xu hướng giá (7 ngày)</Text>
                            <View style={styles.chartPlaceholder}>
                                <View style={styles.chartLines}>
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <View key={i} style={styles.chartLine} />
                                    ))}
                                </View>
                                <View style={styles.chartBars}>
                                    {[65, 70, 68, 72, 75, 73, 78].map((height, index) => (
                                        <View
                                            key={index}
                                            style={[styles.chartBar, { height: height }]}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {activeTab === 'buy' && (
                    <>
                        <Text style={styles.buyHeader}>Thương lái đang cần mua</Text>
                        {buyListings.map((listing) => (
                            <View key={listing.id} style={styles.buyCard}>
                                <View style={styles.buyHeader}>
                                    <View style={styles.buyerAvatar}>
                                        <Text style={styles.buyerAvatarText}>
                                            {listing.buyer.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.buyerInfo}>
                                        <Text style={styles.buyerName}>{listing.buyer}</Text>
                                        <View style={styles.buyerLocation}>
                                            <Ionicons name="location" size={12} color={colors.textMuted} />
                                            <Text style={styles.buyerLocationText}>{listing.location}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.buyDetails}>
                                    <View style={styles.buyDetailItem}>
                                        <Text style={styles.buyDetailLabel}>Sản phẩm</Text>
                                        <Text style={styles.buyDetailValue}>{listing.product}</Text>
                                    </View>
                                    <View style={styles.buyDetailItem}>
                                        <Text style={styles.buyDetailLabel}>Số lượng</Text>
                                        <Text style={styles.buyDetailValue}>{listing.quantity}</Text>
                                    </View>
                                    <View style={styles.buyDetailItem}>
                                        <Text style={styles.buyDetailLabel}>Giá mua</Text>
                                        <Text style={[styles.buyDetailValue, styles.buyPrice]}>{listing.price}</Text>
                                    </View>
                                </View>

                                <View style={styles.buyFooter}>
                                    <Text style={styles.buyDeadline}>
                                        <Ionicons name="time-outline" size={12} /> Hạn: {listing.deadline}
                                    </Text>
                                    <View style={styles.buyActions}>
                                        <TouchableOpacity style={styles.buyActionButton} activeOpacity={0.8}>
                                            <Ionicons name="call" size={18} color={colors.success} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.buyActionButton} activeOpacity={0.8}>
                                            <Ionicons name="chatbubble" size={18} color={colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {activeTab === 'sell' && (
                    <View style={styles.sellContainer}>
                        <View style={styles.sellForm}>
                            <Text style={styles.formTitle}>Đăng bán nông sản</Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Loại nông sản</Text>
                                <TouchableOpacity style={styles.formSelect}>
                                    <Text style={styles.formSelectText}>Chọn loại nông sản</Text>
                                    <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Số lượng</Text>
                                <View style={styles.formInputRow}>
                                    <TextInput
                                        style={[styles.formInput, { flex: 1 }]}
                                        placeholder="Nhập số lượng"
                                        placeholderTextColor={colors.textMuted}
                                        keyboardType="numeric"
                                    />
                                    <View style={styles.unitSelect}>
                                        <Text style={styles.unitText}>kg</Text>
                                        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Giá mong muốn</Text>
                                <View style={styles.formInputRow}>
                                    <TextInput
                                        style={[styles.formInput, { flex: 1 }]}
                                        placeholder="Nhập giá"
                                        placeholderTextColor={colors.textMuted}
                                        keyboardType="numeric"
                                    />
                                    <View style={styles.unitSelect}>
                                        <Text style={styles.unitText}>đ/kg</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Vị trí</Text>
                                <TouchableOpacity style={styles.formSelect}>
                                    <Ionicons name="location" size={20} color={colors.primary} />
                                    <Text style={styles.formSelectText}>Chọn vị trí bán</Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Mô tả thêm</Text>
                                <TextInput
                                    style={[styles.formInput, styles.formTextArea]}
                                    placeholder="Mô tả về chất lượng, thời gian thu hoạch..."
                                    placeholderTextColor={colors.textMuted}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
                                <Ionicons name="add-circle" size={20} color={colors.textLight} />
                                <Text style={styles.submitButtonText}>Đăng bán</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    headerTitle: {
        ...typography.h2,
        color: colors.textPrimary,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.xs,
    },
    tabActive: {
        backgroundColor: colors.primaryLight + '20',
    },
    tabText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    tabTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
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
    filterContainer: {
        marginBottom: spacing.md,
    },
    filterContent: {
        paddingRight: spacing.lg,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.round,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: colors.textLight,
        fontWeight: '600',
    },
    summaryCards: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    summaryCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    summaryValue: {
        ...typography.h3,
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    summaryLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    priceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.sm,
    },
    priceInfo: {
        flex: 1,
    },
    priceName: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    priceLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    priceLocationText: {
        ...typography.caption,
        color: colors.textMuted,
        marginLeft: 4,
    },
    priceValue: {
        alignItems: 'flex-end',
    },
    priceAmount: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    priceChange: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    priceUp: {},
    priceDown: {},
    priceChangeText: {
        ...typography.caption,
        fontWeight: '600',
        marginLeft: 2,
    },
    priceUpText: {
        color: colors.success,
    },
    priceDownText: {
        color: colors.error,
    },
    chartPlaceholder: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        height: 150,
        ...shadows.sm,
    },
    chartLines: {
        position: 'absolute',
        top: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.lg,
        justifyContent: 'space-between',
    },
    chartLine: {
        height: 1,
        backgroundColor: colors.border,
    },
    chartBars: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
    },
    chartBar: {
        width: 24,
        backgroundColor: colors.primary + '60',
        borderRadius: 4,
    },
    buyHeader: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buyCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
    },
    buyerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    buyerAvatarText: {
        ...typography.h3,
        color: colors.textLight,
    },
    buyerInfo: {
        flex: 1,
    },
    buyerName: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    buyerLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    buyerLocationText: {
        ...typography.caption,
        color: colors.textMuted,
        marginLeft: 4,
    },
    buyDetails: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    buyDetailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    buyDetailLabel: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    buyDetailValue: {
        ...typography.bodySmall,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    buyPrice: {
        color: colors.primary,
    },
    buyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    buyDeadline: {
        ...typography.caption,
        color: colors.textMuted,
    },
    buyActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    buyActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellContainer: {},
    sellForm: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.sm,
    },
    formTitle: {
        ...typography.h3,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    formGroup: {
        marginBottom: spacing.md,
    },
    formLabel: {
        ...typography.bodySmall,
        color: colors.textPrimary,
        fontWeight: '600',
        marginBottom: spacing.sm,
    },
    formSelect: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    formSelectText: {
        flex: 1,
        ...typography.body,
        color: colors.textMuted,
        marginLeft: spacing.sm,
    },
    formInput: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...typography.body,
        color: colors.textPrimary,
    },
    formInputRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    unitSelect: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    unitText: {
        ...typography.body,
        color: colors.textSecondary,
    },
    formTextArea: {
        height: 100,
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        marginTop: spacing.md,
    },
    submitButtonText: {
        ...typography.button,
        color: colors.textLight,
        marginLeft: spacing.sm,
    },
    bottomSpacer: {
        height: 100,
    },
});

export default MarketScreen;
