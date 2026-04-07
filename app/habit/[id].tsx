import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import FadeInView from '../../src/components/FadeInView';
import { useTheme } from '../../src/hooks/useTheme';
import { useHabitStore } from '../../src/store/habitStore';
import StreakBadge from '../../src/components/StreakBadge';
import CalendarHeatmap from '../../src/components/CalendarHeatmap';
import WeekOverview from '../../src/components/WeekOverview';
import {
    Spacing,
    Typography,
    BorderRadius,
    Shadows,
} from '../../src/constants/theme';
import { getDateString, formatDateDisplay } from '../../src/utils/date';

export default function HabitDetailScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();

    const habit = useHabitStore((s) => s.habits.find((h) => h.id === id));
    const getStreak = useHabitStore((s) => s.getStreak);
    const getLongestStreak = useHabitStore((s) => s.getLongestStreak);
    const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
    const deleteHabit = useHabitStore((s) => s.deleteHabit);

    if (!habit) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>
                    Habit not found
                </Text>
            </View>
        );
    }

    const today = getDateString();
    const isCompletedToday = habit.completions[today] === true;
    const streak = getStreak(habit.id);
    const longestStreak = getLongestStreak(habit.id);
    const totalCompletions = Object.keys(habit.completions).filter(
        (k) => habit.completions[k]
    ).length;
    const createdDate = formatDateDisplay(habit.createdAt.split('T')[0]);

    const handleToggleToday = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        toggleCompletion(habit.id, today);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Habit',
            `Are you sure you want to delete "${habit.name}"? This will remove all streak data.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Warning
                        );
                        deleteHabit(habit.id);
                        router.back();
                    },
                },
            ]
        );
    };

    // Get last 3 months for heatmaps
    const now = new Date();
    const months: { year: number; month: number }[] = [];
    for (let i = 0; i < 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + Spacing.md,
                    paddingBottom: 120,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                <FadeInView delay={50} style={styles.backRow}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color={colors.text}
                        />
                        <Text style={[styles.backText, { color: colors.text }]}>
                            Back
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={20} color={colors.fire} />
                    </TouchableOpacity>
                </FadeInView>

                {/* Hero Section */}
                <FadeInView delay={100} style={styles.heroSection}>
                    <View
                        style={[
                            styles.heroCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={[habit.color + '20', 'transparent']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />

                        <View
                            style={[
                                styles.heroEmoji,
                                { backgroundColor: habit.color + '20' },
                            ]}
                        >
                            <Text style={{ fontSize: 48 }}>{habit.emoji}</Text>
                        </View>

                        <Text style={[styles.heroName, { color: colors.text }]}>
                            {habit.name}
                        </Text>

                        <StreakBadge streak={streak} size="lg" color={habit.color} />

                        <Text style={[styles.createdText, { color: colors.textMuted }]}>
                            Started {createdDate}
                        </Text>
                    </View>
                </FadeInView>

                {/* Today's Action */}
                <FadeInView delay={200} style={styles.actionSection}>
                    <TouchableOpacity onPress={handleToggleToday} activeOpacity={0.85}>
                        <LinearGradient
                            colors={
                                isCompletedToday
                                    ? [colors.success, colors.success + 'CC']
                                    : [habit.color, habit.color + 'CC']
                            }
                            style={styles.actionButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons
                                name={
                                    isCompletedToday
                                        ? 'checkmark-circle'
                                        : 'radio-button-off'
                                }
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.actionText}>
                                {isCompletedToday
                                    ? '✨ Completed Today!'
                                    : 'Mark as Done Today'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </FadeInView>

                {/* Stats Cards */}
                <FadeInView delay={300} style={styles.statsRow}>
                    <View
                        style={[
                            styles.statCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={styles.statEmoji}>🔥</Text>
                        <Text style={[styles.statValue, { color: habit.color }]}>
                            {streak}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Current
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={styles.statEmoji}>🏆</Text>
                        <Text style={[styles.statValue, { color: habit.color }]}>
                            {longestStreak}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Longest
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={styles.statEmoji}>✅</Text>
                        <Text style={[styles.statValue, { color: habit.color }]}>
                            {totalCompletions}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Total
                        </Text>
                    </View>
                </FadeInView>

                {/* Week Overview */}
                <FadeInView delay={400}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: colors.text, paddingHorizontal: Spacing.xl },
                        ]}
                    >
                        This Week
                    </Text>
                    <View
                        style={[
                            styles.weekCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <WeekOverview completions={habit.completions} color={habit.color} />
                    </View>
                </FadeInView>

                {/* Calendar Heatmaps */}
                <FadeInView delay={500}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: colors.text, paddingHorizontal: Spacing.xl },
                        ]}
                    >
                        History
                    </Text>
                    <View
                        style={[
                            styles.calendarCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        {months.map(({ year, month }) => (
                            <CalendarHeatmap
                                key={`${year}-${month}`}
                                completions={habit.completions}
                                color={habit.color}
                                year={year}
                                month={month}
                            />
                        ))}
                    </View>
                </FadeInView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
    },
    backText: {
        ...Typography.headline,
        marginLeft: 4,
    },
    deleteButton: {
        padding: Spacing.sm,
    },
    heroSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    heroCard: {
        alignItems: 'center',
        padding: Spacing['3xl'],
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        overflow: 'hidden',
        ...Shadows.md,
    },
    heroEmoji: {
        width: 96,
        height: 96,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    heroName: {
        ...Typography.title,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    createdText: {
        ...Typography.caption,
        marginTop: Spacing.sm,
    },
    actionSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        gap: Spacing.sm,
        ...Shadows.md,
    },
    actionText: {
        ...Typography.headline,
        color: '#fff',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    statEmoji: {
        fontSize: 20,
        marginBottom: Spacing.xs,
    },
    statValue: {
        ...Typography.title2,
        fontWeight: '800',
    },
    statLabel: {
        ...Typography.caption2,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        ...Typography.title3,
        marginBottom: Spacing.md,
    },
    weekCard: {
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
    },
    calendarCard: {
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        overflow: 'hidden',
    },
});
