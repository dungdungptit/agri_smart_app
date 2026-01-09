import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { pests } from '../../data/mockData';
import { CameraTab, DiagnosisResult, HistoryItem, DetailModal } from './components';

const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;
const PEST_API_URL = process.env.EXPO_PUBLIC_PEST_API_URL;
const PEST_API_KEY = process.env.EXPO_PUBLIC_PEST_API_KEY;
const PEST_API_BASE = 'https://aichat.ptit.edu.vn/v1';
const USER_ID = 'agriapp_user';

const PestScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('camera');
    const [selectedCrop, setSelectedCrop] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [treeType, setTreeType] = useState(1); // 1 = Cà phê, 0 = Mắc ca
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [diagnosisResult, setDiagnosisResult] = useState(null);

    // History states
    const [historyList, setHistoryList] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyFilter, setHistoryFilter] = useState('all'); // 'all', 1, 0
    const [refreshing, setRefreshing] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editName, setEditName] = useState('');
    const [detailModal, setDetailModal] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const filteredPests = selectedCrop === 'all'
        ? pests
        : pests.filter(p => p.crop === selectedCrop);

    // Fetch history when tab changes to 'history'
    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    // Fetch diagnosis history
    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await fetch(
                `${PEST_API_BASE}/conversations?user=${USER_ID}&limit=50`,
                { headers: { 'Authorization': `Bearer ${PEST_API_KEY}` } }
            );
            const data = await response.json();
            setHistoryList(data.data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
            Alert.alert('Lỗi', 'Không thể tải lịch sử chẩn đoán');
        } finally {
            setLoadingHistory(false);
            setRefreshing(false);
        }
    };

    // Filter history by tree type
    const getFilteredHistory = () => {
        if (historyFilter === 'all') return historyList;
        return historyList.filter(item => item.inputs?.tree_type === historyFilter);
    };

    // Rename diagnosis
    const renameDiagnosis = async () => {
        if (!editingItem || !editName.trim()) return;
        try {
            await fetch(
                `${PEST_API_BASE}/conversations/${editingItem}/name`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${PEST_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: editName.trim(), auto_generate: false, user: USER_ID }),
                }
            );
            setHistoryList(prev => prev.map(item =>
                item.id === editingItem ? { ...item, name: editName.trim() } : item
            ));
            setEditingItem(null);
            setEditName('');
        } catch (error) {
            console.error('Error renaming:', error);
            Alert.alert('Lỗi', 'Không thể đổi tên');
        }
    };

    // Delete diagnosis
    const deleteDiagnosis = (id, name) => {
        Alert.alert(
            'Xóa chẩn đoán',
            `Bạn có chắc muốn xóa "${name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await fetch(`${PEST_API_BASE}/conversations/${id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${PEST_API_KEY}`,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ user: USER_ID }),
                            });
                            setHistoryList(prev => prev.filter(item => item.id !== id));
                        } catch (error) {
                            console.error('Error deleting:', error);
                            Alert.alert('Lỗi', 'Không thể xóa');
                        }
                    },
                },
            ]
        );
    };

    // View diagnosis detail
    const viewDetail = async (convId) => {
        setLoadingDetail(true);
        setDetailModal({ loading: true });
        try {
            const response = await fetch(
                `${PEST_API_BASE}/messages?user=${USER_ID}&conversation_id=${convId}`,
                { headers: { 'Authorization': `Bearer ${PEST_API_KEY}` } }
            );
            const data = await response.json();
            const messages = data.data || [];
            setDetailModal({ messages, convId });
        } catch (error) {
            console.error('Error loading detail:', error);
            Alert.alert('Lỗi', 'Không thể tải chi tiết');
            setDetailModal(null);
        } finally {
            setLoadingDetail(false);
        }
    };

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
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onloadend = async () => {
                    const base64data = reader.result.split(',')[1];
                    const formData = new FormData();
                    formData.append('key', IMGBB_API_KEY);
                    formData.append('image', base64data);
                    try {
                        const uploadResponse = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
                        const data = await uploadResponse.json();
                        if (data.success) {
                            const url = data.data.url;
                            setUploadedUrl(url);
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

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền camera');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setSelectedImage(uri);
            setUploadedUrl(null);
            await uploadToImageBB(uri);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setSelectedImage(uri);
            setUploadedUrl(null);
            await uploadToImageBB(uri);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setUploadedUrl(null);
        setDiagnosisResult(null);
    };

    const handleTreeTypeChange = (type) => {
        if (type !== treeType) {
            setTreeType(type);
            setDiagnosisResult(null);
        }
    };

    const diagnoseDisease = async () => {
        if (!uploadedUrl) {
            Alert.alert('Thông báo', 'Vui lòng chụp hoặc chọn ảnh trước');
            return;
        }
        setIsDiagnosing(true);
        setDiagnosisResult(null);
        try {
            const requestBody = {
                inputs: { tree_type: treeType },
                query: "Đây là bệnh gì?",
                response_mode: "blocking",
                conversation_id: "",
                user: USER_ID,
                files: [{ type: "image", transfer_method: "remote_url", url: uploadedUrl }]
            };
            const response = await fetch(PEST_API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${PEST_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();
            if (data.answer) {
                setDiagnosisResult({ answer: data.answer });
            } else {
                Alert.alert('Lỗi', 'Không thể phân tích ảnh');
            }
        } catch (error) {
            console.error('Diagnosis error:', error);
            Alert.alert('Lỗi', 'Không thể kết nối đến server');
        } finally {
            setIsDiagnosing(false);
        }
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
                <TouchableOpacity style={[styles.tab, activeTab === 'camera' && styles.tabActive]} onPress={() => setActiveTab('camera')}>
                    <Ionicons name="camera" size={20} color={activeTab === 'camera' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'camera' && styles.tabTextActive]}>Chẩn đoán</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.tabActive]} onPress={() => setActiveTab('history')}>
                    <Ionicons name="time" size={20} color={activeTab === 'history' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>Lịch sử</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'list' && styles.tabActive]} onPress={() => setActiveTab('list')}>
                    <Ionicons name="list" size={20} color={activeTab === 'list' ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>Bệnh</Text>
                </TouchableOpacity>
            </View>

            {/* Tree Type Selector - camera & history tabs */}
            {(activeTab === 'camera' || activeTab === 'history') && (
                <View style={styles.treeTypeContainer}>
                    <TouchableOpacity
                        style={[styles.treeTypeButton, (activeTab === 'camera' ? treeType : historyFilter) === 1 && styles.treeTypeButtonActive]}
                        onPress={() => activeTab === 'camera' ? handleTreeTypeChange(1) : setHistoryFilter(1)}
                    >
                        <Text style={styles.treeTypeEmoji}>☕</Text>
                        <Text style={[styles.treeTypeText, (activeTab === 'camera' ? treeType : historyFilter) === 1 && styles.treeTypeTextActive]}>Cà phê</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.treeTypeButton, (activeTab === 'camera' ? treeType : historyFilter) === 0 && styles.treeTypeButtonActive]}
                        onPress={() => activeTab === 'camera' ? handleTreeTypeChange(0) : setHistoryFilter(0)}
                    >
                        <Text style={styles.treeTypeEmoji}>🌰</Text>
                        <Text style={[styles.treeTypeText, (activeTab === 'camera' ? treeType : historyFilter) === 0 && styles.treeTypeTextActive]}>Mắc ca</Text>
                    </TouchableOpacity>
                    {activeTab === 'history' && (
                        <TouchableOpacity
                            style={[styles.treeTypeButton, historyFilter === 'all' && styles.treeTypeButtonActive]}
                            onPress={() => setHistoryFilter('all')}
                        >
                            <Text style={styles.treeTypeEmoji}>📋</Text>
                            <Text style={[styles.treeTypeText, historyFilter === 'all' && styles.treeTypeTextActive]}>Tất cả</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={activeTab === 'history' ? <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHistory(); }} /> : undefined}
            >
                {/* Camera Tab */}
                {activeTab === 'camera' && (
                    <>
                        <CameraTab
                            selectedImage={selectedImage}
                            uploadedUrl={uploadedUrl}
                            isUploading={isUploading}
                            isDiagnosing={isDiagnosing}
                            diagnosisResult={diagnosisResult}
                            onTakePhoto={takePhoto}
                            onPickImage={pickImage}
                            onClearImage={clearImage}
                            onDiagnose={diagnoseDisease}
                        />

                        {diagnosisResult && (
                            <DiagnosisResult
                                result={diagnosisResult}
                                onNewDiagnosis={clearImage}
                            />
                        )}
                    </>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <>
                        {loadingHistory ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
                            </View>
                        ) : getFilteredHistory().length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={60} color={colors.textMuted} />
                                <Text style={styles.emptyText}>Chưa có lịch sử chẩn đoán</Text>
                            </View>
                        ) : (
                            <View style={styles.historyList}>
                                {getFilteredHistory().map((item) => (
                                    <HistoryItem
                                        key={item.id}
                                        item={item}
                                        isEditing={editingItem === item.id}
                                        editName={editName}
                                        onEditNameChange={setEditName}
                                        onSaveEdit={renameDiagnosis}
                                        onCancelEdit={() => setEditingItem(null)}
                                        onStartEdit={() => { setEditingItem(item.id); setEditName(item.name || ''); }}
                                        onDelete={() => deleteDiagnosis(item.id, item.name)}
                                        onViewDetail={() => viewDetail(item.id)}
                                    />
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* Disease List Tab */}
                {activeTab === 'list' && (
                    <>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                            <TouchableOpacity style={[styles.filterChip, selectedCrop === 'all' && styles.filterChipActive]} onPress={() => setSelectedCrop('all')}>
                                <Text style={[styles.filterText, selectedCrop === 'all' && styles.filterTextActive]}>Tất cả</Text>
                            </TouchableOpacity>
                            {['Cà phê', 'Mắc ca'].map((crop) => (
                                <TouchableOpacity key={crop} style={[styles.filterChip, selectedCrop === crop && styles.filterChipActive]} onPress={() => setSelectedCrop(crop)}>
                                    <Text style={[styles.filterText, selectedCrop === crop && styles.filterTextActive]}>{crop}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={styles.pestList}>
                            {filteredPests.map((pest) => (
                                <TouchableOpacity key={pest.id} style={styles.pestCard}>
                                    <View style={styles.pestImage}>
                                        <Ionicons name="bug" size={32} color={getSeverityColor(pest.severity)} />
                                    </View>
                                    <View style={styles.pestContent}>
                                        <View style={styles.pestHeader}>
                                            <Text style={styles.pestName}>{pest.name}</Text>
                                            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(pest.severity) + '20' }]}>
                                                <Text style={[styles.severityText, { color: getSeverityColor(pest.severity) }]}>{getSeverityLabel(pest.severity)}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.pestSymptoms} numberOfLines={2}>{pest.symptoms}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Detail Modal */}
            <DetailModal
                visible={!!detailModal}
                detail={detailModal}
                loading={loadingDetail}
                onClose={() => setDetailModal(null)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
    headerTitle: { ...typography.h2, color: colors.textPrimary },
    alertButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', ...shadows.sm },
    alertBadge: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.error, borderWidth: 2, borderColor: colors.surface },
    tabContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm, borderRadius: borderRadius.md, marginHorizontal: 2 },
    tabActive: { backgroundColor: colors.primaryLight + '20' },
    tabText: { ...typography.caption, color: colors.textSecondary, marginLeft: 4 },
    tabTextActive: { color: colors.primary, fontWeight: '600' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: spacing.lg },

    // Tree type selector
    treeTypeContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, gap: spacing.xs },
    treeTypeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xs, borderRadius: borderRadius.md, backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border },
    treeTypeButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    treeTypeEmoji: { fontSize: 16, marginRight: 4 },
    treeTypeText: { ...typography.caption, fontWeight: '600', color: colors.textSecondary },
    treeTypeTextActive: { color: colors.primary },

    // Camera section
    cameraSection: { marginBottom: spacing.md },
    cameraPlaceholder: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.xxl, alignItems: 'center', borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
    cameraTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' },
    cameraDescription: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
    imagePreviewContainer: { position: 'relative', borderRadius: borderRadius.xl, overflow: 'hidden', ...shadows.md },
    imagePreview: { width: '100%', height: 220, borderRadius: borderRadius.xl },
    clearImageButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white', borderRadius: 16 },
    uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    uploadingText: { color: colors.textLight, marginTop: spacing.sm, ...typography.body },
    diagnoseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.success, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, marginTop: spacing.md, ...shadows.md },
    diagnoseButtonText: { ...typography.body, color: colors.textLight, fontWeight: '700', marginLeft: spacing.sm },
    cameraButtons: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.md },
    cameraButton: { flex: 1, alignItems: 'center' },
    cameraButtonIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', ...shadows.md },
    galleryButton: {},
    galleryButtonIcon: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary },
    cameraButtonText: { ...typography.caption, color: colors.textPrimary, fontWeight: '500', marginTop: spacing.xs },
    galleryButtonText: { color: colors.primary },
    buttonDisabled: { opacity: 0.5 },

    // Diagnosis result
    diagnosingContainer: { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.surface, borderRadius: borderRadius.lg, marginTop: spacing.md },
    diagnosingText: { ...typography.body, color: colors.primary, fontWeight: '600', marginTop: spacing.md },
    resultContainer: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg, marginTop: spacing.md, ...shadows.md },
    resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    resultTitle: { ...typography.h3, color: colors.textPrimary, marginLeft: spacing.sm },
    newDiagnosisButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, marginTop: spacing.md, borderWidth: 1, borderColor: colors.primary },
    newDiagnosisText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600', marginLeft: spacing.xs },

    // History tab
    loadingContainer: { alignItems: 'center', paddingVertical: spacing.xxl },
    loadingText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.md },
    emptyState: { alignItems: 'center', paddingVertical: spacing.xxl, backgroundColor: colors.surface, borderRadius: borderRadius.lg },
    emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.md },
    historyList: {},
    historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    historyContent: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    historyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
    historyEmoji: { fontSize: 20 },
    historyInfo: { flex: 1 },
    historyName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
    historyMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    historyTree: { ...typography.caption, color: colors.primary, marginRight: spacing.sm },
    historyDate: { ...typography.caption, color: colors.textMuted },
    historyActions: { flexDirection: 'row' },
    actionBtn: { padding: spacing.xs, marginLeft: spacing.xs },
    editRow: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    editInput: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.sm, padding: spacing.xs, ...typography.body },
    editBtn: { padding: spacing.xs, marginLeft: spacing.xs },

    // Disease list tab
    filterContainer: { marginBottom: spacing.md },
    filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, borderRadius: borderRadius.round, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { ...typography.bodySmall, color: colors.textSecondary },
    filterTextActive: { color: colors.textLight, fontWeight: '600' },
    pestList: {},
    pestCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    pestImage: { width: 50, height: 50, borderRadius: borderRadius.md, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
    pestContent: { flex: 1 },
    pestHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pestName: { ...typography.body, color: colors.textPrimary, fontWeight: '600', flex: 1 },
    severityBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
    severityText: { ...typography.caption, fontWeight: '600' },
    pestSymptoms: { ...typography.caption, color: colors.textMuted, marginTop: 4, lineHeight: 16 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '85%', padding: spacing.lg },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { ...typography.h3, color: colors.textPrimary },
    modalScroll: { marginTop: spacing.md },
    messageItem: { marginBottom: spacing.lg },
    messageImage: { width: '100%', height: 180, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
    messageQuery: { ...typography.body, color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
    errorText: { ...typography.body, color: colors.error },

    bottomSpacer: { height: 100 },
});

export default PestScreen;
