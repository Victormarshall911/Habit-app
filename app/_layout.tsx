import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initializeNotifications } from '../src/services/notifications';
import { updateAppIcon } from '../src/services/appIcon';
import { useHabitStore } from '../src/store/habitStore';
import { useTheme } from '../src/hooks/useTheme';

export default function RootLayout() {
    const { colors, isDark } = useTheme();
    const hasAnyBrokenStreak = useHabitStore((s) => s.hasAnyBrokenStreak);
    const habits = useHabitStore((s) => s.habits);

    useEffect(() => {
        // Initialize notifications on first launch
        initializeNotifications();
    }, []);

    useEffect(() => {
        // Update app icon whenever habits change
        if (habits.length > 0) {
            const broken = hasAnyBrokenStreak();
            updateAppIcon(!broken);
        }
    }, [habits]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.background },
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="add-habit"
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_bottom',
                        }}
                    />
                    <Stack.Screen
                        name="habit/[id]"
                        options={{
                            animation: 'slide_from_right',
                        }}
                    />
                </Stack>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
