import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

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
    const { Image } = require('react-native');
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
    const React = require('react');
    const { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } = require('react-native');

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
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
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
