export const getDateString = (date: Date = new Date()): string => {
    return date.toISOString().split('T')[0];
};

export const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

export const formatDateDisplay = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
};

export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

export const getMonthDates = (year: number, month: number): string[] => {
    const days = getDaysInMonth(year, month);
    const dates: string[] = [];
    for (let d = 1; d <= days; d++) {
        const date = new Date(year, month, d);
        dates.push(getDateString(date));
    }
    return dates;
};

export const getLast7Days = (): string[] => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(getDateString(date));
    }
    return dates;
};

export const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getPreviousDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T12:00:00');
    date.setDate(date.getDate() - 1);
    return getDateString(date);
};

export const getWeekStart = (date: Date = new Date()): Date => {
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    d.setDate(diff);
    return d;
};

export const getMonthStart = (date: Date = new Date()): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0);
};

export const countCompletionsInRange = (completions: Record<string, boolean>, startDate: Date, endDate: Date): number => {
    let count = 0;
    // Normalize to noon to avoid time-of-day comparison issues
    const start = new Date(startDate);
    start.setHours(12, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(12, 0, 0, 0);

    const current = new Date(start);
    while (current <= end) {
        const key = getDateString(current);
        if (completions[key]) count++;
        current.setDate(current.getDate() + 1);
    }
    return count;
};
