import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Spacing, Typography, BorderRadius } from '../constants/theme';
import { getDaysInMonth, getDateString } from '../utils/date';

interface CalendarHeatmapProps {
    completions: Record<string, boolean>;
    color: string;
    year?: number;
    month?: number; 
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarHeatmap({
    completions,
    color,
    year,
    month,
}: CalendarHeatmapProps) {
    const { colors } = useTheme();
    const now = new Date();
    const displayYear = year ?? now.getFullYear();
    const displayMonth = month ?? now.getMonth();

    const daysInMonth = getDaysInMonth(displayYear, displayMonth);
    const firstDayOfWeek = new Date(displayYear, displayMonth, 1).getDay();
    const monthName = new Date(displayYear, displayMonth).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const today = getDateString();

    // Build grid
    const cells: (string | null)[] = [];
    // Padding for the first row
    for (let i = 0; i < firstDayOfWeek; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cells.push(dateStr);
    }

    const rows: (string | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        rows.push(cells.slice(i, i + 7));
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.monthTitle, { color: colors.textSecondary }]}>
                {monthName}
            </Text>

            
            <View style={styles.row}>
                {DAYS_OF_WEEK.map((day, i) => (
                    <View key={i} style={styles.cellWrapper}>
                        <Text style={[styles.dayLabel, { color: colors.textMuted }]}>
                            {day}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Calendar grid */}
            {rows.map((row, rowIdx) => (
                <View key={rowIdx} style={styles.row}>
                    {row.map((dateStr, colIdx) => {
                        if (!dateStr) {
                            return <View key={colIdx} style={styles.cellWrapper} />;
                        }

                        const isComplete = completions[dateStr];
                        const isToday = dateStr === today;
                        const isFuture = dateStr > today;

                        return (
                            <View key={colIdx} style={styles.cellWrapper}>
                                <View
                                    style={[
                                        styles.cell,
                                        {
                                            backgroundColor: isComplete
                                                ? color
                                                : isFuture
                                                    ? 'transparent'
                                                    : colors.surfaceGlass,
                                            borderWidth: isToday ? 1.5 : 0,
                                            borderColor: isToday ? color : 'transparent',
                                            opacity: isFuture ? 0.3 : isComplete ? 1 : 0.5,
                                        },
                                    ]}
                                />
                            </View>
                        );
                    })}
                    {/* Fill empty cells in last row */}
                    {row.length < 7 &&
                        Array.from({ length: 7 - row.length }).map((_, i) => (
                            <View key={`empty-${i}`} style={styles.cellWrapper} />
                        ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
    },
    monthTitle: {
        ...Typography.footnote,
        fontWeight: '600',
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    cellWrapper: {
        width: CELL_SIZE + CELL_GAP * 2,
        height: CELL_SIZE + CELL_GAP * 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 3,
    },
    dayLabel: {
        fontSize: 9,
        fontWeight: '600',
        textAlign: 'center',
    },
});
