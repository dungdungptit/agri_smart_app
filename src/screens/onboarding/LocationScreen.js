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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { provinces } from '../../data/mockData';

const { height } = Dimensions.get('window');

const LocationScreen = ({ navigation }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [gpsRequested, setGpsRequested] = useState(false);

    const filteredProvinces = provinces.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGPSPermission = () => {
        // Simulate GPS permission request
        setGpsRequested(true);
        setSelectedProvince({ id: 'gps', name: 'Cần Thơ (GPS)', region: 'Đồng bằng sông Cửu Long' });
    };

    const handleManualSelect = () => {
        setShowPicker(true);
    };

    const handleSelectProvince = (province) => {
        setSelectedProvince(province);
        setShowPicker(false);
    };

    const handleContinue = () => {
        navigation.navigate('CropSelection');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, styles.stepActive]} />
                    <View style={styles.stepLine} />
                    <View style={styles.stepDot} />
                </View>
                <Text style={styles.stepText}>Bước 1/2</Text>
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
                >
                    <View style={[styles.optionIcon, gpsRequested && styles.optionIconSelected]}>
                        <Ionicons
                            name="navigate"
                            size={24}
                            color={gpsRequested ? colors.textLight : colors.primary}
                        />
                    </View>
                    <View style={styles.optionContent}>
                        <Text style={styles.optionTitle}>Sử dụng vị trí hiện tại</Text>
                        <Text style={styles.optionDescription}>
                            Tự động xác định vị trí qua GPS
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
        alignItems: 'center',
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
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
