import React, { useCallback } from 'react';
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
import Animated, {
    FadeInDown,
    FadeInUp,
    LinearTransition,
} from 'react-native-reanimated';

import { useTheme } from '../../src/hooks/useTheme';
import { useHabitStore } from '../../src/store/habitStore';
import { getGreeting, getDateString, formatDateDisplay } from '../../src/utils/date';
import HabitCard from '../../src/components/HabitCard';
import CircularProgress from '../../src/components/CircularProgress';
import EmptyState from '../../src/components/EmptyState';
import {
    Spacing,
    Typography,
    BorderRadius,
    Shadows,
} from '../../src/constants/theme';

export default function HomeScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const habits = useHabitStore((s) => s.habits);
    const getTodayProgress = useHabitStore((s) => s.getTodayProgress);

    const today = getDateString();
    const greeting = getGreeting();
    const dateDisplay = formatDateDisplay(today);
    const progress = getTodayProgress();
    const progressRatio = progress.total > 0 ? progress.completed / progress.total : 0;

    const handleAddHabit = useCallback(() => {
        router.push('/add-habit');
    }, []);

    const handleHabitPress = useCallback((id: string) => {
        router.push(`/habit/${id}`);
    }, []);

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
                <Animated.View
                    entering={FadeInDown.delay(100).springify()}
                    style={styles.header}
                >
                    <View>
                        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                            {greeting} 👋
                        </Text>
                        <Text style={[styles.date, { color: colors.text }]}>
                            {dateDisplay}
                        </Text>
                    </View>
                </Animated.View>

                {/* Progress Card */}
                {habits.length > 0 && (
                    <Animated.View
                        entering={FadeInDown.delay(200).springify()}
                        style={styles.progressSection}
                    >
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
                    </Animated.View>
                )}

                {/* Section Title */}
                {habits.length > 0 && (
                    <Animated.View
                        entering={FadeInDown.delay(300).springify()}
                        style={styles.sectionHeader}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Your Habits
                        </Text>
                        <Text style={[styles.habitCount, { color: colors.textMuted }]}>
                            {habits.length} habit{habits.length !== 1 ? 's' : ''}
                        </Text>
                    </Animated.View>
                )}

                {/* Habit List */}
                {habits.length === 0 ? (
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
                        <EmptyState
                            emoji="🚀"
                            title="Start your journey"
                            subtitle="Add your first habit and begin building powerful daily routines. Consistency is the key to greatness!"
                        />
                    </Animated.View>
                ) : (
                    habits.map((habit, index) => (
                        <Animated.View
                            key={habit.id}
                            entering={FadeInDown.delay(350 + index * 80).springify()}
                            layout={LinearTransition.springify()}
                        >
                            <HabitCard
                                habit={habit}
                                onPress={() => handleHabitPress(habit.id)}
                            />
                        </Animated.View>
                    ))
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <Animated.View
                entering={FadeInUp.delay(600).springify()}
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
            </Animated.View>
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
    habitCount: {
        ...Typography.caption,
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
});
