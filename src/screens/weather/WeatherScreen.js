import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { aiRecommendations } from '../../data/mockData';
import { getCurrentLocation, fetchWeatherData } from '../../services/weatherService';

const { width } = Dimensions.get('window');

const WeatherScreen = ({ navigation }) => {
    const [weather, setWeather] = useState(null);
    const [hourly, setHourly] = useState([]);
    const [weekly, setWeekly] = useState([]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadWeatherData();
    }, []);

    const loadWeatherData = async () => {
        try {
            const loc = await getCurrentLocation();
            setLocation(loc);

            const weatherData = await fetchWeatherData(loc.latitude, loc.longitude);
            if (weatherData) {
                setWeather(weatherData.current);
                setHourly(weatherData.hourly);
                setWeekly(weatherData.weekly);
            }
        } catch (error) {
            console.error('Error loading weather:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadWeatherData();
    };

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

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.textLight} />
                    <Text style={styles.loadingText}>Đang tải dữ liệu thời tiết...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textLight} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textLight} />
                    </TouchableOpacity>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={16} color={colors.textLight} />
                        <Text style={styles.locationText}>{location?.locationName || 'Vị trí của bạn'}</Text>
                    </View>
                    <TouchableOpacity style={styles.settingsButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={24} color={colors.textLight} />
                    </TouchableOpacity>
                </View>

                {/* Main Weather Card */}
                {weather && (
                    <View style={styles.mainWeatherCard}>
                        <View style={styles.weatherGradient}>
                            <View style={styles.mainWeatherContent}>
                                <View style={styles.tempContainer}>
                                    <Text style={styles.temperature}>{weather.temperature}°</Text>
                                    <Text style={styles.feelsLike}>Cảm giác {weather.feelsLike}°</Text>
                                </View>
                                <View style={styles.mainWeatherIcon}>
                                    <Ionicons
                                        name={getWeatherIcon(weather.icon).name}
                                        size={80}
                                        color={getWeatherIcon(weather.icon).color}
                                    />
                                    <Text style={styles.condition}>{weather.condition}</Text>
                                </View>
                            </View>

                            {/* Weather Details Grid */}
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailItem}>
                                    <Ionicons name="water" size={24} color={colors.textLight} />
                                    <Text style={styles.detailValue}>{weather.humidity}%</Text>
                                    <Text style={styles.detailLabel}>Độ ẩm</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="speedometer" size={24} color={colors.textLight} />
                                    <Text style={styles.detailValue}>{weather.windSpeed}</Text>
                                    <Text style={styles.detailLabel}>km/h Gió</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="sunny" size={24} color={colors.textLight} />
                                    <Text style={styles.detailValue}>{weather.uvIndex}</Text>
                                    <Text style={styles.detailLabel}>UV Index</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="rainy" size={24} color={colors.textLight} />
                                    <Text style={styles.detailValue}>{weather.precipitation}%</Text>
                                    <Text style={styles.detailLabel}>Mưa</Text>
                                </View>
                            </View>

                            {/* Sunrise/Sunset */}
                            <View style={styles.sunTimes}>
                                <View style={styles.sunItem}>
                                    <Ionicons name="sunny" size={18} color="#FFD54F" />
                                    <Text style={styles.sunText}>Mặt trời mọc: {weather.sunrise}</Text>
                                </View>
                                <View style={styles.sunItem}>
                                    <Ionicons name="moon" size={18} color="#B0BEC5" />
                                    <Text style={styles.sunText}>Mặt trời lặn: {weather.sunset}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Hourly Forecast */}
                {hourly.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dự báo theo giờ</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScroll}>
                            {hourly.map((hour, index) => {
                                const iconData = getWeatherIcon(hour.icon);
                                return (
                                    <View key={index} style={styles.hourlyItem}>
                                        <Text style={styles.hourlyTime}>{hour.time}</Text>
                                        <Ionicons name={iconData.name} size={28} color={iconData.color} />
                                        <Text style={styles.hourlyTemp}>{hour.temp}°</Text>
                                        {hour.precipitation > 0 && (
                                            <View style={styles.hourlyPrecip}>
                                                <Ionicons name="water" size={10} color={colors.info} />
                                                <Text style={styles.hourlyPrecipText}>{hour.precipitation}%</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* 7-Day Forecast */}
                {weekly.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Dự báo 7 ngày</Text>
                        <View style={styles.weeklyContainer}>
                            {weekly.map((day, index) => {
                                const iconData = getWeatherIcon(day.icon);
                                return (
                                    <View key={index} style={[styles.weeklyItem, index === weekly.length - 1 && { borderBottomWidth: 0 }]}>
                                        <Text style={styles.weeklyDay}>{day.day}</Text>
                                        <View style={styles.weeklyIconContainer}>
                                            <Ionicons name={iconData.name} size={24} color={iconData.color} />
                                            {day.precipitation > 30 && (
                                                <Text style={styles.weeklyPrecip}>{day.precipitation}%</Text>
                                            )}
                                        </View>
                                        <View style={styles.weeklyTemps}>
                                            <Text style={styles.weeklyHigh}>{day.high}°</Text>
                                            <View style={styles.tempBar}>
                                                <View style={[styles.tempBarFill, { width: `${Math.max(10, (day.high - 10) * 3)}%` }]} />
                                            </View>
                                            <Text style={styles.weeklyLow}>{day.low}°</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Temperature Chart Placeholder */}
                {hourly.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Biểu đồ nhiệt độ</Text>
                        <View style={styles.chartContainer}>
                            <View style={styles.chartPlaceholder}>
                                <View style={styles.chartLine}>
                                    {hourly.slice(0, 7).map((hour, index) => (
                                        <View key={index} style={[styles.chartBar, { height: Math.max(20, (hour.temp - 5) * 4) }]}>
                                            <Text style={styles.chartLabel}>{hour.temp}°</Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={styles.chartXAxis}>
                                    {hourly.slice(0, 7).map((hour, index) => (
                                        <Text key={index} style={styles.chartXLabel}>{hour.time?.split(':')[0]}h</Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* AI Recommendations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🤖 Gợi ý AI theo thời tiết</Text>
                    {aiRecommendations.filter(r => ['watering', 'pest'].includes(r.type)).map((rec) => (
                        <View key={rec.id} style={styles.aiCard}>
                            <View style={[styles.aiIcon, rec.priority === 'high' && styles.aiIconHigh]}>
                                <Ionicons name={rec.type === 'watering' ? 'water' : 'bug'} size={24} color={rec.priority === 'high' ? colors.textLight : colors.primary} />
                            </View>
                            <View style={styles.aiContent}>
                                <Text style={styles.aiTitle}>{rec.title}</Text>
                                <Text style={styles.aiDescription}>{rec.content}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { ...typography.body, color: colors.textLight, marginTop: spacing.md },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: spacing.xxl },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
    },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    locationContainer: { flexDirection: 'row', alignItems: 'center' },
    locationText: { ...typography.body, color: colors.textLight, fontWeight: '600', marginLeft: spacing.xs },
    settingsButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    mainWeatherCard: { margin: spacing.lg, marginTop: 0 },
    weatherGradient: { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: borderRadius.xl, padding: spacing.lg },
    mainWeatherContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    tempContainer: {},
    temperature: { fontSize: 72, fontWeight: '700', color: colors.textLight, lineHeight: 80 },
    feelsLike: { ...typography.body, color: 'rgba(255, 255, 255, 0.8)' },
    mainWeatherIcon: { alignItems: 'center' },
    condition: { ...typography.body, color: colors.textLight, marginTop: spacing.xs },
    detailsGrid: {
        flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl,
        paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    detailItem: { alignItems: 'center' },
    detailValue: { ...typography.body, color: colors.textLight, fontWeight: '700', marginTop: spacing.xs },
    detailLabel: { ...typography.caption, color: 'rgba(255, 255, 255, 0.7)', marginTop: 2 },
    sunTimes: {
        flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.lg,
        paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    sunItem: { flexDirection: 'row', alignItems: 'center' },
    sunText: { ...typography.bodySmall, color: colors.textLight, marginLeft: spacing.xs },
    section: { backgroundColor: colors.background, marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    hourlyScroll: { paddingRight: spacing.lg },
    hourlyItem: {
        alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.md, marginRight: spacing.sm, width: 70, ...shadows.sm,
    },
    hourlyTime: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
    hourlyTemp: { ...typography.body, color: colors.textPrimary, fontWeight: '600', marginTop: spacing.xs },
    hourlyPrecip: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    hourlyPrecipText: { ...typography.caption, color: colors.info, marginLeft: 2, fontSize: 10 },
    weeklyContainer: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.sm },
    weeklyItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm,
        borderBottomWidth: 1, borderBottomColor: colors.divider,
    },
    weeklyDay: { ...typography.body, color: colors.textPrimary, width: 70 },
    weeklyIconContainer: { width: 60, flexDirection: 'row', alignItems: 'center' },
    weeklyPrecip: { ...typography.caption, color: colors.info, marginLeft: 4, fontSize: 10 },
    weeklyTemps: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
    weeklyHigh: { ...typography.body, color: colors.textPrimary, fontWeight: '600', width: 35, textAlign: 'right' },
    weeklyLow: { ...typography.body, color: colors.textMuted, width: 35, textAlign: 'left' },
    tempBar: { width: 50, height: 4, backgroundColor: colors.border, borderRadius: 2, marginHorizontal: spacing.sm },
    tempBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
    chartContainer: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.sm },
    chartPlaceholder: { height: 150 },
    chartLine: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: spacing.md },
    chartBar: { width: 30, backgroundColor: colors.primary + '30', borderRadius: 4, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
    chartLabel: { ...typography.caption, color: colors.primary, fontWeight: '600', fontSize: 10 },
    chartXAxis: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
    chartXLabel: { ...typography.caption, color: colors.textMuted, width: 30, textAlign: 'center' },
    aiCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    aiIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryLight + '20', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    aiIconHigh: { backgroundColor: colors.warning },
    aiContent: { flex: 1 },
    aiTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600', marginBottom: 4 },
    aiDescription: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
    bottomSpacer: { height: spacing.xl },
});

export default WeatherScreen;
