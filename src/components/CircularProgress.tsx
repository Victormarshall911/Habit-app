import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
    progress: number; // 0 to 1
    size?: number;
    strokeWidth?: number;
    color?: string;
    showLabel?: boolean;
    completed?: number;
    total?: number;
}

export default function CircularProgress({
    progress,
    size = 120,
    strokeWidth = 10,
    color,
    showLabel = true,
    completed = 0,
    total = 0,
}: CircularProgressProps) {
    const { colors } = useTheme();
    const progressValue = useSharedValue(0);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    useEffect(() => {
        progressValue.value = withTiming(progress, {
            duration: 1000,
            easing: Easing.out(Easing.cubic),
        });
    }, [progress]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progressValue.value),
    }));

    const ringColor = color || colors.accent;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background Track */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={colors.border}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress Arc */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                />
            </Svg>

            {showLabel && (
                <View style={styles.labelContainer}>
                    <Text style={[styles.labelCount, { color: colors.text }]}>
                        {completed}/{total}
                    </Text>
                    <Text style={[styles.labelText, { color: colors.textSecondary }]}>
                        done
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelCount: {
        ...Typography.title2,
        fontWeight: '800',
    },
    labelText: {
        ...Typography.caption,
        marginTop: -2,
    },
});
