export const Colors = {
    dark: {
        // Base
        background: '#0F0A1A',
        surface: '#1A1128',
        surfaceLight: '#251B36',
        surfaceGlass: 'rgba(255, 255, 255, 0.05)',

        // Primary
        primary: '#7C3AED',
        primaryLight: '#A78BFA',
        primaryDark: '#5B21B6',

        // Accent
        accent: '#06D6A0',
        accentLight: '#34D399',
        accentDark: '#059669',

        // Warm
        warm: '#F59E0B',
        warmLight: '#FBBF24',
        fire: '#EF4444',

        // Text
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',

        // Borders
        border: 'rgba(255, 255, 255, 0.08)',
        borderLight: 'rgba(255, 255, 255, 0.15)',

        // Gradient Colors
        gradientStart: '#7C3AED',
        gradientEnd: '#06D6A0',
        gradientWarm: '#F59E0B',

        // Status
        success: '#06D6A0',
        error: '#EF4444',
        warning: '#F59E0B',
    },
    light: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceLight: '#F1F5F9',
        surfaceGlass: 'rgba(0, 0, 0, 0.03)',

        primary: '#7C3AED',
        primaryLight: '#A78BFA',
        primaryDark: '#5B21B6',

        accent: '#06D6A0',
        accentLight: '#34D399',
        accentDark: '#059669',

        warm: '#F59E0B',
        warmLight: '#FBBF24',
        fire: '#EF4444',

        text: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#94A3B8',

        border: 'rgba(0, 0, 0, 0.06)',
        borderLight: 'rgba(0, 0, 0, 0.12)',

        gradientStart: '#7C3AED',
        gradientEnd: '#06D6A0',
        gradientWarm: '#F59E0B',

        success: '#06D6A0',
        error: '#EF4444',
        warning: '#F59E0B',
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

export const Typography = {
    largeTitle: {
        fontSize: 34,
        fontWeight: '800' as const,
        letterSpacing: -0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: -0.3,
    },
    title2: {
        fontSize: 22,
        fontWeight: '700' as const,
        letterSpacing: -0.2,
    },
    title3: {
        fontSize: 20,
        fontWeight: '600' as const,
    },
    headline: {
        fontSize: 17,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 17,
        fontWeight: '400' as const,
    },
    callout: {
        fontSize: 16,
        fontWeight: '400' as const,
    },
    subhead: {
        fontSize: 15,
        fontWeight: '400' as const,
    },
    footnote: {
        fontSize: 13,
        fontWeight: '400' as const,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400' as const,
    },
    caption2: {
        fontSize: 11,
        fontWeight: '400' as const,
    },
};

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    }),
};

export const HabitColors = [
    '#7C3AED', // Purple
    '#06D6A0', // Teal
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#8B5CF6', // Violet
    '#14B8A6', // Emerald
    '#F97316', // Orange
    '#6366F1', // Indigo
];

export const HabitEmojis = [
    '💪', '📚', '🧘', '🏃', '💧', '🎯', '✍️', '🎵',
    '🍎', '😴', '🧹', '💊', '🚶', '🎨', '💰', '🙏',
    '🏋️', '📝', '🥗', '☕', '🧠', '🌿', '🎸', '📖',
];
