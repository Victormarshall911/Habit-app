import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import FadeInView from '../src/components/FadeInView';
import { useTheme } from '../src/hooks/useTheme';
import { useHabitStore } from '../src/store/habitStore';
import { HabitCategories, Spacing, Typography, BorderRadius, Shadows } from '../src/constants/theme';

export default function ArchivedScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const getArchivedHabits = useHabitStore((s) => s.getArchivedHabits);
    const unarchiveHabit = useHabitStore((s) => s.unarchiveHabit);
    const deleteHabit = useHabitStore((s) => s.deleteHabit);

    const archivedHabits = getArchivedHabits();

    const handleUnarchive = async (id: string, name: string) => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        unarchiveHabit(id);
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Permanently',
            `Delete "${name}" forever? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        deleteHabit(id);
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + Spacing.md,
                    paddingBottom: 120,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <FadeInView delay={50} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                        <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
                    </TouchableOpacity>
                </FadeInView>

                <FadeInView delay={100}>
                    <Text style={[styles.title, { color: colors.text }]}>Archived Habits</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {archivedHabits.length > 0
                            ? 'These habits are paused. Unarchive to bring them back.'
                            : 'No archived habits yet.'}
                    </Text>
                </FadeInView>

                {archivedHabits.length === 0 ? (
                    <FadeInView delay={200} style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📦</Text>
                        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                            Nothing here
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                            When you archive a habit, it will appear here
                        </Text>
                    </FadeInView>
                ) : (
                    archivedHabits.map((habit, index) => {
                        const category = HabitCategories.find(c => c.key === (habit.category || 'other'));
                        const totalCompletions = Object.keys(habit.completions).filter(k => habit.completions[k]).length;

                        return (
                            <FadeInView key={habit.id} delay={200 + index * 100}>
                                <View style={[styles.card, {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderColor: colors.border,
                                }]}>
                                    <View style={styles.cardTop}>
                                        <View style={[styles.emojiContainer, { backgroundColor: habit.color + '20' }]}>
                                            <Text style={{ fontSize: 28 }}>{habit.emoji}</Text>
                                        </View>
                                        <View style={styles.cardInfo}>
                                            <Text style={[styles.habitName, { color: colors.text }]}>
                                                {habit.name}
                                            </Text>
                                            <View style={styles.metaRow}>
                                                {category && category.key !== 'other' && (
                                                    <View style={[styles.categoryBadge, { backgroundColor: category.color + '15' }]}>
                                                        <Text style={[styles.categoryText, { color: category.color }]}>
                                                            {category.emoji} {category.label}
                                                        </Text>
                                                    </View>
                                                )}
                                                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                                                    {totalCompletions} completions
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.cardActions}>
                                        <TouchableOpacity
                                            onPress={() => handleUnarchive(habit.id, habit.name)}
                                            style={[styles.actionBtn, { backgroundColor: colors.accent + '15' }]}
                                        >
                                            <Ionicons name="refresh" size={16} color={colors.accent} />
                                            <Text style={[styles.actionText, { color: colors.accent }]}>Restore</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => handleDelete(habit.id, habit.name)}
                                            style={[styles.actionBtn, { backgroundColor: colors.fire + '15' }]}
                                        >
                                            <Ionicons name="trash-outline" size={16} color={colors.fire} />
                                            <Text style={[styles.actionText, { color: colors.fire }]}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </FadeInView>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
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
    title: {
        ...Typography.largeTitle,
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        ...Typography.subhead,
        paddingHorizontal: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        ...Typography.title3,
        marginBottom: Spacing.xs,
    },
    emptySubtitle: {
        ...Typography.subhead,
        textAlign: 'center',
        paddingHorizontal: Spacing['3xl'],
    },
    card: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        padding: Spacing.lg,
        ...Shadows.sm,
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    emojiContainer: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    habitName: {
        ...Typography.headline,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 4,
        gap: Spacing.xs,
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
    metaText: {
        ...Typography.caption,
    },
    cardActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.xs,
    },
    actionText: {
        ...Typography.footnote,
        fontWeight: '700',
    },
});
