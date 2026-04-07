import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { Typography } from '../constants/theme';

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
    const animatedProgress = useRef(new Animated.Value(0)).current;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    useEffect(() => {
        Animated.timing(animatedProgress, {
            toValue: progress,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false, // strokeDashoffset not supported by native driver
        }).start();
    }, [progress]);

    const ringColor = color || colors.accent;

    // We'll use a listener to update the strokeDashoffset
    const [offset, setOffset] = React.useState(circumference);

    useEffect(() => {
        const listenerId = animatedProgress.addListener(({ value }) => {
            setOffset(circumference * (1 - value));
        });
        return () => animatedProgress.removeListener(listenerId);
    }, [circumference]);

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
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
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
