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
