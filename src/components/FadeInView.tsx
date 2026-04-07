import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
    delay?: number;
    duration?: number;
    from?: 'bottom' | 'top';
    distance?: number;
    style?: ViewStyle;
    children: React.ReactNode;
}

export default function FadeInView({
    delay = 0,
    duration = 500,
    from = 'bottom',
    distance = 20,
    style,
    children,
}: FadeInViewProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(from === 'bottom' ? distance : -distance)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                delay,
                useNativeDriver: true,
                damping: 15,
                stiffness: 100,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
}
