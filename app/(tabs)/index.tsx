import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import FadeInView from '../../src/components/FadeInView';
import { useTheme } from '../../src/hooks/useTheme';
import { useHabitStore, HabitCategory } from '../../src/store/habitStore';
import { getGreeting, getDateString, formatDateDisplay } from '../../src/utils/date';
import HabitCard from '../../src/components/HabitCard';
import CountdownCard from '../../src/components/CountdownCard';
import CircularProgress from '../../src/components/CircularProgress';
import EmptyState from '../../src/components/EmptyState';
import {
    HabitCategories,
    Spacing,
    Typography,
    BorderRadius,
    Shadows,
} from '../../src/constants/theme';
import { getDailyQuote } from '../../src/constants/quotes';

export default function HomeScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const habits = useHabitStore((s) => s.habits);
    const countdowns = useHabitStore((s) => s.countdowns || []);
    const deleteCountdown = useHabitStore((s) => s.deleteCountdown);
    const reorderHabits = useHabitStore((s) => s.reorderHabits);

    const activeHabits = React.useMemo(() =>
        habits
            .filter(h => !h.archived)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [habits]);

    const progress = React.useMemo(() => {
        const today = getDateString();
        const active = habits.filter(h => !(h.archived ?? false));
        const completed = active.filter((h) => h.completions[today]).length;
        return { completed, total: active.length };
    }, [habits]);

    const [selectedCategory, setSelectedCategory] = React.useState<HabitCategory | 'all'>('all');
    const [editMode, setEditMode] = React.useState(false);

    const today = getDateString();
    const greeting = getGreeting();
    const dateDisplay = formatDateDisplay(today);
    const progressRatio = progress.total > 0 ? progress.completed / progress.total : 0;
    const dailyQuote = getDailyQuote();


    const filteredHabits = React.useMemo(() => {
        if (selectedCategory === 'all') return activeHabits;
        return activeHabits.filter(h => (h.category || 'other') === selectedCategory);
    }, [activeHabits, selectedCategory]);

    // Determine which categories are actually in use
    const usedCategories = React.useMemo(() => {
        const cats = new Set(activeHabits.map(h => h.category || 'other'));
        return HabitCategories.filter(c => cats.has(c.key));
    }, [activeHabits]);

    const handleAddHabit = React.useCallback(() => {
        router.push('/add-habit');
    }, []);

    const handleAddCountdown = React.useCallback(() => {
        router.push('/add-countdown');
    }, []);

    const handleHabitPress = React.useCallback((id: string) => {
        if (!editMode) router.push(`/habit/${id}`);
    }, [editMode]);

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        Haptics.selectionAsync();

        const habitToMove = filteredHabits[index];
        const habitAbove = filteredHabits[index - 1];

        const newAllIds = [...activeHabits.map(h => h.id)];
        const globalIdx = newAllIds.indexOf(habitToMove.id);
        const targetGlobalIdx = newAllIds.indexOf(habitAbove.id);

        [newAllIds[globalIdx], newAllIds[targetGlobalIdx]] = [newAllIds[targetGlobalIdx], newAllIds[globalIdx]];
        reorderHabits(newAllIds);
    };

    const handleMoveDown = (index: number) => {
        if (index >= filteredHabits.length - 1) return;
        Haptics.selectionAsync();

        const habitToMove = filteredHabits[index];
        const habitBelow = filteredHabits[index + 1];

        const newAllIds = [...activeHabits.map(h => h.id)];
        const globalIdx = newAllIds.indexOf(habitToMove.id);
        const targetGlobalIdx = newAllIds.indexOf(habitBelow.id);

        [newAllIds[globalIdx], newAllIds[targetGlobalIdx]] = [newAllIds[targetGlobalIdx], newAllIds[globalIdx]];
        reorderHabits(newAllIds);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + Spacing.lg, paddingBottom: 120 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <FadeInView delay={100} style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                            {greeting} 👋
                        </Text>
                        <Text style={[styles.date, { color: colors.text }]}>
                            {dateDisplay}
                        </Text>
                    </View>
                </FadeInView>

                {/* Countdowns Section */}
                <FadeInView delay={150}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Countdowns
                        </Text>
                        <TouchableOpacity onPress={handleAddCountdown}>
                            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.countdownScroll}
                    >
                        {countdowns.length === 0 ? (
                            <TouchableOpacity 
                                onPress={handleAddCountdown}
                                style={[styles.addCountdownPlaceholder, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
                            >
                                <Ionicons name="timer-outline" size={24} color={colors.textMuted} />
                                <Text style={[styles.addCountdownText, { color: colors.textMuted }]}>Add a countdown</Text>
                            </TouchableOpacity>
                        ) : (
                            countdowns.map((cd) => (
                                <CountdownCard 
                                    key={cd.id} 
                                    countdown={cd} 
                                    onDelete={deleteCountdown}
                                />
                            ))
                        )}
                    </ScrollView>
                </FadeInView>

                {/* Progress Card */}
                {activeHabits.length > 0 && (
                    <FadeInView delay={200} style={styles.progressSection}>
                        <View
                            style={[
                                styles.progressCard,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(0,0,0,0.02)',
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={[
                                    colors.primary + '10',
                                    colors.accent + '08',
                                    'transparent',
                                ]}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />

                            <View style={styles.progressContent}>
                                <View style={styles.progressInfo}>
                                    <Text
                                        style={[styles.progressTitle, { color: colors.text }]}
                                    >
                                        Today's Progress
                                    </Text>
                                    <Text
                                        style={[
                                            styles.progressSubtitle,
                                            { color: colors.textSecondary },
                                        ]}
                                    >
                                        {progress.completed === progress.total && progress.total > 0
                                            ? '🎉 All done! Amazing work!'
                                            : `${progress.total - progress.completed} habit${progress.total - progress.completed !== 1 ? 's' : ''
                                            } remaining`}
                                    </Text>

                                    {progressRatio === 1 && (
                                        <View
                                            style={[
                                                styles.completeBadge,
                                                { backgroundColor: colors.success + '20' },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.completeBadgeText,
                                                    { color: colors.success },
                                                ]}
                                            >
                                                ✨ Perfect Day
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <CircularProgress
                                    progress={progressRatio}
                                    size={100}
                                    strokeWidth={8}
                                    completed={progress.completed}
                                    total={progress.total}
                                    color={progressRatio === 1 ? colors.success : colors.primary}
                                />
                            </View>
                        </View>
                    </FadeInView>
                )}

                {/* Daily Quote */}
                <FadeInView delay={250} style={styles.quoteSection}>
                    <View style={[styles.quoteCard, {
                        backgroundColor: isDark ? 'rgba(124, 58, 237, 0.08)' : 'rgba(124, 58, 237, 0.05)',
                        borderColor: isDark ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.12)',
                    }]}>
                        <Text style={[styles.quoteIcon]}>💬</Text>
                        <Text style={[styles.quoteText, { color: colors.text }]}>
                            "{dailyQuote.text}"
                        </Text>
                        <Text style={[styles.quoteAuthor, { color: colors.textMuted }]}>
                            — {dailyQuote.author}
                        </Text>
                    </View>
                </FadeInView>

                {/* Category Filter */}
                {activeHabits.length > 0 && usedCategories.length > 1 && (
                    <FadeInView delay={280}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryFilterRow}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setSelectedCategory('all');
                                }}
                                style={[
                                    styles.filterChip,
                                    {
                                        backgroundColor: selectedCategory === 'all'
                                            ? colors.primary + '25'
                                            : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                        borderColor: selectedCategory === 'all' ? colors.primary : colors.border,
                                    },
                                ]}
                            >
                                <Text style={[styles.filterChipText, { color: selectedCategory === 'all' ? colors.primary : colors.textSecondary }]}>
                                    All
                                </Text>
                            </TouchableOpacity>
                            {usedCategories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.key}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setSelectedCategory(cat.key as HabitCategory);
                                    }}
                                    style={[
                                        styles.filterChip,
                                        {
                                            backgroundColor: selectedCategory === cat.key
                                                ? cat.color + '25'
                                                : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                            borderColor: selectedCategory === cat.key ? cat.color : colors.border,
                                        },
                                    ]}
                                >
                                    <Text style={styles.filterEmoji}>{cat.emoji}</Text>
                                    <Text style={[styles.filterChipText, { color: selectedCategory === cat.key ? cat.color : colors.textSecondary }]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </FadeInView>
                )}

                {/* Section Title */}
                {activeHabits.length > 0 && (
                    <FadeInView delay={300} style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Your Habits
                        </Text>
                        <View style={styles.sectionActions}>
                            <Text style={[styles.habitCount, { color: colors.textMuted }]}>
                                {filteredHabits.length} habit{filteredHabits.length !== 1 ? 's' : ''}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.selectionAsync();
                                    setEditMode(!editMode);
                                }}
                                style={[styles.editButton, { backgroundColor: editMode ? colors.primary + '20' : 'transparent' }]}
                            >
                                <Ionicons
                                    name={editMode ? 'checkmark' : 'reorder-three'}
                                    size={18}
                                    color={editMode ? colors.primary : colors.textMuted}
                                />
                                <Text style={[styles.editText, { color: editMode ? colors.primary : colors.textMuted }]}>
                                    {editMode ? 'Done' : 'Edit'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </FadeInView>
                )}

                {/* Habit List */}
                {activeHabits.length === 0 ? (
                    <FadeInView delay={200}>
                        <EmptyState
                            emoji="🚀"
                            title="Start your journey"
                            subtitle="Add your first habit and begin building powerful daily routines. Consistency is the key to greatness!"
                        />
                    </FadeInView>
                ) : (
                    filteredHabits.map((habit, index) => (
                        <FadeInView
                            key={habit.id}
                            delay={350 + index * 80}
                        >
                            <HabitCard
                                habit={habit}
                                onPress={() => handleHabitPress(habit.id)}
                                showReorderControls={editMode}
                                onMoveUp={() => handleMoveUp(index)}
                                onMoveDown={() => handleMoveDown(index)}
                                isFirst={index === 0}
                                isLast={index === filteredHabits.length - 1}
                            />
                        </FadeInView>
                    ))
                )}
            </ScrollView>

            {/* Floating Action Button */}
            {!editMode && (
                <FadeInView
                    delay={600}
                    from="top"
                    style={[
                        styles.fabContainer,
                        { bottom: Platform.OS === 'ios' ? 100 : 80 },
                    ]}
                >
                    <TouchableOpacity onPress={handleAddHabit} activeOpacity={0.85}>
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDark]}
                            style={styles.fab}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="add" size={28} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </FadeInView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    greeting: {
        ...Typography.subhead,
        marginBottom: 4,
    },
    date: {
        ...Typography.title,
    },
    progressSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    progressCard: {
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        overflow: 'hidden',
        ...Shadows.md,
    },
    progressContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.xl,
    },
    progressInfo: {
        flex: 1,
        marginRight: Spacing.lg,
    },
    progressTitle: {
        ...Typography.title3,
        marginBottom: 4,
    },
    progressSubtitle: {
        ...Typography.subhead,
    },
    completeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginTop: Spacing.sm,
    },
    completeBadgeText: {
        ...Typography.caption,
        fontWeight: '700',
    },
    // Category filter
    categoryFilterRow: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        gap: 4,
    },
    filterEmoji: {
        fontSize: 13,
    },
    filterChipText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        ...Typography.title3,
    },
    sectionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    habitCount: {
        ...Typography.caption,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        gap: 3,
    },
    editText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    quoteSection: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    quoteCard: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    quoteIcon: {
        fontSize: 20,
        marginBottom: Spacing.sm,
    },
    quoteText: {
        ...Typography.subhead,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.sm,
    },
    quoteAuthor: {
        ...Typography.caption,
        fontWeight: '600',
    },
    fabContainer: {
        position: 'absolute',
        right: Spacing.xl,
        zIndex: 100,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.lg,
    },
    // Countdowns
    countdownScroll: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
    },
    addCountdownPlaceholder: {
        width: 200,
        height: 140,
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    addCountdownText: {
        ...Typography.caption,
        fontWeight: '600',
    },
});
