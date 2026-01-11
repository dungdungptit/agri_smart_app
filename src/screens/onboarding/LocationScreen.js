import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    TextInput,
    Modal,
    Dimensions,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { provinces } from '../../data/mockData';
import { getCurrentLocation, saveUserLocation } from '../../services/weatherService';

const { height } = Dimensions.get('window');

const LocationScreen = ({ navigation }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [gpsRequested, setGpsRequested] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);

    const filteredProvinces = provinces.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGPSPermission = async () => {
        setGpsLoading(true);
        try {
            const loc = await getCurrentLocation();
            setGpsRequested(true);
            const gpsLocation = {
                id: 'gps',
                name: loc.locationName || 'Vị trí GPS',
                region: `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
                latitude: loc.latitude,
                longitude: loc.longitude,
                locationName: loc.locationName || 'Vị trí GPS',
            };
            setSelectedProvince(gpsLocation);
            // Save GPS location for weather API
            await saveUserLocation(gpsLocation);
        } catch (error) {
            console.error('Error getting GPS location:', error);
            Alert.alert(
                'Không thể lấy vị trí',
                'Vui lòng kiểm tra quyền truy cập vị trí và thử lại, hoặc chọn thủ công.',
                [{ text: 'OK' }]
            );
        } finally {
            setGpsLoading(false);
        }
    };

    const handleManualSelect = () => {
        setShowPicker(true);
    };

    const handleSelectProvince = async (province) => {
        setSelectedProvince(province);
        setShowPicker(false);
        // Save selected commune location with coordinates for weather API
        const locationData = {
            id: province.id,
            name: province.name,
            region: province.region,
            latitude: province.lat,  // lat from mockData
            longitude: province.long, // long from mockData
            locationName: province.name,
            loai: province.loai,
        };
        await saveUserLocation(locationData);
    };

    const handleContinue = () => {
        navigation.navigate('MainTabs');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.stepContainer}>
                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepDot, styles.stepActive]} />
                        <View style={styles.stepLine} />
                        <View style={styles.stepDot} />
                    </View>
                    <Text style={styles.stepText}>Bước 1/1</Text>
                </View>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="location" size={40} color={colors.primary} />
                </View>
                <Text style={styles.title}>Chọn vị trí canh tác</Text>
                <Text style={styles.subtitle}>
                    Cho phép truy cập vị trí để nhận thông tin thời tiết và giá cả chính xác
                </Text>

                {/* GPS Button */}
                <TouchableOpacity
                    style={[styles.optionCard, gpsRequested && styles.optionCardSelected]}
                    onPress={handleGPSPermission}
                    activeOpacity={0.8}
                    disabled={gpsLoading}
                >
                    <View style={[styles.optionIcon, gpsRequested && styles.optionIconSelected]}>
                        {gpsLoading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Ionicons
                                name="navigate"
                                size={24}
                                color={gpsRequested ? colors.textLight : colors.primary}
                            />
                        )}
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Sử dụng vị trí hiện tại</Text>
                        <Text style={styles.optionDescription}>
                            {gpsLoading ? 'Đang lấy vị trí...' : 'Tự động xác định vị trí qua GPS'}
                        </Text>
                    </View>
                    {gpsRequested && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                </TouchableOpacity>

                {/* Manual Select Button */}
                <TouchableOpacity
                    style={[styles.optionCard, selectedProvince && !gpsRequested && styles.optionCardSelected]}
                    onPress={handleManualSelect}
                    activeOpacity={0.8}
                >
                    <View style={[styles.optionIcon, selectedProvince && !gpsRequested && styles.optionIconSelected]}>
                        <Ionicons
                            name="map"
                            size={24}
                            color={selectedProvince && !gpsRequested ? colors.textLight : colors.primary}
                        />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Chọn thủ công</Text>
                        <Text style={styles.optionDescription}>
                            {selectedProvince && !gpsRequested
                                ? selectedProvince.name
                                : 'Chọn tỉnh/thành phố từ danh sách'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Selected Location Display */}
                {selectedProvince && (
                    <View style={styles.selectedContainer}>
                        <Ionicons name="location" size={20} color={colors.primary} />
                        <Text style={styles.selectedText}>{selectedProvince.name}</Text>
                        <Text style={styles.selectedRegion}>{selectedProvince.region}</Text>
                    </View>
                )}
            </View>

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedProvince && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={!selectedProvince}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>Tiếp tục</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.textLight} />
                </TouchableOpacity>
            </View>

            {/* Province Picker Modal */}
            <Modal
                visible={showPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn tỉnh/thành phố</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color={colors.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm tỉnh/thành phố..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        <FlatList
                            data={filteredProvinces}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.provinceItem}
                                    onPress={() => {
                                        setGpsRequested(false);
                                        handleSelectProvince(item);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View>
                                        <Text style={styles.provinceName}>{item.name}</Text>
                                        <Text style={styles.provinceRegion}>{item.region}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'space-between',
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    stepContainer: {
        alignItems: 'center',
    },
    headerPlaceholder: {
        width: 40,
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
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.border,
        marginHorizontal: spacing.xs,
    },
    stepText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 24,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
        ...shadows.sm,
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight + '10',
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    optionIconSelected: {
        backgroundColor: colors.primary,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    optionDescription: {
        ...typography.bodySmall,
        color: colors.textSecondary,
    },
    selectedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success + '15',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    selectedText: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '600',
        marginLeft: spacing.sm,
    },
    selectedRegion: {
        ...typography.caption,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlayDark,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: height * 0.7,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    modalTitle: {
        ...typography.h3,
        color: colors.textPrimary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.lg,
        marginVertical: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    searchInput: {
        flex: 1,
        marginLeft: spacing.sm,
        ...typography.body,
        color: colors.textPrimary,
    },
    provinceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    provinceName: {
        ...typography.body,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    provinceRegion: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: colors.divider,
        marginLeft: spacing.lg,
    },
});

export default LocationScreen;
