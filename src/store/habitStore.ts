import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HabitCategory = 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'learning' | 'lifestyle' | 'other';
export type FrequencyType = 'daily' | 'weekly' | 'monthly';

export interface HabitFrequency {
    type: FrequencyType;
    target: number; // e.g. 3 for "3x per week"
}

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    color: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    archived: boolean;
    order: number;
    createdAt: string;
    completions: Record<string, boolean>; // "YYYY-MM-DD" -> true
    skips: Record<string, boolean>;       // "YYYY-MM-DD" -> true
    notes: Record<string, string>;        // "YYYY-MM-DD" -> note text
}

interface FrequencyProgress {
    completed: number;
    target: number;
    periodLabel: string; // "this week" / "this month"
}

interface HabitState {
    habits: Habit[];
    reminderHours: number[];

    // CRUD
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'skips' | 'notes' | 'archived' | 'order'>) => void;
    editHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'color' | 'category' | 'frequency'>>) => void;
    deleteHabit: (id: string) => void;
    toggleCompletion: (id: string, date: string) => void;
    setReminderHours: (hours: number[]) => void;

    // Archiving
    archiveHabit: (id: string) => void;
    unarchiveHabit: (id: string) => void;

    // Skip days
    toggleSkip: (id: string, date: string) => void;

    // Notes
    setNote: (id: string, date: string, note: string) => void;

    // Reordering
    reorderHabits: (orderedIds: string[]) => void;

    // Computed
    getStreak: (id: string) => number;
    getLongestStreak: (id: string) => number;
    getTodayProgress: () => { completed: number; total: number };
    isAllCompletedToday: () => boolean;
    hasAnyBrokenStreak: () => boolean;
    getFrequencyProgress: (id: string) => FrequencyProgress;
    getActiveHabits: () => Habit[];
    getArchivedHabits: () => Habit[];
}

import {
    getDateString,
    getPreviousDate,
    getWeekStart,
    getMonthStart,
    countCompletionsInRange
} from '../utils/date';

