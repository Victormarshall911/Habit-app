import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
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
    HabitCategories,
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
    const toggleSkip = useHabitStore((s) => s.toggleSkip);
    const setNote = useHabitStore((s) => s.setNote);
    const deleteHabit = useHabitStore((s) => s.deleteHabit);
    const archiveHabit = useHabitStore((s) => s.archiveHabit);
    const getFrequencyProgress = useHabitStore((s) => s.getFrequencyProgress);

    const [showNoteInput, setShowNoteInput] = useState(false);
    const [noteText, setNoteText] = useState('');

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
    const isSkippedToday = habit.skips?.[today] === true;
    const todayNote = habit.notes?.[today] || '';
    const streak = getStreak(habit.id);
    const longestStreak = getLongestStreak(habit.id);
    const totalCompletions = Object.keys(habit.completions).filter(
        (k) => habit.completions[k]
    ).length;
    const createdDate = formatDateDisplay(habit.createdAt.split('T')[0]);
    const category = HabitCategories.find(c => c.key === (habit.category || 'other'));
    const frequency = habit.frequency || { type: 'daily', target: 1 };
    const freqProgress = getFrequencyProgress(habit.id);
    const isNonDaily = frequency.type !== 'daily';

    const handleToggleToday = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        toggleCompletion(habit.id, today);
        // Show note input when completing
        if (!isCompletedToday) {
            setShowNoteInput(true);
            setNoteText(todayNote);
        }
    };

    const handleToggleSkip = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleSkip(habit.id, today);
    };

    const handleSaveNote = () => {
        setNote(habit.id, today, noteText);
        setShowNoteInput(false);
    };

    const handleArchive = () => {
        Alert.alert(
            'Archive Habit',
            `Archive "${habit.name}"? It will be hidden from your daily view but you can restore it later.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Archive',
                    onPress: async () => {
                        await Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success
                        );
                        archiveHabit(habit.id);
                        router.back();
                    },
                },
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Habit',
            `Are you sure you want to delete "${habit.name}"? This will remove all streak data permanently.`,
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

    // Recent notes
    const recentNotes = Object.entries(habit.notes || {})
        .filter(([, v]) => v)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 5);

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

                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleArchive} style={styles.headerBtn}>
                            <Ionicons name="archive-outline" size={20} color={colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
                            <Ionicons name="trash-outline" size={20} color={colors.fire} />
                        </TouchableOpacity>
                    </View>
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

                        {/* Category badge */}
                        {category && category.key !== 'other' && (
                            <View style={[styles.heroCategoryBadge, { backgroundColor: category.color + '20' }]}>
                                <Text style={[styles.heroCategoryText, { color: category.color }]}>
                                    {category.emoji} {category.label}
                                </Text>
                            </View>
                        )}

                        <StreakBadge streak={streak} size="lg" color={habit.color} />

                        <Text style={[styles.createdText, { color: colors.textMuted }]}>
                            Started {createdDate}
                        </Text>
                    </View>
                </FadeInView>

                {/* Frequency Progress (non-daily) */}
                {isNonDaily && (
                    <FadeInView delay={150} style={styles.freqSection}>
                        <View style={[styles.freqCard, {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                            borderColor: colors.border,
                        }]}>
                            <Text style={[styles.freqTitle, { color: colors.text }]}>
                                {frequency.type === 'weekly' ? 'Weekly' : 'Monthly'} Goal
                            </Text>
                            <Text style={[styles.freqSubtitle, { color: colors.textSecondary }]}>
                                {freqProgress.completed} of {freqProgress.target} {freqProgress.periodLabel}
                            </Text>
                            <View style={[styles.freqBarOuter, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                                <View style={[styles.freqBarInner, {
                                    backgroundColor: habit.color,
                                    width: `${Math.min(100, (freqProgress.completed / freqProgress.target) * 100)}%`,
                                }]} />
                            </View>
                        </View>
                    </FadeInView>
                )}

                {/* Today's Actions */}
                <FadeInView delay={200} style={styles.actionSection}>
                    <TouchableOpacity onPress={handleToggleToday} activeOpacity={0.85} disabled={isSkippedToday}>
                        <LinearGradient
                            colors={
                                isCompletedToday
                                    ? [colors.success, colors.success + 'CC']
                                    : isSkippedToday
                                        ? [colors.warning + '80', colors.warning + '50']
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
                                        : isSkippedToday
                                            ? 'play-skip-forward'
                                            : 'radio-button-off'
                                }
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.actionText}>
                                {isCompletedToday
                                    ? '✨ Completed Today!'
                                    : isSkippedToday
                                        ? '⏭️ Skipped Today'
                                        : 'Mark as Done Today'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Skip button */}
                    <TouchableOpacity
                        onPress={handleToggleSkip}
                        activeOpacity={0.7}
                        disabled={isCompletedToday}
                        style={[styles.skipButton, {
                            backgroundColor: isSkippedToday
                                ? colors.warning + '20'
                                : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                            borderColor: isSkippedToday ? colors.warning : colors.border,
                            opacity: isCompletedToday ? 0.4 : 1,
                        }]}
                    >
                        <Ionicons
                            name="play-skip-forward"
                            size={16}
                            color={isSkippedToday ? colors.warning : colors.textSecondary}
                        />
                        <Text style={[styles.skipButtonText, {
                            color: isSkippedToday ? colors.warning : colors.textSecondary,
                        }]}>
                            {isSkippedToday ? 'Undo Skip' : 'Skip Today (Rest Day)'}
                        </Text>
                    </TouchableOpacity>

                    {/* Note input */}
                    {(showNoteInput || todayNote) && (
                        <View style={[styles.noteContainer, {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                            borderColor: colors.border,
                        }]}>
                            <View style={styles.noteHeader}>
                                <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>
                                    📝 Today's Note
                                </Text>
                                {noteText !== todayNote && (
                                    <TouchableOpacity onPress={handleSaveNote}>
                                        <Text style={[styles.noteSave, { color: colors.primary }]}>Save</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput
                                style={[styles.noteInput, { color: colors.text, borderColor: colors.border }]}
                                placeholder="How did it go? (optional)"
                                placeholderTextColor={colors.textMuted}
                                value={noteText || todayNote}
                                onChangeText={setNoteText}
                                multiline
                                maxLength={200}
                                onBlur={handleSaveNote}
                            />
                        </View>
                    )}

                    {/* Add note button if no note yet and completed */}
                    {isCompletedToday && !showNoteInput && !todayNote && (
                        <TouchableOpacity
                            onPress={() => { setShowNoteInput(true); setNoteText(''); }}
                            style={[styles.addNoteBtn, { borderColor: colors.border }]}
                        >
                            <Ionicons name="create-outline" size={16} color={colors.textMuted} />
                            <Text style={[styles.addNoteText, { color: colors.textMuted }]}>Add a note</Text>
                        </TouchableOpacity>
                    )}
                </FadeInView>

                {/* Stats Cards */}
                <FadeInView delay={300} style={styles.statsRow}>
                    {[
                        { emoji: '🔥', value: streak, label: 'Current', color: habit.color },
                        { emoji: '🏆', value: longestStreak, label: 'Longest', color: habit.color },
                        { emoji: '✅', value: totalCompletions, label: 'Total', color: habit.color },
                    ].map((stat) => (
                        <View
                            key={stat.label}
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
                            <Text style={styles.statEmoji}>{stat.emoji}</Text>
                            <Text style={[styles.statValue, { color: stat.color }]}>
                                {stat.value}
                            </Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </FadeInView>

                {/* Recent Notes */}
                {recentNotes.length > 0 && (
                    <FadeInView delay={350}>
                        <Text
                            style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: Spacing.xl }]}
                        >
                            Recent Notes
                        </Text>
                        <View style={[styles.notesCard, {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                            borderColor: colors.border,
                        }]}>
                            {recentNotes.map(([date, note], idx) => (
                                <View key={date} style={[styles.noteItem, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                                    <Text style={[styles.noteDate, { color: colors.textMuted }]}>
                                        {formatDateDisplay(date)}
                                    </Text>
                                    <Text style={[styles.noteContent, { color: colors.text }]}>{note}</Text>
                                </View>
                            ))}
                        </View>
                    </FadeInView>
                )}

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
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    headerBtn: {
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
        marginBottom: Spacing.sm,
    },
    heroCategoryBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.sm,
    },
    heroCategoryText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    createdText: {
        ...Typography.caption,
        marginTop: Spacing.sm,
    },
    // Frequency
    freqSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    freqCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
    },
    freqTitle: {
        ...Typography.headline,
        marginBottom: 2,
    },
    freqSubtitle: {
        ...Typography.caption,
        marginBottom: Spacing.sm,
    },
    freqBarOuter: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    freqBarInner: {
        height: '100%',
        borderRadius: 4,
    },
    // Actions
    actionSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
        gap: Spacing.sm,
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
    skipButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    skipButtonText: {
        ...Typography.footnote,
        fontWeight: '600',
    },
    // Notes
    noteContainer: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        padding: Spacing.md,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    noteLabel: {
        ...Typography.caption,
        fontWeight: '600',
    },
    noteSave: {
        ...Typography.caption,
        fontWeight: '700',
    },
    noteInput: {
        ...Typography.body,
        minHeight: 40,
        maxHeight: 80,
        textAlignVertical: 'top',
    },
    addNoteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.sm,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: Spacing.xs,
    },
    addNoteText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    // Stats
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
    // Notes list
    notesCard: {
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: Spacing.xl,
    },
    noteItem: {
        padding: Spacing.md,
    },
    noteDate: {
        ...Typography.caption2,
        marginBottom: 2,
    },
    noteContent: {
        ...Typography.footnote,
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
