import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

interface EmptyStateProps {
    emoji: string;
    title: string;
    subtitle: string;
}

export default function EmptyState({ emoji, title, subtitle }: EmptyStateProps) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {subtitle}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing['5xl'],
        paddingHorizontal: Spacing['3xl'],
    },
    emoji: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.title3,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.subhead,
        textAlign: 'center',
        lineHeight: 22,
    },
});
