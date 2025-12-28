import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { marketPrices, aiRecommendations, gapArticles } from '../../data/mockData';
import { getCurrentLocation, fetchWeatherData } from '../../services/weatherService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWeatherData();
    }, []);

    const loadWeatherData = async () => {
        setLoading(true);
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);

            const weatherData = await fetchWeatherData(loc.latitude, loc.longitude);
            if (weatherData) {
                setWeather(weatherData.current);
            }
        } catch (error) {
            console.error('Error loading weather:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickAccessItems = [
        { id: '1', name: 'Thời tiết', icon: 'partly-sunny', color: colors.weatherSunny, screen: 'Weather' },
        { id: '2', name: 'Sâu bệnh', icon: 'bug', color: colors.error, screen: 'Pest' },
        { id: '3', name: 'GAP', icon: 'book', color: colors.primary, screen: 'GAP' },
        { id: '4', name: 'Thị trường', icon: 'trending-up', color: colors.success, screen: 'Market' },
        { id: '5', name: 'Mua/Bán', icon: 'cart', color: colors.accent, screen: 'Market' },
        { id: '6', name: 'Hỏi & Đáp', icon: 'chatbubbles', color: colors.info, screen: 'AIChat' },
    ];

    const getWeatherIcon = (icon) => {
        switch (icon) {
            case 'sunny': return { name: 'sunny', color: '#FFB300' };
            case 'partly-cloudy': return { name: 'partly-sunny', color: '#FFA726' };
            case 'cloudy': return { name: 'cloudy', color: '#78909C' };
            case 'rainy': return { name: 'rainy', color: '#42A5F5' };
            case 'stormy': return { name: 'thunderstorm', color: '#5C6BC0' };
            default: return { name: 'partly-sunny', color: '#FFA726' };
        }
    };

    const getRecommendationIcon = (type) => {
        switch (type) {
            case 'watering': return 'water';
            case 'fertilizer': return 'leaf';
            case 'pest': return 'bug';
            case 'market': return 'trending-up';
            case 'harvest': return 'basket';
            default: return 'bulb';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào! 👋</Text>
                    <Text style={styles.location}>
                        <Ionicons name="location" size={14} color={colors.primary} /> {location?.locationName || 'Đang lấy vị trí...'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.notificationButton}>
                    <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                    <View style={styles.notificationBadge} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Weather Card */}
                <TouchableOpacity
                    style={styles.weatherCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('Weather')}
                >
                    <View style={styles.weatherGradient}>
                        {loading ? (
                            <View style={styles.weatherLoading}>
                                <ActivityIndicator size="large" color={colors.textLight} />
                                <Text style={styles.weatherLoadingText}>Đang tải thời tiết...</Text>
                            </View>
                        ) : weather ? (
                            <>
                                <View style={styles.weatherMain}>
                                    <View>
                                        <Text style={styles.weatherTemp}>{weather.temperature}°</Text>
                                        <Text style={styles.weatherCondition}>{weather.condition}</Text>
                                    </View>
                                    <View style={styles.weatherIcon}>
                                        <Ionicons
                                            name={getWeatherIcon(weather.icon).name}
                                            size={60}
                                            color={getWeatherIcon(weather.icon).color}
                                        />
                                    </View>
                                </View>
                                <View style={styles.weatherDetails}>
                                    <View style={styles.weatherDetail}>
                                        <Ionicons name="water" size={16} color={colors.textLight} />
                                        <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
                                    </View>
                                    <View style={styles.weatherDetail}>
                                        <Ionicons name="speedometer" size={16} color={colors.textLight} />
                                        <Text style={styles.weatherDetailText}>{weather.windSpeed} km/h</Text>
                                    </View>
                                    <View style={styles.weatherDetail}>
                                        <Ionicons name="rainy" size={16} color={colors.textLight} />
                                        <Text style={styles.weatherDetailText}>{weather.precipitation}%</Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.weatherLoading}>
                                <Ionicons name="cloud-offline" size={40} color={colors.textLight} />
                                <Text style={styles.weatherLoadingText}>Không thể tải thời tiết</Text>
                                <TouchableOpacity onPress={loadWeatherData} style={styles.retryButton}>
                                    <Text style={styles.retryText}>Thử lại</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Quick Access */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
                    <View style={styles.quickAccessGrid}>
                        {quickAccessItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.quickAccessItem}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate(item.screen)}
                            >
                                <View style={[styles.quickAccessIcon, { backgroundColor: item.color + '20' }]}>
                                    <Ionicons name={item.icon} size={24} color={item.color} />
                                </View>
                                <Text style={styles.quickAccessText}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* AI Recommendations */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>💡 Lời khuyên hôm nay</Text>
                        <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationsScroll}>
                        {aiRecommendations.map((rec) => (
                            <View key={rec.id} style={[styles.recommendationCard, rec.priority === 'high' && styles.recommendationCardHigh]}>
                                <View style={styles.recommendationHeader}>
                                    <View style={[styles.recommendationIcon, rec.priority === 'high' && styles.recommendationIconHigh]}>
                                        <Ionicons name={getRecommendationIcon(rec.type)} size={20} color={rec.priority === 'high' ? colors.textLight : colors.primary} />
                                    </View>
                                    <Text style={styles.recommendationTitle}>{rec.title}</Text>
                                </View>
                                <Text style={styles.recommendationContent}>{rec.content}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Market Prices */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📊 Giá thị trường</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Market')}><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
                    </View>
                    <View style={styles.priceCards}>
                        {marketPrices.slice(0, 4).map((item) => (
                            <View key={item.id} style={styles.priceCard}>
                                <Text style={styles.priceName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.priceValue}>{item.price.toLocaleString()}đ/{item.unit}</Text>
                                <View style={[styles.priceChange, item.change > 0 ? styles.priceUp : styles.priceDown]}>
                                    <Ionicons name={item.change > 0 ? 'trending-up' : 'trending-down'} size={12} color={item.change > 0 ? colors.success : colors.error} />
                                    <Text style={[styles.priceChangeText, item.change > 0 ? styles.priceUpText : styles.priceDownText]}>
                                        {item.change > 0 ? '+' : ''}{item.change}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* GAP Articles */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📚 Kiến thức GAP</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('GAP')}><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
                    </View>
                    {gapArticles.slice(0, 2).map((article) => (
                        <TouchableOpacity key={article.id} style={styles.articleCard} activeOpacity={0.8}>
                            <View style={styles.articleThumbnail}>
                                <Text style={styles.articleEmoji}>{article.crop === 'Cà phê' ? '☕' : '�'}</Text>
                            </View>
                            <View style={styles.articleContent}>
                                <View style={styles.articleBadge}><Text style={styles.articleBadgeText}>{article.category}</Text></View>
                                <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                                <View style={styles.articleMeta}>
                                    <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                                    <Text style={styles.articleMetaText}>{article.readTime}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    },
    greeting: { ...typography.h2, color: colors.textPrimary },
    location: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
    notificationButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface,
        justifyContent: 'center', alignItems: 'center', ...shadows.sm,
    },
    notificationBadge: {
        position: 'absolute', top: 10, right: 10, width: 10, height: 10,
        borderRadius: 5, backgroundColor: colors.error, borderWidth: 2, borderColor: colors.surface,
    },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.lg },
    weatherCard: { marginTop: spacing.md, borderRadius: borderRadius.xl, overflow: 'hidden', ...shadows.lg },
    weatherGradient: { backgroundColor: colors.primary, padding: spacing.lg, minHeight: 150 },
    weatherLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.lg },
    weatherLoadingText: { ...typography.body, color: colors.textLight, marginTop: spacing.sm },
    retryButton: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.md },
    retryText: { ...typography.bodySmall, color: colors.textLight },
    weatherMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    weatherTemp: { fontSize: 56, fontWeight: '700', color: colors.textLight, lineHeight: 64 },
    weatherCondition: { ...typography.body, color: 'rgba(255, 255, 255, 0.9)' },
    weatherIcon: { marginTop: -10 },
    weatherDetails: {
        flexDirection: 'row', marginTop: spacing.md, paddingTop: spacing.md,
        borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    weatherDetail: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.lg },
    weatherDetailText: { ...typography.bodySmall, color: colors.textLight, marginLeft: spacing.xs },
    section: { marginTop: spacing.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    sectionTitle: { ...typography.h3, color: colors.textPrimary },
    seeAll: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
    quickAccessGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing.sm },
    quickAccessItem: { width: (width - spacing.lg * 2 - spacing.sm * 2) / 3, alignItems: 'center', marginBottom: spacing.md },
    quickAccessIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
    quickAccessText: { ...typography.caption, color: colors.textPrimary, fontWeight: '500', textAlign: 'center' },
    recommendationsScroll: { paddingRight: spacing.lg },
    recommendationCard: {
        width: 280, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg,
        marginRight: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm,
    },
    recommendationCardHigh: { borderColor: colors.warning, backgroundColor: colors.warning + '08' },
    recommendationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    recommendationIcon: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryLight + '20',
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm,
    },
    recommendationIconHigh: { backgroundColor: colors.warning },
    recommendationTitle: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
    recommendationContent: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
    priceCards: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    priceCard: {
        width: (width - spacing.lg * 2 - spacing.sm) / 2, backgroundColor: colors.surface,
        borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
    },
    priceName: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 4 },
    priceValue: { ...typography.body, fontWeight: '700', color: colors.textPrimary },
    priceChange: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    priceUp: {},
    priceDown: {},
    priceChangeText: { ...typography.caption, marginLeft: 2, fontWeight: '600' },
    priceUpText: { color: colors.success },
    priceDownText: { color: colors.error },
    articleCard: {
        flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        overflow: 'hidden', marginBottom: spacing.md, ...shadows.sm,
    },
    articleThumbnail: { width: 100, height: 100, backgroundColor: colors.primaryLight + '20', justifyContent: 'center', alignItems: 'center' },
    articleEmoji: { fontSize: 36 },
    articleContent: { flex: 1, padding: spacing.md },
    articleBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, marginBottom: spacing.xs },
    articleBadgeText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
    articleTitle: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '600', lineHeight: 20 },
    articleMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    articleMetaText: { ...typography.caption, color: colors.textMuted, marginLeft: 4 },
    bottomSpacer: { height: 100 },
});

export default HomeScreen;
