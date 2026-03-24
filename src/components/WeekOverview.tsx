import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, Typography, BorderRadius } from '../constants/theme';
import { getLast7Days, getDayName, getDateString } from '../utils/date';

interface WeekOverviewProps {
    completions: Record<string, boolean>;
    color: string;
}

export default function WeekOverview({ completions, color }: WeekOverviewProps) {
    const { colors } = useTheme();
    const days = getLast7Days();
    const today = getDateString();

    return (
        <View style={styles.container}>
            {days.map((dateStr) => {
                const isComplete = completions[dateStr];
                const isToday = dateStr === today;
                const dayName = getDayName(dateStr);

                return (
                    <View key={dateStr} style={styles.dayColumn}>
                        <Text
                            style={[
                                styles.dayLabel,
                                {
                                    color: isToday ? colors.text : colors.textMuted,
                                    fontWeight: isToday ? '700' : '400',
                                },
                            ]}
                        >
                            {dayName}
                        </Text>
                        <View
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: isComplete
                                        ? color
                                        : colors.surfaceGlass,
                                    borderWidth: isToday ? 2 : 0,
                                    borderColor: isToday ? color : 'transparent',
                                },
                            ]}
                        >
                            {isComplete && <Text style={styles.checkEmoji}>✓</Text>}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    dayColumn: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    dayLabel: {
        ...Typography.caption2,
        textTransform: 'uppercase',
    },
    dot: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkEmoji: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});
