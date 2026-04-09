import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Habit {
    id: string;
    name: string;
    emoji: string;
    color: string;
    createdAt: string;
    completions: Record<string, boolean>; // "YYYY-MM-DD" -> true
}

interface HabitState {
    habits: Habit[];
    reminderHours: number[];
    addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => void;
    editHabit: (id: string, updates: Partial<Pick<Habit, 'name' | 'emoji' | 'color'>>) => void;
    deleteHabit: (id: string) => void;
    toggleCompletion: (id: string, date: string) => void;
    setReminderHours: (hours: number[]) => void;
    getStreak: (id: string) => number;
    getLongestStreak: (id: string) => number;
    getTodayProgress: () => { completed: number; total: number };
    isAllCompletedToday: () => boolean;
    hasAnyBrokenStreak: () => boolean;
}

const getDateString = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0];
};

const getPreviousDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    date.setDate(date.getDate() - 1);
    return getDateString(date);
};

export const useHabitStore = create<HabitState>()(
    persist(
        (set, get) => ({
            habits: [],
            reminderHours: [8, 12, 16, 20],

            addHabit: (habitData) => {
                const newHabit: Habit = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
                    createdAt: new Date().toISOString(),
                    completions: {},
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
                        if (newCompletions[date]) {
                            delete newCompletions[date];
                        } else {
                            newCompletions[date] = true;
                        }
                        return { ...h, completions: newCompletions };
                    }),
                }));
            },

            setReminderHours: (hours) => {
                set({ reminderHours: [...hours].sort((a, b) => a - b) });
            },

            getStreak: (id) => {
                const habit = get().habits.find((h) => h.id === id);
                if (!habit) return 0;

                let streak = 0;
                let currentDate = getDateString();

                // If today is not completed, check from yesterday
                if (!habit.completions[currentDate]) {
                    currentDate = getPreviousDate(currentDate);
                    // If yesterday also not completed, streak is 0
                    if (!habit.completions[currentDate]) return 0;
                }

                while (habit.completions[currentDate]) {
                    streak++;
                    currentDate = getPreviousDate(currentDate);
                }

                return streak;
            },

            getLongestStreak: (id) => {
                const habit = get().habits.find((h) => h.id === id);
                if (!habit) return 0;

                const dates = Object.keys(habit.completions)
                    .filter((d) => habit.completions[d])
                    .sort();

                if (dates.length === 0) return 0;

                let longest = 1;
                let current = 1;

                for (let i = 1; i < dates.length; i++) {
                    const prev = new Date(dates[i - 1] + 'T12:00:00');
                    const curr = new Date(dates[i] + 'T12:00:00');
                    const diffDays = Math.round(
                        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    if (diffDays === 1) {
                        current++;
                        longest = Math.max(longest, current);
                    } else {
                        current = 1;
                    }
                }

                return longest;
            },

            getTodayProgress: () => {
                const today = getDateString();
                const habits = get().habits;
                const completed = habits.filter((h) => h.completions[today]).length;
                return { completed, total: habits.length };
            },

            isAllCompletedToday: () => {
                const today = getDateString();
                const habits = get().habits;
                if (habits.length === 0) return true;
                return habits.every((h) => h.completions[today]);
            },

            hasAnyBrokenStreak: () => {
                const state = get();
                const today = getDateString();
                const yesterday = getPreviousDate(today);

                return state.habits.some((habit) => {
                    // Has the habit been active for at least 2 days?
                    const createdDate = getDateString(new Date(habit.createdAt));
                    if (createdDate === today) return false;

                    // Had a streak yesterday but not completed today
                    if (habit.completions[yesterday] && !habit.completions[today]) {
                        return true;
                    }
                    return false;
                });
            },
        }),
        {
            name: 'habit-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
