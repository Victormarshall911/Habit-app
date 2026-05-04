import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Habit, HabitCategory, FrequencyType, HabitFrequency, Countdown } from '../types/habit';
import {
    calculateStreak,
    calculateLongestStreak,
} from '../utils/habitStats';

import {
    getDateString,
    getPreviousDate,
    getWeekStart,
    getMonthStart,
    countCompletionsInRange
} from '../utils/date';
import { syncWidget } from '../services/widget-sync';
import { cancelNotification } from '../services/notifications';

interface FrequencyProgress {
    completed: number;
    target: number;
    periodLabel: string; // "this week" / "this month"
}

interface HabitState {
    habits: Habit[];
    countdowns: Countdown[];
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

    // Countdowns
    addCountdown: (countdown: Omit<Countdown, 'id' | 'createdAt'>, notificationId?: string) => void;
    deleteCountdown: (id: string) => void;
}

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
            countdowns: [],
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

            reorderHabits: (orderedIds) => {
                set((state) => {
                    const newHabits = [...state.habits];
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
                return calculateStreak(habit);
            },

            getLongestStreak: (id) => {
                const habit = get().habits.find((h) => h.id === id);
                if (!habit) return 0;
                return calculateLongestStreak(habit);
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

            // Countdowns
            addCountdown: (countdownData, notificationId) => {
                const newCountdown: Countdown = {
                    id: 'cd_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                    createdAt: new Date().toISOString(),
                    notificationId,
                    ...countdownData,
                };
                const newCountdowns = [...(get().countdowns || []), newCountdown];
                set({ countdowns: newCountdowns });
                syncWidget(newCountdowns);
            },

            deleteCountdown: (id) => {
                const cd = (get().countdowns || []).find(c => c.id === id);
                if (cd?.notificationId) {
                    cancelNotification(cd.notificationId);
                }
                const newCountdowns = (get().countdowns || []).filter((c) => c.id !== id);
                set({ countdowns: newCountdowns });
                syncWidget(newCountdowns);
            },
        }),
        {
            name: 'habit-storage',
            storage: createJSONStorage(() => AsyncStorage),
            version: 3,
            migrate: (persistedState: any, version: number) => {
                const state = persistedState as any;
                if (version < 3) {
                    if (state.habits && !state.countdowns) {
                        state.countdowns = [];
                    }
                    if (state.habits) {
                        state.habits = state.habits.map(migrateHabit);
                    }
                }
                return state;
            },
        }
    )
);
