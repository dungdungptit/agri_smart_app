import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { sendPing } from './src/services/cmsService';

// T015: Inner component so useAuth() is inside AuthProvider
const AppWithPing = () => {
    const { user } = useAuth();
    const intervalRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);

    useEffect(() => {
        const startPing = () => {
            sendPing(user, 'home');
            intervalRef.current = setInterval(() => sendPing(user, 'home'), 30000);
        };

        const stopPing = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const handleAppStateChange = (nextState) => {
            if (appStateRef.current !== 'active' && nextState === 'active') {
                startPing();
            } else if (appStateRef.current === 'active' && nextState !== 'active') {
                stopPing();
            }
            appStateRef.current = nextState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        startPing();

        return () => {
            stopPing();
            subscription.remove();
        };
    }, [user]);

    return (
        <>
            <StatusBar style="auto" />
            <AppNavigator />
        </>
    );
};

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <AppWithPing />
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
