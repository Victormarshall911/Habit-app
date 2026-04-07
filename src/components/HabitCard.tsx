import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useHabitStore, Habit } from '../store/habitStore';
import { BorderRadius, Spacing, Typography, Shadows } from '../constants/theme';
import { getDateString } from '../utils/date';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HabitCardProps {
    habit: Habit;
    onPress?: () => void;
    onLongPress?: () => void;
}

export default function HabitCard({ habit, onPress, onLongPress }: HabitCardProps) {
    const { colors, isDark } = useTheme();
    const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
    const getStreak = useHabitStore((s) => s.getStreak);

    const today = getDateString();
    const isCompleted = habit.completions[today] === true;
    const streak = getStreak(habit.id);

    const scale = useRef(new Animated.Value(1)).current;
    const checkScale = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

    const handleToggle = async () => {
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
                            borderColor: isCompleted ? habit.color + '40' : colors.border,
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
                                            opacity: isCompleted ? 0.6 : 1,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {habit.name}
                                </Text>

                                {streak > 0 && (
                                    <View style={styles.streakRow}>
                                        <Text style={styles.fireEmoji}>🔥</Text>
                                        <Text style={[styles.streakText, { color: colors.warm }]}>
                                            {streak} day{streak !== 1 ? 's' : ''}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Right: Checkbox */}
                        <TouchableOpacity
                            onPress={handleToggle}
                            style={[
                                styles.checkbox,
                                {
                                    borderColor: isCompleted ? habit.color : colors.textMuted,
                                    backgroundColor: isCompleted ? habit.color : 'transparent',
                                },
                            ]}
                            activeOpacity={0.7}
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
                        </TouchableOpacity>
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
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    fireEmoji: {
        fontSize: 12,
    },
    streakText: {
        ...Typography.caption,
        fontWeight: '600',
        marginLeft: 3,
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
});
