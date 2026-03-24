import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../src/hooks/useTheme';
import { useHabitStore } from '../../src/store/habitStore';
import StreakBadge from '../../src/components/StreakBadge';
import CalendarHeatmap from '../../src/components/CalendarHeatmap';
import WeekOverview from '../../src/components/WeekOverview';
import EmptyState from '../../src/components/EmptyState';
import {
    Spacing,
    Typography,
    BorderRadius,
    Shadows,
} from '../../src/constants/theme';

export default function StatsScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const habits = useHabitStore((s) => s.habits);
    const getStreak = useHabitStore((s) => s.getStreak);
    const getLongestStreak = useHabitStore((s) => s.getLongestStreak);

    // Calculate total stats
    const totalCurrentStreak = habits.reduce(
        (sum, h) => sum + getStreak(h.id),
        0
    );
    const totalLongestStreak = habits.reduce(
        (sum, h) => Math.max(sum, getLongestStreak(h.id)),
        0
    );
    const totalCompletions = habits.reduce(
        (sum, h) => sum + Object.keys(h.completions).filter((k) => h.completions[k]).length,
        0
    );

    if (habits.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={{ paddingTop: insets.top + Spacing.lg }}>
                    <Text style={[styles.title, { color: colors.text, paddingHorizontal: Spacing.xl }]}>
                        Stats
                    </Text>
                </View>
                <EmptyState
                    emoji="📊"
                    title="No data yet"
                    subtitle="Add some habits and start completing them to see your stats here."
                />
            </View>
        );
    }

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
                    Stats
                </Text>

                {/* Summary Cards */}
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    style={styles.summaryRow}
                >
                    <View
                        style={[
                            styles.summaryCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={styles.summaryEmoji}>🔥</Text>
                        <Text style={[styles.summaryValue, { color: colors.warm }]}>
                            {totalCurrentStreak}
                        </Text>
                        <Text
                            style={[styles.summaryLabel, { color: colors.textSecondary }]}
                        >
                            Active Streaks
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.summaryCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={styles.summaryEmoji}>🏆</Text>
                        <Text style={[styles.summaryValue, { color: colors.accent }]}>
                            {totalLongestStreak}
                        </Text>
                        <Text
                            style={[styles.summaryLabel, { color: colors.textSecondary }]}
                        >
                            Best Streak
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.summaryCard,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'rgba(0,0,0,0.02)',
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={styles.summaryEmoji}>✅</Text>
                        <Text style={[styles.summaryValue, { color: colors.primary }]}>
                            {totalCompletions}
                        </Text>
                        <Text
                            style={[styles.summaryLabel, { color: colors.textSecondary }]}
                        >
                            Total Done
                        </Text>
                    </View>
                </Animated.View>

                {/* Per-Habit Stats */}
                {habits.map((habit, index) => {
                    const streak = getStreak(habit.id);
                    const longest = getLongestStreak(habit.id);

                    return (
                        <Animated.View
                            key={habit.id}
                            entering={FadeInDown.delay(200 + index * 100).springify()}
                        >
                            <View
                                style={[
                                    styles.habitStatsCard,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(255,255,255,0.04)'
                                            : 'rgba(0,0,0,0.02)',
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={[habit.color + '10', 'transparent']}
                                    style={StyleSheet.absoluteFill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                />

                                {/* Habit Header */}
                                <View style={styles.habitHeader}>
                                    <View style={styles.habitHeaderLeft}>
                                        <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                                        <Text
                                            style={[styles.habitName, { color: colors.text }]}
                                            numberOfLines={1}
                                        >
                                            {habit.name}
                                        </Text>
                                    </View>
                                    <StreakBadge streak={streak} size="sm" color={habit.color} />
                                </View>

                                {/* Streak Stats Row */}
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text
                                            style={[
                                                styles.statValue,
                                                { color: habit.color },
                                            ]}
                                        >
                                            {streak}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.statLabel,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            Current
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.statDivider,
                                            { backgroundColor: colors.border },
                                        ]}
                                    />
                                    <View style={styles.statItem}>
                                        <Text
                                            style={[
                                                styles.statValue,
                                                { color: habit.color },
                                            ]}
                                        >
                                            {longest}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.statLabel,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            Longest
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.statDivider,
                                            { backgroundColor: colors.border },
                                        ]}
                                    />
                                    <View style={styles.statItem}>
                                        <Text
                                            style={[
                                                styles.statValue,
                                                { color: habit.color },
                                            ]}
                                        >
                                            {Object.keys(habit.completions).filter(
                                                (k) => habit.completions[k]
                                            ).length}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.statLabel,
                                                { color: colors.textSecondary },
                                            ]}
                                        >
                                            Total
                                        </Text>
                                    </View>
                                </View>

                                {/* Week View */}
                                <WeekOverview
                                    completions={habit.completions}
                                    color={habit.color}
                                />

                                {/* Calendar Heatmap */}
                                <CalendarHeatmap
                                    completions={habit.completions}
                                    color={habit.color}
                                />
                            </View>
                        </Animated.View>
                    );
                })}
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
    summaryRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    summaryCard: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        ...Shadows.sm,
    },
    summaryEmoji: {
        fontSize: 24,
        marginBottom: Spacing.xs,
    },
    summaryValue: {
        ...Typography.title2,
        fontWeight: '800',
    },
    summaryLabel: {
        ...Typography.caption2,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    habitStatsCard: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    habitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },
    habitHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    habitEmoji: {
        fontSize: 24,
        marginRight: Spacing.sm,
    },
    habitName: {
        ...Typography.headline,
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        ...Typography.title3,
        fontWeight: '800',
    },
    statLabel: {
        ...Typography.caption2,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 30,
    },
});