// Ensure backward compatibility: fill defaults for habits loaded from old schema
const migrateHabit = (h: any): Habit => ({
    ...h,
    category: h.category || 'other',
    frequency: h.frequency || { type: 'daily', target: 1 },
    archived: h.archived ?? false,
    order: h.order ?? 0,
    skips: h.skips || {},
    notes: h.notes || {},
});

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            habits: [],
            reminderHours: [8, 12, 16, 20],

            addHabit: (habitData) => {
                const habits = get().habits;
                const maxOrder = habits.length > 0 ? Math.max(...habits.map(h => h.order ?? 0)) : -1;
                const newHabit: Habit = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
                    createdAt: new Date().toISOString(),
                    completions: {},
                    skips: {},
                    notes: {},
                    archived: false,
                    order: maxOrder + 1,
                    ...habitData,
                };
                set((state) => ({ habits: [...state.habits, newHabit] }));
            },

            editHabit: (id, updates) => {
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === id ? { ...h, ...updates } : h
                    ),
                }));
            },

            deleteHabit: (id) => {
                set((state) => ({
                    habits: state.habits.filter((h) => h.id !== id),
                }));
            },

            toggleCompletion: (id, date) => {
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        const newCompletions = { ...h.completions };
                        const newSkips = { ...(h.skips || {}) };
                        if (newCompletions[date]) {
                            delete newCompletions[date];
                        } else {
                            newCompletions[date] = true;
                            // Remove skip if completing
                            delete newSkips[date];
                        }
                        return { ...h, completions: newCompletions, skips: newSkips };
                    }),
                }));
            },

            setReminderHours: (hours) => {
                set({ reminderHours: [...hours].sort((a, b) => a - b) });
            },

            // Archiving
            archiveHabit: (id) => {
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === id ? { ...h, archived: true } : h
                    ),
                }));
            },

            unarchiveHabit: (id) => {
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === id ? { ...h, archived: false } : h
                    ),
                }));
            },

            // Skip days
            toggleSkip: (id, date) => {
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        const newSkips = { ...(h.skips || {}) };
                        const newCompletions = { ...h.completions };
                        if (newSkips[date]) {
                            delete newSkips[date];
                        } else {
                            newSkips[date] = true;
                            // Remove completion if skipping
                            delete newCompletions[date];
                        }
                        return { ...h, skips: newSkips, completions: newCompletions };
                    }),
                }));
            },

            // Notes
            setNote: (id, date, note) => {
                set((state) => ({
                    habits: state.habits.map((h) => {
                        if (h.id !== id) return h;
                        const newNotes = { ...(h.notes || {}) };
                        if (note.trim()) {
                            newNotes[date] = note.trim();
                        } else {
                            delete newNotes[date];
                        }
                        return { ...h, notes: newNotes };
                    }),
                }));
            },

            // Reordering
            reorderHabits: (orderedIds) => {
                set((state) => {
                    const newHabits = [...state.habits];
                    // Create a map for quick lookup of new order
                    const orderMap = new Map(orderedIds.map((id, index) => [id, index]));

                    return {
                        habits: newHabits.map((h) => {
                            if (orderMap.has(h.id)) {
                                return { ...h, order: orderMap.get(h.id)! };
                            }
                            return h;
                        }),
                    };
                });
            },

            getStreak: (id) => {
                const habit = get().habits.find((h) => h.id === id);
                if (!habit) return 0;

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
            },

            getLongestStreak: (id) => {
                const habit = get().habits.find((h) => h.id === id);
                if (!habit) return 0;

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
            },

            getTodayProgress: () => {
                const today = getDateString();
                const habits = get().habits.filter(h => !(h.archived ?? false));
                const completed = habits.filter((h) => h.completions[today]).length;
                return { completed, total: habits.length };
            },

            isAllCompletedToday: () => {
                const today = getDateString();
                const habits = get().habits.filter(h => !(h.archived ?? false));
                if (habits.length === 0) return true;
                return habits.every((h) => h.completions[today]);
            },

            hasAnyBrokenStreak: () => {
                const state = get();
                const today = getDateString();
                const yesterday = getPreviousDate(today);

                return state.habits.filter(h => !(h.archived ?? false)).some((habit) => {
                    const createdDate = getDateString(new Date(habit.createdAt));
                    if (createdDate === today) return false;

                    if (habit.completions[yesterday] && !habit.completions[today]) {
                        return true;
                    }
                    return false;
                });
            },

            getFrequencyProgress: (id) => {
                const habit = get().habits.find((h) => h.id === id);
                if (!habit) return { completed: 0, target: 1, periodLabel: 'today' };

                const freq = habit.frequency || { type: 'daily', target: 1 };
                const now = new Date();

                if (freq.type === 'daily') {
                    const today = getDateString();
                    return {
                        completed: habit.completions[today] ? 1 : 0,
                        target: freq.target,
                        periodLabel: 'today',
                    };
                } else if (freq.type === 'weekly') {
                    const weekStart = getWeekStart(now);
                    const completed = countCompletionsInRange(habit.completions, weekStart, now);
                    return {
                        completed,
                        target: freq.target,
                        periodLabel: 'this week',
                    };
                } else {
                    const monthStart = getMonthStart(now);
                    const completed = countCompletionsInRange(habit.completions, monthStart, now);
                    return {
                        completed,
                        target: freq.target,
                        periodLabel: 'this month',
                    };
                }
            },

            getActiveHabits: () => {
                return get().habits
                    .filter(h => !(h.archived ?? false))
                    .map(migrateHabit)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            },

            getArchivedHabits: () => {
                return get().habits
                    .filter(h => h.archived === true)
                    .map(migrateHabit);
            },
        }),
        {
            name: 'habit-storage',
            storage: createJSONStorage(() => AsyncStorage),
            version: 2,
            migrate: (persistedState: any, version: number) => {
                if (version < 2) {
                    // Version 1 to 2 migration: Ensure all habits are migrated
                    const state = persistedState as HabitState;
                    if (state.habits) {
                        state.habits = state.habits.map(migrateHabit);
                    }
                    return state;
                }
                return persistedState;
            },
        }
    )
);
