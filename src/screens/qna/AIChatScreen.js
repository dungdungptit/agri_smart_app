import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
    Alert,
    Modal,
    Dimensions,
    Image,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Markdown from 'react-native-markdown-display';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getEffectiveUserId, trackConversation, trackPageview } from '../../services/cmsService';

const API_URL = process.env.EXPO_PUBLIC_DIFY_API_URL;
const API_BASE = process.env.EXPO_PUBLIC_DIFY_API_BASE;
const API_KEY = process.env.EXPO_PUBLIC_DIFY_API_KEY;
const IMGBB_API_KEY = process.env.EXPO_PUBLIC_IMGBB_API_KEY;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

const AIChatScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState('');
    const [treeType, setTreeType] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const scrollViewRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Sidebar states
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [editingConversation, setEditingConversation] = useState(null);
    const [editName, setEditName] = useState('');
    const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

    // T017: Track pageview when this tab gains focus
    useFocusEffect(useCallback(() => {
        trackPageview(user, 'chat');
    }, [user]));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        showWelcomeMessage();
    }, []);

    const showWelcomeMessage = () => {
        setMessages([{
            id: 'welcome',
            type: 'ai',
            text: `Xin chào! 👋 Tôi là trợ lý AI chuyên về **Nông nghiệp Điện Biên**.\n\nHãy đặt câu hỏi, tôi luôn sẵn sàng hỗ trợ bạn`,
            timestamp: new Date(),
        }]);
    };

    // Toggle sidebar
    const toggleSidebar = () => {
        if (sidebarVisible) {
            Animated.timing(sidebarAnim, {
                toValue: -SIDEBAR_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }).start(() => setSidebarVisible(false));
        } else {
            setSidebarVisible(true);
            fetchConversations();
            Animated.timing(sidebarAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    };

    // Fetch conversations list
    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const response = await fetch(
                `${API_BASE}/conversations?user=${getEffectiveUserId(user)}&limit=20`,
                {
                    headers: { 'Authorization': `Bearer ${API_KEY}` },
                }
            );
            const data = await response.json();
            setConversations(data.data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoadingConversations(false);
        }
    };

    // Load conversation messages
    const loadConversation = async (convId) => {
        setIsLoading(true);
        toggleSidebar();

        try {
            const response = await fetch(
                `${API_BASE}/messages?user=${getEffectiveUserId(user)}&conversation_id=${convId}`,
                {
                    headers: { 'Authorization': `Bearer ${API_KEY}` },
                }
            );
            const data = await response.json();

            setConversationId(convId);

            // Convert API messages to app format
            const loadedMessages = [];
            (data.data || []).reverse().forEach(msg => {
                // User message
                loadedMessages.push({
                    id: msg.id + '-user',
                    type: 'user',
                    text: msg.query,
                    timestamp: new Date(msg.created_at * 1000),
                });
                // AI message
                loadedMessages.push({
                    id: msg.id,
                    type: 'ai',
                    text: msg.answer,
                    timestamp: new Date(msg.created_at * 1000),
                });
            });

            setMessages(loadedMessages.length > 0 ? loadedMessages : [{
                id: 'loaded',
                type: 'ai',
                text: 'Cuộc trò chuyện đã được tải. Tiếp tục hỏi đáp!',
                timestamp: new Date(),
            }]);

            // Find tree type from conversation
            const conv = conversations.find(c => c.id === convId);
            if (conv?.inputs?.tree_type !== undefined) {
                setTreeType(conv.inputs.tree_type);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            Alert.alert('Lỗi', 'Không thể tải cuộc trò chuyện');
        } finally {
            setIsLoading(false);
        }
    };

    // Rename conversation
    const renameConversation = async () => {
        if (!editingConversation || !editName.trim()) return;

        try {
            await fetch(
                `${API_BASE}/conversations/${editingConversation}/name`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: editName.trim(),
                        auto_generate: false,
                        user: getEffectiveUserId(user),
                    }),
                }
            );

            setConversations(prev => prev.map(c =>
                c.id === editingConversation ? { ...c, name: editName.trim() } : c
            ));
            setEditingConversation(null);
            setEditName('');
        } catch (error) {
            console.error('Error renaming conversation:', error);
            Alert.alert('Lỗi', 'Không thể đổi tên');
        }
    };

    // Delete conversation
    const deleteConversation = (convId) => {
        Alert.alert(
            'Xóa cuộc trò chuyện',
            'Bạn có chắc muốn xóa cuộc trò chuyện này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await fetch(
                                `${API_BASE}/conversations/${convId}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': `Bearer ${API_KEY}`,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ user: getEffectiveUserId(user) }),
                                }
                            );

                            setConversations(prev => prev.filter(c => c.id !== convId));

                            // If deleted current conversation, start new one
                            if (convId === conversationId) {
                                startNewConversation();
                            }
                        } catch (error) {
                            console.error('Error deleting conversation:', error);
                            Alert.alert('Lỗi', 'Không thể xóa');
                        }
                    },
                },
            ]
        );
    };

    const handleTreeTypeChange = (type) => {
        if (type !== treeType) {
            setTreeType(type);
            setConversationId('');
            setMessages([{
                id: 'welcome-' + Date.now(),
                type: 'ai',
                text: `Hãy đặt câu hỏi, tôi sẽ giúp bạn!`,
                timestamp: new Date(),
            }]);
        }
    };

    const parseAIResponse = (answer) => {
        try {
            const parsed = JSON.parse(answer);
            let text = '';
            if (parsed.loai_benh) text += `**${parsed.loai_benh}**\n\n`;
            if (parsed.chan_doan) text += parsed.chan_doan + '\n\n';
            if (parsed.nguyen_nhan) text += `### Nguyên nhân\n${parsed.nguyen_nhan}\n\n`;
            if (parsed.phac_do_dieu_tri) {
                text += '### Phác đồ điều trị\n';
                if (parsed.phac_do_dieu_tri.bien_phap_hoa_hoc)
                    text += `- **Hóa học:** ${parsed.phac_do_dieu_tri.bien_phap_hoa_hoc}\n`;
                if (parsed.phac_do_dieu_tri.bien_phap_canh_tac)
                    text += `- **Canh tác:** ${parsed.phac_do_dieu_tri.bien_phap_canh_tac}\n`;
                if (parsed.phac_do_dieu_tri.thuoc_goi_y?.length > 0)
                    text += `- **Thuốc gợi ý:** ${parsed.phac_do_dieu_tri.thuoc_goi_y.join(', ')}\n`;
                text += '\n';
            }
            if (parsed.danh_sach_benh_chinh?.length > 0) {
                text += '### Danh sách bệnh\n';
                parsed.danh_sach_benh_chinh.forEach((benh, i) => {
                    text += `${i + 1}. **${benh.ten_benh}**\n   - ${benh.trieu_chung}\n`;
                });
                text += '\n';
            }
            if (parsed.luu_y) text += `> ⚠️ **Lưu ý:** ${parsed.luu_y}`;
            return text;
        } catch (e) {
            return answer;
        }
    };

    const getBase64FromUri = async (uri) => {
        if (Platform.OS === 'web') {
            const response = await fetch(uri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
        return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    };

    const uploadToImgBB = async (uri) => {
        setIsUploading(true);
        try {
            const base64 = await getBase64FromUri(uri);
            const formData = new FormData();
            formData.append('key', IMGBB_API_KEY);
            formData.append('image', base64);
            const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setImageUrl(data.data.url);
                return data.data.url;
            }
            throw new Error(data.error?.message || 'Upload failed');
        } catch (e) {
            console.error('ImgBB upload error:', e);
            Alert.alert('Lỗi', 'Không thể upload ảnh. Vui lòng thử lại.');
            setSelectedImage(null);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setSelectedImage(uri);
            setImageUrl(null);
            await uploadToImgBB(uri);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImageUrl(null);
    };

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;
        if (isUploading) {
            Alert.alert('Vui lòng chờ', 'Ảnh đang được upload...');
            return;
        }

        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            text: inputText.trim(),
            image: imageUrl || null,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        const currentImageUrl = imageUrl;
        setSelectedImage(null);
        setImageUrl(null);
        setIsLoading(true);

        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const requestBody = {
                inputs: { tree_type: treeType },
                query: userMessage.text,
                response_mode: 'blocking',
                user: getEffectiveUserId(user),
            };

            if (currentImageUrl) {
                requestBody.files = [{
                    type: 'image',
                    transfer_method: 'remote_url',
                    url: currentImageUrl,
                }];
            }

            if (conversationId) {
                requestBody.conversation_id = conversationId;
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (data.conversation_id) {
                // T010: Track new conversation in CMS on first message only
                if (!conversationId) {
                    trackConversation(user);
                }
                setConversationId(data.conversation_id);
            }

            const parsedText = parseAIResponse(data.answer || 'Xin lỗi, tôi không thể xử lý yêu cầu này.');

            const aiMessage = {
                id: data.message_id || 'ai-' + Date.now(),
                type: 'ai',
                text: parsedText,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('API Error:', error);
            const errorMessage = {
                id: 'error-' + Date.now(),
                type: 'ai',
                text: '❌ **Lỗi kết nối**\n\nXin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                isError: true,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const startNewConversation = () => {
        setConversationId('');
        showWelcomeMessage();
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const markdownStyles = {
        body: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
        heading1: { color: colors.primary, fontSize: 20, fontWeight: '700', marginTop: 12, marginBottom: 8 },
        heading2: { color: colors.primary, fontSize: 18, fontWeight: '700', marginTop: 10, marginBottom: 6 },
        heading3: { color: colors.primaryDark, fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 4 },
        heading4: { color: colors.textPrimary, fontSize: 15, fontWeight: '600', marginTop: 8, marginBottom: 4 },
        strong: { fontWeight: '700', color: colors.textPrimary },
        em: { fontStyle: 'italic' },
        bullet_list: { marginLeft: 4 },
        ordered_list: { marginLeft: 4 },
        list_item: { marginBottom: 4 },
        blockquote: {
            backgroundColor: colors.accent + '20',
            borderLeftWidth: 4,
            borderLeftColor: colors.accent,
            paddingLeft: 12,
            paddingVertical: 8,
            marginVertical: 8,
            borderRadius: 4,
        },
        code_inline: {
            backgroundColor: colors.background,
            color: colors.primary,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            fontSize: 13,
        },
        hr: { backgroundColor: colors.border, height: 1, marginVertical: 16 },
        paragraph: { marginVertical: 4 },
        link: { color: colors.info, textDecorationLine: 'underline' },
    };

    const renderMessage = (message) => {
        const isUser = message.type === 'user';

        return (
            <Animated.View
                key={message.id}
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessageContainer : styles.aiMessageContainer,
                ]}
            >
                {!isUser && (
                    <View style={styles.aiAvatar}>
                        <Ionicons name="leaf" size={18} color={colors.textLight} />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                    message.isError && styles.errorBubble,
                ]}>
                    {isUser ? (
                        <>
                            {message.image && (
                                <Image
                                    source={{ uri: message.image }}
                                    style={styles.messageImage}
                                    resizeMode="cover"
                                />
                            )}
                            <Text style={styles.userMessageText}>{message.text}</Text>
                        </>
                    ) : (
                        <Markdown style={markdownStyles}>{message.text}</Markdown>
                    )}
                    <Text style={[
                        styles.messageTime,
                        isUser ? styles.userMessageTime : styles.aiMessageTime,
                    ]}>
                        {formatTime(message.timestamp)}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    const renderConversationItem = (conv) => {
        const isEditing = editingConversation === conv.id;
        const isActive = conversationId === conv.id;

        return (
            <View key={conv.id} style={[styles.convItem, isActive && styles.convItemActive]}>
                {isEditing ? (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.editInput}
                            value={editName}
                            onChangeText={setEditName}
                            autoFocus
                            onSubmitEditing={renameConversation}
                        />
                        <TouchableOpacity onPress={renameConversation} style={styles.editButton}>
                            <Ionicons name="checkmark" size={20} color={colors.success} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditingConversation(null)} style={styles.editButton}>
                            <Ionicons name="close" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.convContent}
                            onPress={() => loadConversation(conv.id)}
                        >
                            <View style={styles.convIcon}>
                                <Text>{conv.inputs?.tree_type === 1 ? '☕' : '🌰'}</Text>
                            </View>
                            <View style={styles.convInfo}>
                                <Text style={styles.convName} numberOfLines={1}>
                                    {conv.name || 'Cuộc trò chuyện'}
                                </Text>
                                <Text style={styles.convDate}>{formatDate(conv.updated_at)}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.convActions}>
                            <TouchableOpacity
                                onPress={() => {
                                    setEditingConversation(conv.id);
                                    setEditName(conv.name || '');
                                }}
                                style={styles.convActionBtn}
                            >
                                <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => deleteConversation(conv.id)}
                                style={styles.convActionBtn}
                            >
                                <Ionicons name="trash" size={16} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Sidebar Overlay */}
                {sidebarVisible && (
                    <TouchableOpacity
                        style={styles.overlay}
                        activeOpacity={1}
                        onPress={toggleSidebar}
                    />
                )}

                {/* Sidebar */}
                <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
                    <View style={styles.sidebarHeader}>
                        <Text style={styles.sidebarTitle}>Lịch sử trò chuyện</Text>
                        <TouchableOpacity onPress={toggleSidebar}>
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.newConvButton} onPress={() => { startNewConversation(); toggleSidebar(); }}>
                        <Ionicons name="add-circle" size={20} color={colors.textLight} />
                        <Text style={styles.newConvText}>Cuộc trò chuyện mới</Text>
                    </TouchableOpacity>

                    {loadingConversations ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                    ) : (
                        <ScrollView style={styles.convList} showsVerticalScrollIndicator={false}>
                            {conversations.length === 0 ? (
                                <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
                            ) : (
                                conversations.map(renderConversationItem)
                            )}
                        </ScrollView>
                    )}
                </Animated.View>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Trợ lý AI Điện Biên</Text>
                        <View style={styles.statusContainer}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.statusText}>Trực tuyến</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
                        <Ionicons name="menu" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Tree Type Selector */}
                {/*<View style={styles.treeTypeContainer}>
                    <TouchableOpacity
                        style={[styles.treeTypeButton, treeType === 1 && styles.treeTypeButtonActive]}
                        onPress={() => handleTreeTypeChange(1)}
                    >
                        <Text style={styles.treeTypeEmoji}>☕</Text>
                        <Text style={[styles.treeTypeText, treeType === 1 && styles.treeTypeTextActive]}>Cà phê</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.treeTypeButton, treeType === 0 && styles.treeTypeButtonActive]}
                        onPress={() => handleTreeTypeChange(0)}
                    >
                        <Text style={styles.treeTypeEmoji}>🌰</Text>
                        <Text style={[styles.treeTypeText, treeType === 0 && styles.treeTypeTextActive]}>Mắc ca</Text>
                    </TouchableOpacity>
                </View> */}

                {/* Messages */}
                <View style={styles.chatContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.messagesContainer}
                        contentContainerStyle={styles.messagesContent}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    >
                        {messages.map(renderMessage)}

                        {isLoading && (
                            <View style={[styles.messageContainer, styles.aiMessageContainer]}>
                                <View style={styles.aiAvatar}>
                                    <Ionicons name="leaf" size={18} color={colors.textLight} />
                                </View>
                                <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                                    <View style={styles.typingIndicator}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                        <Text style={styles.typingText}>Đang phân tích...</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Quick Suggestions */}
                    {messages.length <= 1 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.suggestionsContainer}
                            contentContainerStyle={styles.suggestionsContent}
                        >
                            {[
                                treeType === 1 ? 'Địa điểm nào thích hợp trồng cà phê?' : 'Địa điểm nào thích hợp trồng mắc ca?',
                                treeType === 1 ? 'Xã Mường Ảng có thể trồng cà phê không?' : 'Xã Mường Lạn có thể trồng mắc ca không?',
                            ].map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionChip}
                                    onPress={() => setInputText(suggestion)}
                                >
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Input Area */}
                    <View style={styles.inputContainer}>
                        {/* Image preview */}
                        {selectedImage && (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="cover" />
                                {isUploading && (
                                    <View style={styles.imageUploadingOverlay}>
                                        <ActivityIndicator size="small" color={colors.textLight} />
                                    </View>
                                )}
                                <TouchableOpacity style={styles.imageRemoveBtn} onPress={removeImage}>
                                    <Ionicons name="close-circle" size={22} color={colors.error} />
                                </TouchableOpacity>
                                {imageUrl && (
                                    <View style={styles.imageReadyBadge}>
                                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                                    </View>
                                )}
                            </View>
                        )}
                        <View style={styles.inputWrapper}>
                            <TouchableOpacity
                                style={styles.imagePickerBtn}
                                onPress={pickImage}
                                disabled={isLoading}
                            >
                                <Ionicons name="image-outline" size={22} color={selectedImage ? colors.primary : colors.textMuted} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Nhập câu hỏi của bạn..."
                                placeholderTextColor={colors.textMuted}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                                editable={!isLoading}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, (!inputText.trim() || isLoading || isUploading) && styles.sendButtonDisabled]}
                                onPress={sendMessage}
                                disabled={!inputText.trim() || isLoading || isUploading}
                            >
                                <Ionicons
                                    name="send"
                                    size={20}
                                    color={(inputText.trim() && !isLoading && !isUploading) ? colors.textLight : colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    safeArea: { flex: 1 },

    // Sidebar styles
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 100,
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: colors.surface,
        zIndex: 101,
        ...shadows.lg,
    },
    sidebarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingTop: Platform.OS === 'ios' ? 50 : spacing.md,
    },
    sidebarTitle: { ...typography.h3, color: colors.textPrimary },
    newConvButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        margin: spacing.md,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
    },
    newConvText: { ...typography.bodySmall, color: colors.textLight, fontWeight: '600', marginLeft: spacing.xs },
    convList: { flex: 1, paddingHorizontal: spacing.md },
    convItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
    convItemActive: { backgroundColor: colors.primary + '15' },
    convContent: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    convIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
    convInfo: { flex: 1 },
    convName: { ...typography.bodySmall, color: colors.textPrimary, fontWeight: '500' },
    convDate: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
    convActions: { flexDirection: 'row' },
    convActionBtn: { padding: spacing.xs, marginLeft: spacing.xs },
    editContainer: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    editInput: { flex: 1, backgroundColor: colors.background, borderRadius: borderRadius.sm, padding: spacing.xs, ...typography.bodySmall },
    editButton: { padding: spacing.xs, marginLeft: spacing.xs },
    emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl },

    // Header styles
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm, backgroundColor: colors.surface,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    menuButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { ...typography.h3, color: colors.textPrimary },
    statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 4 },
    statusText: { ...typography.caption, color: colors.success },
    newChatButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

    // Tree type styles
    treeTypeContainer: {
        flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        backgroundColor: colors.surface, gap: spacing.sm,
    },
    treeTypeButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.lg,
        backgroundColor: colors.background, borderWidth: 2, borderColor: colors.border,
    },
    treeTypeButtonActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
    treeTypeEmoji: { fontSize: 18, marginRight: spacing.xs },
    treeTypeText: { ...typography.bodySmall, fontWeight: '600', color: colors.textSecondary },
    treeTypeTextActive: { color: colors.primary },

    // Chat styles
    chatContainer: { flex: 1 },
    messagesContainer: { flex: 1 },
    messagesContent: { padding: spacing.md, paddingBottom: spacing.xl },
    messageContainer: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-end' },
    userMessageContainer: { justifyContent: 'flex-end' },
    aiMessageContainer: { justifyContent: 'flex-start' },
    aiAvatar: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
        justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm,
    },
    messageBubble: { maxWidth: '85%', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg },
    userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, ...shadows.sm },
    errorBubble: { backgroundColor: colors.error + '10', borderWidth: 1, borderColor: colors.error + '30' },
    typingBubble: { paddingVertical: spacing.md },
    userMessageText: { ...typography.body, color: colors.textLight, lineHeight: 22 },
    messageTime: { ...typography.caption, marginTop: spacing.xs },
    userMessageTime: { color: 'rgba(255, 255, 255, 0.7)', textAlign: 'right' },
    aiMessageTime: { color: colors.textMuted },
    typingIndicator: { flexDirection: 'row', alignItems: 'center' },
    typingText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: spacing.sm },

    // Suggestions & Input
    suggestionsContainer: { maxHeight: 50, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    suggestionsContent: { gap: spacing.sm },
    suggestionChip: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.primary + '15',
        borderRadius: borderRadius.round, borderWidth: 1, borderColor: colors.primary + '30', marginRight: spacing.sm,
    },
    suggestionText: { ...typography.bodySmall, color: colors.primary, fontWeight: '500' },
    inputContainer: {
        paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
        backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
    },
    imagePreviewContainer: {
        marginBottom: spacing.sm,
        alignSelf: 'flex-start',
        position: 'relative',
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    imageUploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageRemoveBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: colors.surface,
        borderRadius: 11,
    },
    imageReadyBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: colors.surface,
        borderRadius: 8,
    },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'flex-end', backgroundColor: colors.background,
        borderRadius: borderRadius.xl, paddingLeft: spacing.xs, paddingRight: spacing.xs,
        paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.border,
    },
    imagePickerBtn: {
        width: 36, height: 36, justifyContent: 'center', alignItems: 'center',
        marginRight: spacing.xs,
    },
    textInput: { flex: 1, ...typography.body, color: colors.textPrimary, maxHeight: 100, paddingVertical: spacing.sm },
    sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    sendButtonDisabled: { backgroundColor: colors.border },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xs,
    },
});

export default AIChatScreen;
