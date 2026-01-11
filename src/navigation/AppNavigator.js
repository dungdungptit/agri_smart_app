import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';

// Screens
import SplashScreen from '../screens/splash/SplashScreen';
import TermsScreen from '../screens/onboarding/TermsScreen';
import LocationScreen from '../screens/onboarding/LocationScreen';
import CropSelectionScreen from '../screens/onboarding/CropSelectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import HomeScreen from '../screens/home/HomeScreen';
import WeatherScreen from '../screens/weather/WeatherScreen';
import PestScreen from '../screens/pest/PestScreen';
import MarketScreen from '../screens/market/MarketScreen';
import MarketPriceDetailScreen from '../screens/market/MarketPriceDetailScreen';
import GAPScreen from '../screens/gap/GAPScreen';
import QnAScreen from '../screens/qna/QnAScreen';
import AIChatScreen from '../screens/qna/AIChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    // Use custom image for AI Chat
                    if (route.name === 'AIChat') {
                        return (
                            <Image
                                source={require('../../assets/icon_tro_li_AI.png')}
                                style={{ width: size, height: size, opacity: focused ? 1 : 0.6 }}
                                resizeMode="contain"
                            />
                        );
                    }
                    let iconName;
                    switch (route.name) {
                        case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
                        case 'Pest': iconName = focused ? 'bug' : 'bug-outline'; break;
                        case 'Weather': iconName = focused ? 'partly-sunny' : 'partly-sunny-outline'; break;
                        case 'More': iconName = focused ? 'grid' : 'grid-outline'; break;
                        default: iconName = 'ellipse';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    paddingTop: 8,
                    paddingBottom: 16,
                    height: 75,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
            <Tab.Screen name="Pest" component={PestScreen} options={{ tabBarLabel: 'Sâu bệnh' }} />
            <Tab.Screen name="AIChat" component={AIChatScreen} options={{ tabBarLabel: 'Trợ lý AI' }} />
            <Tab.Screen name="Weather" component={WeatherScreen} options={{ tabBarLabel: 'Thời tiết' }} />
            <Tab.Screen name="More" component={MoreScreen} options={{ tabBarLabel: 'Thêm' }} />
        </Tab.Navigator>
    );
};

// More Screen with additional navigation options
const MoreScreen = ({ navigation }) => {
    const { user, isLoggedIn, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogout = () => {
        const performLogout = async () => {
            setIsLoggingOut(true);
            await logout();
            setIsLoggingOut(false);
            // Navigate to Login screen
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                performLogout();
            }
        } else {
            Alert.alert(
                'Đăng xuất',
                'Bạn có chắc chắn muốn đăng xuất?',
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Đăng xuất',
                        style: 'destructive',
                        onPress: performLogout,
                    },
                ]
            );
        }
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    const menuItems = [
        { title: 'Kiến thức GAP', icon: 'book', screen: 'GAP', color: colors.primary },
        { title: 'Diễn đàn', icon: 'chatbubbles', screen: 'QnA', color: colors.info },
        { title: 'Thị trường', icon: 'trending-up', screen: 'Market', color: colors.warning },
        { title: 'Mua/Bán', icon: 'cart', screen: 'Market', color: colors.success },
        { title: 'Phân bón', icon: 'leaf', screen: null, color: colors.success },
        { title: 'Cài đặt', icon: 'settings', screen: null, color: colors.textSecondary },
        { title: 'Hỗ trợ', icon: 'help-circle', screen: null, color: colors.accent },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>Thêm</Text>
            </View>

            {/* User Profile Section */}
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                <View style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: isLoggedIn ? colors.primary + '20' : colors.textMuted + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                    }}>
                        <Ionicons
                            name={isLoggedIn ? 'person' : 'person-outline'}
                            size={24}
                            color={isLoggedIn ? colors.primary : colors.textMuted}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        {isLoggedIn ? (
                            <>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                                    {user?.phoneNumber || 'Người dùng'}
                                </Text>
                                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                                    Đã xác thực
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                                    Khách
                                </Text>
                                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                                    Chưa đăng nhập
                                </Text>
                            </>
                        )}
                    </View>
                    {isLoggedIn ? (
                        <TouchableOpacity
                            onPress={handleLogout}
                            disabled={isLoggingOut}
                            style={{
                                backgroundColor: colors.error + '15',
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 8,
                            }}
                        >
                            {isLoggingOut ? (
                                <ActivityIndicator size="small" color={colors.error} />
                            ) : (
                                <Text style={{ color: colors.error, fontWeight: '600', fontSize: 13 }}>
                                    Đăng xuất
                                </Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleLogin}
                            style={{
                                backgroundColor: colors.primary,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                            }}
                        >
                            <Text style={{ color: colors.textLight, fontWeight: '600', fontSize: 13 }}>
                                Đăng nhập
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={{
                            flexDirection: 'row', alignItems: 'center',
                            backgroundColor: colors.surface, borderRadius: 12,
                            padding: 16, marginBottom: 10,
                        }}
                        onPress={() => item.screen && navigation.navigate(item.screen)}
                    >
                        <View style={{
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: item.color + '20',
                            justifyContent: 'center', alignItems: 'center', marginRight: 12
                        }}>
                            <Ionicons name={item.icon} size={22} color={item.color} />
                        </View>
                        <Text style={{ flex: 1, fontSize: 16, color: colors.textPrimary, fontWeight: '500' }}>
                            {item.title}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

// Main App Navigator
const AppNavigator = () => {
    const { isLoading, isLoggedIn } = useAuth();

    // Show loading screen while checking auth state
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 16, color: colors.textSecondary }}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={isLoggedIn ? "MainTabs" : "Splash"}
                screenOptions={{ headerShown: false }}
            >
                {/* Onboarding Flow */}
                <Stack.Screen name="Splash" component={SplashScreen} options={{ title: 'Khởi động' }} />
                <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Điều khoản' }} />
                <Stack.Screen name="Location" component={LocationScreen} options={{ title: 'Vị trí' }} />
                <Stack.Screen name="CropSelection" component={CropSelectionScreen} options={{ title: 'Chọn cây trồng' }} />

                {/* Auth Flow */}
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Đăng nhập' }} />
                <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'Xác thực OTP' }} />

                {/* Main App */}
                <Stack.Screen name="MainTabs" component={MainTabs} options={{ title: 'Trang chủ' }} />

                {/* Additional Screens */}
                <Stack.Screen name="GAP" component={GAPScreen} options={{ title: 'Kiến thức GAP' }} />
                <Stack.Screen name="QnA" component={QnAScreen} options={{ title: 'Diễn đàn' }} />
                <Stack.Screen name="AIChat" component={AIChatScreen} options={{ title: 'Trợ lý AI' }} />
                <Stack.Screen name="MarketPriceDetail" component={MarketPriceDetailScreen} options={{ title: 'Chi tiết giá thị trường' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
