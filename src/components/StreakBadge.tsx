import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
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
    const fireScale = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (streak >= 7) {
            // Pulsing fire animation for streaks >= 7
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fireScale, {
                        toValue: 1.2,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(fireScale, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowOpacity, {
                        toValue: 0.8,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowOpacity, {
                        toValue: 0.3,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else if (streak > 0) {
            Animated.spring(fireScale, {
                toValue: 1.1,
                useNativeDriver: true,
                damping: 8,
                stiffness: 200,
            }).start();
        }
    }, [streak]);

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
                            opacity: glowOpacity,
                        },
                    ]}
                />
            )}
            <Animated.Text
                style={[
                    { fontSize: s.fire },
                    { transform: [{ scale: fireScale }] },
                ]}
            >
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
