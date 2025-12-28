import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Image,
    Dimensions,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { pests } from '../../data/mockData';

const { width } = Dimensions.get('window');
const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;

const PestScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('camera');
    const [selectedCrop, setSelectedCrop] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const filteredPests = selectedCrop === 'all'
        ? pests
        : pests.filter(p => p.crop === selectedCrop);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return colors.error;
            case 'medium': return colors.warning;
            case 'low': return colors.success;
            default: return colors.textMuted;
        }
    };

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case 'high': return 'Nghiêm trọng';
            case 'medium': return 'Trung bình';
            case 'low': return 'Nhẹ';
            default: return 'Không xác định';
        }
    };

    // Upload image to ImageBB
    const uploadToImageBB = async (imageUri) => {
        setIsUploading(true);
        try {
            // Read image as base64
            const response = await fetch(imageUri);
            const blob = await response.blob();

            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onloadend = async () => {
                    const base64data = reader.result.split(',')[1];

                    // Upload to ImageBB
                    const formData = new FormData();
                    formData.append('key', IMGBB_API_KEY);
                    formData.append('image', base64data);

                    try {
                        const uploadResponse = await fetch('https://api.imgbb.com/1/upload', {
                            method: 'POST',
                            body: formData,
                        });

                        const data = await uploadResponse.json();

                        if (data.success) {
                            const url = data.data.url;
                            setUploadedUrl(url);
                            Alert.alert(
                                '✅ Upload thành công!',
                                `Link ảnh: ${url}`,
                                [
                                    { text: 'OK' },
                                    { text: 'Mở link', onPress: () => Linking.openURL(url) }
                                ]
                            );
                            resolve(url);
                        } else {
                            throw new Error(data.error?.message || 'Upload failed');
                        }
                    } catch (uploadError) {
                        reject(uploadError);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    // Take photo with camera
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền camera để chụp ảnh');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setSelectedImage(uri);
            setUploadedUrl(null);
            await uploadToImageBB(uri);
        }
    };

    // Pick image from gallery
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setSelectedImage(uri);
            setUploadedUrl(null);
            await uploadToImageBB(uri);
        }
    };

    // Clear selected image
    const clearImage = () => {
        setSelectedImage(null);
        setUploadedUrl(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sâu bệnh</Text>
                <TouchableOpacity style={styles.alertButton}>
                    <Ionicons name="notifications" size={24} color={colors.textPrimary} />
                    <View style={styles.alertBadge} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'camera' && styles.tabActive]}
                    onPress={() => setActiveTab('camera')}
                >
                    <Ionicons name="camera" size={20} color={activeTab === 'camera' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'camera' && styles.tabTextActive]}>Chẩn đoán</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'list' && styles.tabActive]}
                    onPress={() => setActiveTab('list')}
                >
                    <Ionicons name="list" size={20} color={activeTab === 'list' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>Danh sách</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'alerts' && styles.tabActive]}
                    onPress={() => setActiveTab('alerts')}
                >
                    <Ionicons name="warning" size={20} color={activeTab === 'alerts' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}>Cảnh báo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'camera' && (
                    <>
                        {/* Camera Section */}
                        <View style={styles.cameraSection}>
                            {selectedImage ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                                    <TouchableOpacity style={styles.clearImageButton} onPress={clearImage}>
                                        <Ionicons name="close-circle" size={32} color={colors.error} />
                                    </TouchableOpacity>

                                    {isUploading && (
                                        <View style={styles.uploadingOverlay}>
                                            <ActivityIndicator size="large" color={colors.textLight} />
                                            <Text style={styles.uploadingText}>Đang upload...</Text>
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.cameraPlaceholder}>
                                    <Ionicons name="camera" size={60} color={colors.textMuted} />
                                    <Text style={styles.cameraTitle}>Chẩn đoán sâu bệnh bằng AI</Text>
                                    <Text style={styles.cameraDescription}>
                                        Chụp ảnh lá cây hoặc vùng bị bệnh để AI phân tích và đưa ra kết quả
                                    </Text>
                                </View>
                            )}

                            {/* Uploaded URL Display */}
                            {uploadedUrl && (
                                <View style={styles.urlContainer}>
                                    <View style={styles.urlHeader}>
                                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                        <Text style={styles.urlLabel}>Link ảnh đã upload:</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.urlBox}
                                        onPress={() => Linking.openURL(uploadedUrl)}
                                    >
                                        <Text style={styles.urlText} numberOfLines={2}>{uploadedUrl}</Text>
                                        <Ionicons name="open-outline" size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={styles.cameraButtons}>
                                <TouchableOpacity
                                    style={styles.cameraButton}
                                    activeOpacity={0.8}
                                    onPress={takePhoto}
                                    disabled={isUploading}
                                >
                                    <View style={[styles.cameraButtonIcon, isUploading && styles.buttonDisabled]}>
                                        <Ionicons name="camera" size={28} color={colors.textLight} />
                                    </View>
                                    <Text style={styles.cameraButtonText}>Chụp ảnh</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.cameraButton, styles.galleryButton]}
                                    activeOpacity={0.8}
                                    onPress={pickImage}
                                    disabled={isUploading}
                                >
                                    <View style={[styles.cameraButtonIcon, styles.galleryButtonIcon, isUploading && styles.buttonDisabled]}>
                                        <Ionicons name="images" size={28} color={isUploading ? colors.textMuted : colors.primary} />
                                    </View>
                                    <Text style={[styles.cameraButtonText, styles.galleryButtonText]}>Chọn từ thư viện</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Tips */}
                            <View style={styles.tipsContainer}>
                                <Text style={styles.tipsTitle}>💡 Mẹo chụp ảnh tốt</Text>
                                <View style={styles.tipItem}>
                                    <View style={styles.tipBullet} />
                                    <Text style={styles.tipText}>Chụp gần vùng bị bệnh, rõ nét</Text>
                                </View>
                                <View style={styles.tipItem}>
                                    <View style={styles.tipBullet} />
                                    <Text style={styles.tipText}>Đảm bảo ánh sáng đủ, không bị mờ</Text>
                                </View>
                                <View style={styles.tipItem}>
                                    <View style={styles.tipBullet} />
                                    <Text style={styles.tipText}>Bao gồm cả phần lá khỏe để so sánh</Text>
                                </View>
                            </View>
                        </View>

                        {/* Recent Diagnoses */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Chẩn đoán gần đây</Text>
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                                <Text style={styles.emptyText}>Chưa có lịch sử chẩn đoán</Text>
                            </View>
                        </View>
                    </>
                )}

                {activeTab === 'list' && (
                    <>
                        {/* Crop Filter */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
                            <TouchableOpacity
                                style={[styles.filterChip, selectedCrop === 'all' && styles.filterChipActive]}
                                onPress={() => setSelectedCrop('all')}
                            >
                                <Text style={[styles.filterText, selectedCrop === 'all' && styles.filterTextActive]}>Tất cả</Text>
                            </TouchableOpacity>
                            {['Lúa', 'Thanh long', 'Xoài', 'Cà phê'].map((crop) => (
                                <TouchableOpacity
                                    key={crop}
                                    style={[styles.filterChip, selectedCrop === crop && styles.filterChipActive]}
                                    onPress={() => setSelectedCrop(crop)}
                                >
                                    <Text style={[styles.filterText, selectedCrop === crop && styles.filterTextActive]}>{crop}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Pest List */}
                        <View style={styles.pestList}>
                            {filteredPests.map((pest) => (
                                <TouchableOpacity key={pest.id} style={styles.pestCard} activeOpacity={0.8}>
                                    <View style={styles.pestImage}>
                                        <Ionicons name="bug" size={32} color={getSeverityColor(pest.severity)} />
                                    </View>
                                    <View style={styles.pestContent}>
                                        <View style={styles.pestHeader}>
                                            <Text style={styles.pestName}>{pest.name}</Text>
                                            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(pest.severity) + '20' }]}>
                                                <Text style={[styles.severityText, { color: getSeverityColor(pest.severity) }]}>
                                                    {getSeverityLabel(pest.severity)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.pestCropTag}>
                                            <Text style={styles.pestCropText}>🌾 {pest.crop}</Text>
                                        </View>
                                        <Text style={styles.pestSymptoms} numberOfLines={2}>{pest.symptoms}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {activeTab === 'alerts' && (
                    <View style={styles.alertsContainer}>
                        {/* Active Alerts */}
                        <View style={styles.alertCard}>
                            <View style={[styles.alertIcon, { backgroundColor: colors.error + '20' }]}>
                                <Ionicons name="warning" size={24} color={colors.error} />
                            </View>
                            <View style={styles.alertContent}>
                                <Text style={styles.alertTitle}>Cảnh báo rầy nâu</Text>
                                <Text style={styles.alertDescription}>
                                    Độ ẩm cao (78%), khả năng bùng phát rầy nâu trong 3-5 ngày tới
                                </Text>
                                <View style={styles.alertMeta}>
                                    <Ionicons name="location" size={12} color={colors.textMuted} />
                                    <Text style={styles.alertMetaText}>Khu vực Cần Thơ</Text>
                                    <Text style={styles.alertTime}>• 2 giờ trước</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.alertCard}>
                            <View style={[styles.alertIcon, { backgroundColor: colors.warning + '20' }]}>
                                <Ionicons name="alert-circle" size={24} color={colors.warning} />
                            </View>
                            <View style={styles.alertContent}>
                                <Text style={styles.alertTitle}>Nguy cơ bệnh đạo ôn</Text>
                                <Text style={styles.alertDescription}>
                                    Thời tiết ẩm ướt kéo dài, tăng cường phun thuốc phòng ngừa
                                </Text>
                                <View style={styles.alertMeta}>
                                    <Ionicons name="location" size={12} color={colors.textMuted} />
                                    <Text style={styles.alertMetaText}>Đồng bằng sông Cửu Long</Text>
                                    <Text style={styles.alertTime}>• 1 ngày trước</Text>
                                </View>
                            </View>
                        </View>

                        {/* Prevention Tips */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Biện pháp phòng ngừa</Text>
                            <View style={styles.preventionCard}>
                                <View style={styles.preventionItem}>
                                    <View style={styles.preventionNumber}><Text style={styles.preventionNumberText}>1</Text></View>
                                    <Text style={styles.preventionText}>Kiểm tra ruộng thường xuyên, đặc biệt vào sáng sớm</Text>
                                </View>
                                <View style={styles.preventionItem}>
                                    <View style={styles.preventionNumber}><Text style={styles.preventionNumberText}>2</Text></View>
                                    <Text style={styles.preventionText}>Không bón quá nhiều phân đạm</Text>
                                </View>
                                <View style={styles.preventionItem}>
                                    <View style={styles.preventionNumber}><Text style={styles.preventionNumberText}>3</Text></View>
                                    <Text style={styles.preventionText}>Duy trì mực nước ruộng phù hợp</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

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
    headerTitle: { ...typography.h2, color: colors.textPrimary },
    alertButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface,
        justifyContent: 'center', alignItems: 'center', ...shadows.sm,
    },
    alertBadge: {
        position: 'absolute', top: 10, right: 10, width: 10, height: 10,
        borderRadius: 5, backgroundColor: colors.error, borderWidth: 2, borderColor: colors.surface,
    },
    tabContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: spacing.sm, borderRadius: borderRadius.md, marginHorizontal: spacing.xs,
    },
    tabActive: { backgroundColor: colors.primaryLight + '20' },
    tabText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: spacing.xs },
    tabTextActive: { color: colors.primary, fontWeight: '600' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.lg },
    cameraSection: { marginBottom: spacing.lg },
    cameraPlaceholder: {
        backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl,
        alignItems: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', ...shadows.sm,
    },
    cameraTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' },
    cameraDescription: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },

    // Image preview styles
    imagePreviewContainer: { position: 'relative', borderRadius: borderRadius.xl, overflow: 'hidden', ...shadows.md },
    imagePreview: { width: '100%', height: 250, borderRadius: borderRadius.xl },
    clearImageButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white', borderRadius: 16 },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center',
    },
    uploadingText: { color: colors.textLight, marginTop: spacing.sm, ...typography.body },

    // URL display styles
    urlContainer: { marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.sm },
    urlHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    urlLabel: { ...typography.bodySmall, color: colors.success, fontWeight: '600', marginLeft: spacing.xs },
    urlBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
        borderRadius: borderRadius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border,
    },
    urlText: { flex: 1, ...typography.caption, color: colors.primary, marginRight: spacing.sm },

    buttonDisabled: { opacity: 0.5 },
    cameraButtons: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.md },
    cameraButton: { flex: 1, alignItems: 'center' },
    cameraButtonIcon: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center', ...shadows.md,
    },
    galleryButton: {},
    galleryButtonIcon: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary },
    cameraButtonText: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '500', marginTop: spacing.sm },
    galleryButtonText: { color: colors.primary },
    tipsContainer: { backgroundColor: colors.info + '10', borderRadius: borderRadius.lg, padding: spacing.lg, marginTop: spacing.lg },
    tipsTitle: { ...typography.body, color: colors.info, fontWeight: '600', marginBottom: spacing.sm },
    tipItem: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    tipBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.info, marginRight: spacing.sm },
    tipText: { ...typography.bodySmall, color: colors.textSecondary },
    section: { marginTop: spacing.lg },
    sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
    emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, backgroundColor: colors.surface, borderRadius: borderRadius.lg },
    emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.md },
    filterContainer: { marginBottom: spacing.md },
    filterContent: { paddingRight: spacing.lg },
    filterChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface,
        borderRadius: borderRadius.round, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border,
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { ...typography.bodySmall, color: colors.textSecondary },
    filterTextActive: { color: colors.textLight, fontWeight: '600' },
    pestList: {},
    pestCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
        borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm,
    },
    pestImage: {
        width: 60, height: 60, borderRadius: borderRadius.md, backgroundColor: colors.background,
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
    },
    pestContent: { flex: 1 },
    pestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pestName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
    severityBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    severityText: { ...typography.caption, fontWeight: '600' },
    pestCropTag: { marginTop: 4 },
    pestCropText: { ...typography.caption, color: colors.textSecondary },
    pestSymptoms: { ...typography.caption, color: colors.textMuted, marginTop: 4, lineHeight: 16 },
    alertsContainer: {},
    alertCard: {
        flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg,
        padding: spacing.md, marginBottom: spacing.md, ...shadows.sm,
    },
    alertIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    alertContent: { flex: 1 },
    alertTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
    alertDescription: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
    alertMeta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
    alertMetaText: { ...typography.caption, color: colors.textMuted, marginLeft: 4 },
    alertTime: { ...typography.caption, color: colors.textMuted, marginLeft: spacing.sm },
    preventionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.sm },
    preventionItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
    preventionNumber: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
    },
    preventionNumberText: { ...typography.caption, color: colors.textLight, fontWeight: '700' },
    preventionText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },
    bottomSpacer: { height: 100 },
});

export default PestScreen;
