import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Spacing, Typography, BorderRadius } from '../constants/theme';

interface StreakBadgeProps {
    streak: number;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

export default function StreakBadge({
    streak,
    size = 'md',
    color,
}: StreakBadgeProps) {
    const { colors } = useTheme();
    const fireScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);

    useEffect(() => {
        if (streak >= 7) {
            // Pulsing fire animation for streaks >= 7
            fireScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 600 }),
                    withTiming(0.3, { duration: 600 })
                ),
                -1,
                true
            );
        } else if (streak > 0) {
            fireScale.value = withSpring(1.1, { damping: 8, stiffness: 200 });
        }
    }, [streak]);

    const animatedFire = useAnimatedStyle(() => ({
        transform: [{ scale: fireScale.value }],
    }));

    const animatedGlow = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const sizes = {
        sm: { fire: 16, text: 14, pad: 6, gap: 2 },
        md: { fire: 22, text: 18, pad: 10, gap: 4 },
        lg: { fire: 32, text: 28, pad: 14, gap: 6 },
    };

    const s = sizes[size];
    const badgeColor = color || colors.warm;

    if (streak === 0) return null;

    return (
        <View style={[styles.container, { paddingHorizontal: s.pad, paddingVertical: s.pad / 2 }]}>
            {streak >= 7 && (
                <Animated.View
                    style={[
                        styles.glow,
                        {
                            backgroundColor: badgeColor,
                            borderRadius: BorderRadius.full,
                        },
                        animatedGlow,
                    ]}
                />
            )}
            <Animated.Text style={[{ fontSize: s.fire }, animatedFire]}>
                🔥
            </Animated.Text>
            <Text
                style={[
                    styles.streakNumber,
                    {
                        fontSize: s.text,
                        color: badgeColor,
                        marginLeft: s.gap,
                    },
                ]}
            >
                {streak}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    glow: {
        ...StyleSheet.absoluteFillObject,
        transform: [{ scale: 1.5 }],
    },
    streakNumber: {
        fontWeight: '800',
        fontVariant: ['tabular-nums'],
    },
});
