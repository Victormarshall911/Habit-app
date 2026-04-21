import { Habit } from '../types/habit';
import { getDateString, getPreviousDate } from './date';

export const calculateStreak = (habit: Habit): number => {
    const skips = habit.skips || {};
    let streak = 0;
    let currentDate = getDateString();

    // If today is not completed and not skipped, check from yesterday
    if (!habit.completions[currentDate] && !skips[currentDate]) {
        currentDate = getPreviousDate(currentDate);
        if (!habit.completions[currentDate] && !skips[currentDate]) return 0;
    }

    // Count streak, skipping over skip days
    while (habit.completions[currentDate] || skips[currentDate]) {
        if (habit.completions[currentDate]) {
            streak++;
        }
        // Skip days don't add to streak but don't break it
        currentDate = getPreviousDate(currentDate);
    }

    return streak;
};

export const calculateLongestStreak = (habit: Habit): number => {
    const skips = habit.skips || {};
    const allDates = [
        ...Object.keys(habit.completions).filter((d) => habit.completions[d]),
        ...Object.keys(skips).filter((d) => skips[d]),
    ].sort();

    const uniqueDates = [...new Set(allDates)];
    if (uniqueDates.length === 0) return 0;

    let longest = 0;
    let current = 0;

    // Start from the first date
    for (let i = 0; i < uniqueDates.length; i++) {
        if (habit.completions[uniqueDates[i]]) {
            current++;
        }
        // skip days continue the streak but don't add

        if (i < uniqueDates.length - 1) {
            const curr = new Date(uniqueDates[i] + 'T12:00:00');
            const next = new Date(uniqueDates[i + 1] + 'T12:00:00');
            const diffDays = Math.round(
                (next.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays > 1) {
                // Gap found — streak broken
                longest = Math.max(longest, current);
                current = 0;
            }
        }
    }
    longest = Math.max(longest, current);

    return longest;
};

export const getTotalCompletions = (habit: Habit): number => {
    return Object.values(habit.completions).filter(Boolean).length;
};

export const getTotalSkips = (habit: Habit): number => {
    return Object.values(habit.skips || {}).filter(Boolean).length;
};
