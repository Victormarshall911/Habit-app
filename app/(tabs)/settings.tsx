import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Notifications from 'expo-notifications';

import { useTheme } from '../../src/hooks/useTheme';
import {
    scheduleHabitReminders,
    cancelAllReminders,
} from '../../src/services/notifications';
import { isIconSwitchingAvailable } from '../../src/services/appIcon';
import {
    Spacing,
    Typography,
    BorderRadius,
    Shadows,
} from '../../src/constants/theme';

export default function SettingsScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        // Check current notification permission status
        Notifications.getPermissionsAsync().then(({ status }) => {
            setNotificationsEnabled(status === 'granted');
        });
    }, []);

    const handleToggleNotifications = async (value: boolean) => {
        if (value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                await scheduleHabitReminders();
                setNotificationsEnabled(true);
            } else {
                Alert.alert(
                    'Permissions Required',
                    'Please enable notifications in your device settings to receive habit reminders.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() },
                    ]
                );
            }
        } else {
            await cancelAllReminders();
            setNotificationsEnabled(false);
        }
    };

    const iconAvailable = isIconSwitchingAvailable();

    const SettingRow = ({
        icon,
        iconColor,
        title,
        subtitle,
        rightElement,
        onPress,
        delay = 0,
    }: {
        icon: string;
        iconColor: string;
        title: string;
        subtitle?: string;
        rightElement?: React.ReactNode;
        onPress?: () => void;
        delay?: number;
    }) => (
        <Animated.View entering={FadeInDown.delay(delay).springify()}>
            <TouchableOpacity
                style={[
                    styles.settingRow,
                    {
                        backgroundColor: isDark
                            ? 'rgba(255,255,255,0.04)'
                            : 'rgba(0,0,0,0.02)',
                        borderColor: colors.border,
                    },
                ]}
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                <View
                    style={[
                        styles.iconContainer,
                        { backgroundColor: iconColor + '20' },
                    ]}
                >
                    <Ionicons name={icon as any} size={20} color={iconColor} />
                </View>
                <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text
                            style={[styles.settingSubtitle, { color: colors.textSecondary }]}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
                {rightElement}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + Spacing.lg,
                    paddingBottom: 120,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    style={[
                        styles.title,
                        { color: colors.text, paddingHorizontal: Spacing.xl },
                    ]}
                >
                    Settings
                </Text>

                {/* Notifications Section */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    NOTIFICATIONS
                </Text>

                <SettingRow
                    icon="notifications"
                    iconColor={colors.primary}
                    title="Habit Reminders"
                    subtitle="Get reminded every 4 hours"
                    delay={100}
                    rightElement={
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleToggleNotifications}
                            trackColor={{ false: colors.surfaceLight, true: colors.primary + '50' }}
                            thumbColor={notificationsEnabled ? colors.primary : colors.textMuted}
                        />
                    }
                />

                <SettingRow
                    icon="time"
                    iconColor={colors.accent}
                    title="Reminder Schedule"
                    subtitle="8:00 AM · 12:00 PM · 4:00 PM · 8:00 PM"
                    delay={150}
                />

                {/* App Icon Section */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    APP ICON
                </Text>

                <SettingRow
                    icon="happy"
                    iconColor={colors.success}
                    title="Dynamic App Icon"
                    subtitle={
                        iconAvailable
                            ? 'Changes based on your streak status'
                            : 'Requires a dev build to enable'
                    }
                    delay={200}
                    rightElement={
                        <View
                            style={[
                                styles.badge,
                                {
                                    backgroundColor: iconAvailable
                                        ? colors.success + '20'
                                        : colors.textMuted + '20',
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    {
                                        color: iconAvailable ? colors.success : colors.textMuted,
                                    },
                                ]}
                            >
                                {iconAvailable ? 'Active' : 'Unavailable'}
                            </Text>
                        </View>
                    }
                />

                {/* About Section */}
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                    ABOUT
                </Text>

                <SettingRow
                    icon="information-circle"
                    iconColor={colors.warm}
                    title="HabitFlow"
                    subtitle="Version 1.0.0"
                    delay={300}
                />

                <SettingRow
                    icon="heart"
                    iconColor={colors.fire}
                    title="Built with ❤️"
                    subtitle="React Native + Expo"
                    delay={350}
                />

                {/* Theme Info */}
                <Animated.View
                    entering={FadeInDown.delay(400).springify()}
                    style={styles.themeInfo}
                >
                    <Ionicons
                        name={isDark ? 'moon' : 'sunny'}
                        size={16}
                        color={colors.textMuted}
                    />
                    <Text style={[styles.themeText, { color: colors.textMuted }]}>
                        {isDark ? 'Dark' : 'Light'} mode · Follows system
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        ...Typography.largeTitle,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        ...Typography.caption,
        fontWeight: '600',
        letterSpacing: 1,
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.sm,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        ...Typography.headline,
    },
    settingSubtitle: {
        ...Typography.caption,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    badgeText: {
        ...Typography.caption2,
        fontWeight: '700',
    },
    themeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing['3xl'],
        gap: Spacing.sm,
    },
    themeText: {
        ...Typography.footnote,
    },
});
