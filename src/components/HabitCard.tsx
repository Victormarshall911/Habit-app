import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore, Habit } from '../store/habitStore';
import { BorderRadius, Spacing, Typography, Shadows, HabitCategories } from '../constants/theme';
import { getDateString, getPreviousDate, getWeekStart, getMonthStart, countCompletionsInRange } from '../utils/date';

interface HabitCardProps {
    habit: Habit;
    onPress?: () => void;
    onLongPress?: () => void;
    showReorderControls?: boolean;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
}

export default function HabitCard({
    habit,
    onPress,
    onLongPress,
    showReorderControls,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: HabitCardProps) {
    const { colors, isDark } = useTheme();
    const habits = useHabitStore((s) => s.habits);
    const toggleCompletion = useHabitStore((s) => s.toggleCompletion);

    // Use the store's logic but in a separate useMemo to avoid re-render loops from selector identity
    const streak = React.useMemo(() => {
        const h = habits.find(x => x.id === habit.id);
        if (!h) return 0;

        // Inline streak logic to be safer, or call a shared utility
        const skips = h.skips || {};
        let s = 0;
        let currentDate = getDateString();

        if (!h.completions[currentDate] && !skips[currentDate]) {
            currentDate = getPreviousDate(currentDate);
            if (!h.completions[currentDate] && !skips[currentDate]) return 0;
        }

        while (h.completions[currentDate] || skips[currentDate]) {
            if (h.completions[currentDate]) s++;
            currentDate = getPreviousDate(currentDate);
        }
        return s;
    }, [habits, habit.id]);

    const freqProgress = React.useMemo(() => {
        const h = habits.find(x => x.id === habit.id);
        if (!h) return { completed: 0, target: 1, periodLabel: 'today' };

        const freq = h.frequency || { type: 'daily', target: 1 };
        const now = new Date();
        const today = getDateString();

        if (freq.type === 'daily') {
            return { completed: h.completions[today] ? 1 : 0, target: freq.target, periodLabel: 'today' };
        } else {
            const isWeekly = freq.type === 'weekly';
            const start = isWeekly ? getWeekStart(now) : getMonthStart(now);
            const completed = countCompletionsInRange(h.completions, start, now);
            return { completed, target: freq.target, periodLabel: isWeekly ? 'this week' : 'this month' };
        }
    }, [habits, habit.id]);

    const today = getDateString();
    const isCompleted = habit.completions[today] === true;
    const isSkipped = habit.skips?.[today] === true;
    const hasNote = !!(habit.notes?.[today]);
    const frequency = habit.frequency || { type: 'daily', target: 1 };
    const isNonDaily = frequency.type !== 'daily';

    const category = HabitCategories.find(c => c.key === (habit.category || 'other'));

    const scale = React.useRef(new Animated.Value(1)).current;
    const checkScale = React.useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

    const handleToggle = async () => {
        if (isSkipped) return; // Can't complete if skipped
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Animated.sequence([
            Animated.spring(scale, {
                toValue: 0.95,
                useNativeDriver: true,
                damping: 15,
                stiffness: 400,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                damping: 12,
                stiffness: 300,
            }),
        ]).start();

        if (!isCompleted) {
            Animated.sequence([
                Animated.spring(checkScale, {
                    toValue: 1.3,
                    useNativeDriver: true,
                    damping: 8,
                    stiffness: 300,
                }),
                Animated.spring(checkScale, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 10,
                    stiffness: 200,
                }),
            ]).start();
        } else {
            Animated.timing(checkScale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }

        toggleCompletion(habit.id, today);
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.9}
        >
            <Animated.View style={{ transform: [{ scale }] }}>
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: isDark
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(0,0,0,0.03)',
                            borderColor: isCompleted ? habit.color + '40' : isSkipped ? colors.warning + '40' : colors.border,
                        },
                    ]}
                >
                    {/* Completed Gradient Overlay */}
                    {isCompleted && (
                        <LinearGradient
                            colors={[habit.color + '15', 'transparent']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    )}

                    <View style={styles.content}>
                        {/* Reorder Controls */}
                        {showReorderControls && (
                            <View style={styles.reorderControls}>
                                <TouchableOpacity
                                    onPress={onMoveUp}
                                    disabled={isFirst}
                                    style={[styles.reorderBtn, isFirst && { opacity: 0.3 }]}
                                >
                                    <Text style={[styles.reorderIcon, { color: colors.textSecondary }]}>▲</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onMoveDown}
                                    disabled={isLast}
                                    style={[styles.reorderBtn, isLast && { opacity: 0.3 }]}
                                >
                                    <Text style={[styles.reorderIcon, { color: colors.textSecondary }]}>▼</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Left: Emoji + Info */}
                        <View style={styles.leftSection}>
                            <View
                                style={[
                                    styles.emojiContainer,
                                    { backgroundColor: habit.color + '20' },
                                ]}
                            >
                                <Text style={styles.emoji}>{habit.emoji}</Text>
                            </View>

                            <View style={styles.info}>
                                <Text
                                    style={[
                                        styles.habitName,
                                        {
                                            color: colors.text,
                                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                                            opacity: isCompleted ? 0.6 : isSkipped ? 0.5 : 1,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {habit.name}
                                </Text>

                                <View style={styles.metaRow}>
                                    {streak > 0 && (
                                        <View style={styles.streakRow}>
                                            <Text style={styles.fireEmoji}>🔥</Text>
                                            <Text style={[styles.streakText, { color: colors.warm }]}>
                                                {streak}d
                                            </Text>
                                        </View>
                                    )}

                                    {category && category.key !== 'other' && (
                                        <View style={[styles.categoryBadge, { backgroundColor: category.color + '15' }]}>
                                            <Text style={[styles.categoryText, { color: category.color }]}>
                                                {category.emoji} {category.label}
                                            </Text>
                                        </View>
                                    )}

                                    {isSkipped && (
                                        <View style={[styles.skipBadge, { backgroundColor: colors.warning + '15' }]}>
                                            <Text style={[styles.skipText, { color: colors.warning }]}>⏭️ Skipped</Text>
                                        </View>
                                    )}

                                    {hasNote && (
                                        <Text style={styles.noteIndicator}>📝</Text>
                                    )}
                                </View>

                                {/* Frequency progress for non-daily habits */}
                                {isNonDaily && (
                                    <View style={styles.freqRow}>
                                        <View style={[styles.freqBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                                            <View
                                                style={[
                                                    styles.freqBarFill,
                                                    {
                                                        backgroundColor: habit.color,
                                                        width: `${Math.min(100, (freqProgress.completed / freqProgress.target) * 100)}%`,
                                                    },
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.freqText, { color: colors.textMuted }]}>
                                            {freqProgress.completed}/{freqProgress.target}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Right: Checkbox */}
                        {!showReorderControls && (
                            <TouchableOpacity
                                onPress={handleToggle}
                                style={[
                                    styles.checkbox,
                                    {
                                        borderColor: isCompleted ? habit.color : isSkipped ? colors.warning : colors.textMuted,
                                        backgroundColor: isCompleted ? habit.color : isSkipped ? colors.warning + '20' : 'transparent',
                                    },
                                ]}
                                activeOpacity={0.7}
                                disabled={isSkipped}
                            >
                                {isCompleted && (
                                    <Animated.Text
                                        style={[
                                            styles.checkmark,
                                            {
                                                transform: [{ scale: checkScale }],
                                                opacity: checkScale,
                                            },
                                        ]}
                                    >
                                        ✓
                                    </Animated.Text>
                                )}
                                {isSkipped && (
                                    <Text style={styles.skipMark}>⏭️</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        marginHorizontal: Spacing.lg,
        marginVertical: Spacing.xs,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 24,
    },
    info: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    habitName: {
        ...Typography.headline,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 3,
        gap: Spacing.xs,
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fireEmoji: {
        fontSize: 11,
    },
    streakText: {
        ...Typography.caption2,
        fontWeight: '600',
        marginLeft: 2,
    },
    categoryBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: BorderRadius.full,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '600',
    },
    skipBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: BorderRadius.full,
    },
    skipText: {
        fontSize: 10,
        fontWeight: '600',
    },
    noteIndicator: {
        fontSize: 11,
    },
    freqRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: Spacing.xs,
    },
    freqBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    freqBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    freqText: {
        fontSize: 10,
        fontWeight: '600',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: BorderRadius.sm,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.md,
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    skipMark: {
        fontSize: 12,
    },
    reorderControls: {
        marginRight: Spacing.sm,
        alignItems: 'center',
        gap: 2,
    },
    reorderBtn: {
        padding: 4,
    },
    reorderIcon: {
        fontSize: 14,
        fontWeight: '700',
    },
});
