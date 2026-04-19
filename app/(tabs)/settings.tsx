import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Switch, Alert, Linking, Modal, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FadeInView from '../../src/components/FadeInView';
import { useTheme } from '../../src/hooks/useTheme';
import { useHabitStore } from '../../src/store/habitStore';
import {
    scheduleHabitReminders,
    cancelAllReminders,
    getNotificationPermissionStatus,
    requestNotificationPermissions,
} from '../../src/services/notifications';
import { isIconSwitchingAvailable } from '../../src/services/appIcon';
import { Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';

const formatHour = (h: number): string => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:00 ${period}`;
};

const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SettingsScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const reminderHours = useHabitStore((s) => s.reminderHours);
    const setReminderHours = useHabitStore((s) => s.setReminderHours);

    useEffect(() => {
        getNotificationPermissionStatus().then((status) => {
            setNotificationsEnabled(status === 'granted');
        });
    }, []);

    const handleToggleNotifications = async (value: boolean) => {
        try {
            if (value) {
                const granted = await requestNotificationPermissions();
                if (granted) {
                    await scheduleHabitReminders(reminderHours);
                    setNotificationsEnabled(true);
                } else {
                    Alert.alert('Permissions Required',
                        'Please enable notifications in your device settings.',
                        [{ text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Linking.openSettings() }]);
                }
            } else {
                await cancelAllReminders();
                setNotificationsEnabled(false);
            }
        } catch (e) {
            console.warn('Notification toggle failed:', e);
            Alert.alert('Error', 'Something went wrong with notifications.');
        }
    };

    const toggleHour = (hour: number) => {
        const newHours = reminderHours.includes(hour)
            ? reminderHours.filter((h) => h !== hour)
            : [...reminderHours, hour];
        if (newHours.length === 0) {
            Alert.alert('At least one reminder', 'You need at least one reminder time.');
            return;
        }
        setReminderHours(newHours);
    };

    const scheduleSubtitle = reminderHours.map(formatHour).join(' · ');
    const iconAvailable = isIconSwitchingAvailable();

    const SettingRow = ({ icon, iconColor, title, subtitle, rightElement, onPress, delay = 0 }: {
        icon: string; iconColor: string; title: string; subtitle?: string;
        rightElement?: React.ReactNode; onPress?: () => void; delay?: number;
    }) => (
        <FadeInView delay={delay}>
            <TouchableOpacity
                style={[styles.settingRow, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    borderColor: colors.border,
                }]}
                onPress={onPress} disabled={!onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                    <Ionicons name={icon as any} size={20} color={iconColor} />
                </View>
                <View style={styles.settingInfo}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
                    {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>{subtitle}</Text>}
                </View>
                {rightElement}
            </TouchableOpacity>
        </FadeInView>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top + Spacing.lg, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: colors.text, paddingHorizontal: Spacing.xl }]}>Settings</Text>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>NOTIFICATIONS</Text>
                <SettingRow icon="notifications" iconColor={colors.primary} title="Habit Reminders" subtitle="Get reminded throughout the day" delay={100}
                    rightElement={<Switch value={notificationsEnabled} onValueChange={handleToggleNotifications}
                        trackColor={{ false: colors.surfaceLight, true: colors.primary + '50' }}
                        thumbColor={notificationsEnabled ? colors.primary : colors.textMuted} />} />
                <SettingRow icon="time" iconColor={colors.accent} title="Reminder Schedule"
                    subtitle={scheduleSubtitle}
                    delay={150}
                    onPress={() => setShowTimePicker(true)}
                    rightElement={
                        <View style={styles.editChevron}>
                            <Text style={[styles.editLabel, { color: colors.accent }]}>Edit</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                        </View>
                    }
                />
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>APP ICON</Text>
                <SettingRow icon="happy" iconColor={colors.success} title="Dynamic App Icon"
                    subtitle={iconAvailable ? 'Changes based on your streak status' : 'Coming Soon...'} delay={200}
                    rightElement={<View style={[styles.badge, { backgroundColor: (iconAvailable ? colors.success : colors.textMuted) + '20' }]}>
                        <Text style={[styles.badgeText, { color: iconAvailable ? colors.success : colors.textMuted }]}>{iconAvailable ? 'Active' : 'Unavailable'}</Text>
                    </View>} />
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ABOUT</Text>
                <SettingRow icon="information-circle" iconColor={colors.warm} title="HabitFlow" subtitle="Version 1.0.0" delay={300} />
                <SettingRow icon="heart" iconColor={colors.fire} title="Built with ❤️" subtitle="Marshall Victor" delay={350} />
                <FadeInView delay={400} style={styles.themeInfo}>
                    <Ionicons name={isDark ? 'moon' : 'sunny'} size={16} color={colors.textMuted} />
                    <Text style={[styles.themeText, { color: colors.textMuted }]}>{isDark ? 'Dark' : 'Light'} mode ·  System Settings</Text>
                </FadeInView>
            </ScrollView>

            {/* Time Picker Modal */}
            <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, {
                        backgroundColor: isDark ? '#1A1128' : '#FFFFFF',
                        borderColor: colors.border,
                    }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Reminder Times</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)} style={[styles.doneButton, { backgroundColor: colors.primary + '20' }]}>
                                <Text style={[styles.doneButtonText, { color: colors.primary }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                            Tap to toggle reminder times. You need at least one.
                        </Text>
                        <ScrollView style={styles.hourGrid} showsVerticalScrollIndicator={false}>
                            <View style={styles.hourGridInner}>
                                {ALL_HOURS.map((hour) => {
                                    const isSelected = reminderHours.includes(hour);
                                    return (
                                        <TouchableOpacity
                                            key={hour}
                                            onPress={() => toggleHour(hour)}
                                            style={[
                                                styles.hourChip,
                                                {
                                                    backgroundColor: isSelected
                                                        ? colors.primary
                                                        : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                },
                                            ]}
                                        >
                                            <Text style={[
                                                styles.hourChipText,
                                                { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                                            ]}>
                                                {formatHour(hour)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                        <View style={[styles.selectedSummary, { borderTopColor: colors.border }]}>
                            <Ionicons name="alarm" size={16} color={colors.accent} />
                            <Text style={[styles.selectedSummaryText, { color: colors.textSecondary }]}>
                                {reminderHours.length} reminder{reminderHours.length !== 1 ? 's' : ''} set
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    title: { ...Typography.largeTitle, marginBottom: Spacing.xl },
    sectionTitle: { ...Typography.caption, fontWeight: '600', letterSpacing: 1, paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.sm },
    settingRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, padding: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1 },
    iconContainer: { width: 36, height: 36, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    settingInfo: { flex: 1 },
    settingTitle: { ...Typography.headline },
    settingSubtitle: { ...Typography.caption, marginTop: 2 },
    badge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
    badgeText: { ...Typography.caption2, fontWeight: '700' },
    themeInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing['3xl'], gap: Spacing.sm },
    themeText: { ...Typography.footnote },
    editChevron: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    editLabel: { ...Typography.caption, fontWeight: '600' },

    // Modal styles
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], borderWidth: 1, borderBottomWidth: 0, paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing['4xl'], maxHeight: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    modalTitle: { ...Typography.title2 },
    modalSubtitle: { ...Typography.footnote, marginBottom: Spacing.lg },
    doneButton: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
    doneButtonText: { ...Typography.headline, fontSize: 15 },
    hourGrid: { maxHeight: 300 },
    hourGridInner: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    hourChip: { width: '22%', paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center', borderWidth: 1 },
    hourChipText: { ...Typography.footnote, fontWeight: '600' },
    selectedSummary: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.lg, paddingTop: Spacing.lg, borderTopWidth: 1 },
    selectedSummaryText: { ...Typography.footnote },
});
