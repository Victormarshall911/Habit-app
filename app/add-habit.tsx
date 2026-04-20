import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import FadeInView from '../src/components/FadeInView';
import { useTheme } from '../src/hooks/useTheme';
import { useHabitStore, HabitCategory, FrequencyType } from '../src/store/habitStore';
import {
    HabitColors,
    HabitEmojis,
    HabitCategories,
    Spacing,
    Typography,
    BorderRadius,
    Shadows,
} from '../src/constants/theme';

const FREQUENCY_OPTIONS: { type: FrequencyType; label: string; icon: string }[] = [
    { type: 'daily', label: 'Daily', icon: 'today' },
    { type: 'weekly', label: 'Weekly', icon: 'calendar' },
    { type: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
];

export default function AddHabitScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const addHabit = useHabitStore((s) => s.addHabit);

    const [name, setName] = React.useState('');
    const [selectedEmoji, setSelectedEmoji] = React.useState('💪');
    const [selectedColor, setSelectedColor] = React.useState(HabitColors[0]);
    const [selectedCategory, setSelectedCategory] = React.useState<HabitCategory>('other');
    const [frequencyType, setFrequencyType] = React.useState<FrequencyType>('daily');
    const [frequencyTarget, setFrequencyTarget] = React.useState(1);

    const handleSave = async () => {
        if (!name.trim()) return;

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        addHabit({
            name: name.trim(),
            emoji: selectedEmoji,
            color: selectedColor,
            category: selectedCategory,
            frequency: { type: frequencyType, target: frequencyTarget },
        });

        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    const handleFrequencyTypeChange = (type: FrequencyType) => {
        Haptics.selectionAsync();
        setFrequencyType(type);
        // Set sensible default targets
        if (type === 'daily') setFrequencyTarget(1);
        else if (type === 'weekly') setFrequencyTarget(3);
        else setFrequencyTarget(20);
    };

    const maxTarget = frequencyType === 'daily' ? 1 : frequencyType === 'weekly' ? 7 : 31;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View
                style={[styles.container, { backgroundColor: colors.background }]}
            >
                {/* Header */}
                <FadeInView
                    delay={50}
                    style={{
                        ...styles.header,
                        paddingTop: insets.top + Spacing.md,
                        borderBottomColor: colors.border,
                    }}
                >
                    <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        New Habit
                    </Text>

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!name.trim()}
                        style={styles.headerButton}
                    >
                        <Text
                            style={[
                                styles.saveButtonText,
                                {
                                    color: name.trim() ? colors.primary : colors.textMuted,
                                },
                            ]}
                        >
                            Save
                        </Text>
                    </TouchableOpacity>
                </FadeInView>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Preview */}
                    <FadeInView delay={100} style={styles.previewSection}>
                        <View
                            style={[
                                styles.previewCard,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.05)'
                                        : 'rgba(0,0,0,0.02)',
                                    borderColor: selectedColor + '40',
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={[selectedColor + '15', 'transparent']}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <View
                                style={[
                                    styles.previewEmoji,
                                    { backgroundColor: selectedColor + '20' },
                                ]}
                            >
                                <Text style={{ fontSize: 40 }}>{selectedEmoji}</Text>
                            </View>
                            <Text
                                style={[
                                    styles.previewName,
                                    { color: name ? colors.text : colors.textMuted },
                                ]}
                            >
                                {name || 'Your habit name...'}
                            </Text>
                            {selectedCategory !== 'other' && (
                                <View style={[styles.previewCategoryBadge, { backgroundColor: HabitCategories.find(c => c.key === selectedCategory)?.color + '20' }]}>
                                    <Text style={[styles.previewCategoryText, { color: HabitCategories.find(c => c.key === selectedCategory)?.color }]}>
                                        {HabitCategories.find(c => c.key === selectedCategory)?.emoji} {HabitCategories.find(c => c.key === selectedCategory)?.label}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </FadeInView>

                    {/* Name Input */}
                    <FadeInView delay={200}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            HABIT NAME
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.06)'
                                        : 'rgba(0,0,0,0.03)',
                                    color: colors.text,
                                    borderColor: colors.border,
                                },
                            ]}
                            placeholder="e.g. Read for 30 minutes"
                            placeholderTextColor={colors.textMuted}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                            maxLength={50}
                            returnKeyType="done"
                        />
                    </FadeInView>

                    {/* Category Picker */}
                    <FadeInView delay={250}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            CATEGORY
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            <View style={styles.categoryRow}>
                                {HabitCategories.map((cat) => {
                                    const isSelected = selectedCategory === cat.key;
                                    return (
                                        <TouchableOpacity
                                            key={cat.key}
                                            onPress={() => {
                                                Haptics.selectionAsync();
                                                setSelectedCategory(cat.key as HabitCategory);
                                            }}
                                            style={[
                                                styles.categoryChip,
                                                {
                                                    backgroundColor: isSelected
                                                        ? cat.color + '25'
                                                        : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                                    borderColor: isSelected ? cat.color : 'transparent',
                                                    borderWidth: isSelected ? 2 : 0,
                                                },
                                            ]}
                                        >
                                            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                                            <Text style={[styles.categoryLabel, { color: isSelected ? cat.color : colors.textSecondary }]}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </FadeInView>

                    {/* Frequency Picker */}
                    <FadeInView delay={300}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            FREQUENCY
                        </Text>
                        <View style={styles.frequencyTypeRow}>
                            {FREQUENCY_OPTIONS.map((opt) => {
                                const isSelected = frequencyType === opt.type;
                                return (
                                    <TouchableOpacity
                                        key={opt.type}
                                        onPress={() => handleFrequencyTypeChange(opt.type)}
                                        style={[
                                            styles.frequencyTypeChip,
                                            {
                                                backgroundColor: isSelected
                                                    ? selectedColor + '25'
                                                    : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                                                borderColor: isSelected ? selectedColor : colors.border,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={opt.icon as any}
                                            size={18}
                                            color={isSelected ? selectedColor : colors.textSecondary}
                                        />
                                        <Text style={[
                                            styles.frequencyTypeLabel,
                                            { color: isSelected ? selectedColor : colors.textSecondary },
                                        ]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {frequencyType !== 'daily' && (
                            <View style={[styles.targetRow, { borderColor: colors.border }]}>
                                <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>
                                    Target: {frequencyTarget}x {frequencyType === 'weekly' ? 'per week' : 'per month'}
                                </Text>
                                <View style={styles.targetControls}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setFrequencyTarget(Math.max(1, frequencyTarget - 1));
                                        }}
                                        style={[styles.targetButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                                    >
                                        <Ionicons name="remove" size={20} color={colors.text} />
                                    </TouchableOpacity>
                                    <Text style={[styles.targetValue, { color: selectedColor }]}>
                                        {frequencyTarget}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setFrequencyTarget(Math.min(maxTarget, frequencyTarget + 1));
                                        }}
                                        style={[styles.targetButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
                                    >
                                        <Ionicons name="add" size={20} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </FadeInView>

                    {/* Emoji Picker */}
                    <FadeInView delay={350}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            CHOOSE AN ICON
                        </Text>
                        <View style={styles.emojiGrid}>
                            {HabitEmojis.map((emoji) => (
                                <TouchableOpacity
                                    key={emoji}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setSelectedEmoji(emoji);
                                    }}
                                    style={[
                                        styles.emojiOption,
                                        {
                                            backgroundColor:
                                                selectedEmoji === emoji
                                                    ? selectedColor + '25'
                                                    : isDark
                                                        ? 'rgba(255,255,255,0.04)'
                                                        : 'rgba(0,0,0,0.02)',
                                            borderColor:
                                                selectedEmoji === emoji
                                                    ? selectedColor
                                                    : 'transparent',
                                            borderWidth: selectedEmoji === emoji ? 2 : 0,
                                        },
                                    ]}
                                >
                                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FadeInView>

                    {/* Color Picker */}
                    <FadeInView delay={400}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            CHOOSE A COLOR
                        </Text>
                        <View style={styles.colorGrid}>
                            {HabitColors.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setSelectedColor(color);
                                    }}
                                    style={[
                                        styles.colorOption,
                                        {
                                            borderColor:
                                                selectedColor === color ? colors.text : 'transparent',
                                            borderWidth: selectedColor === color ? 3 : 0,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[styles.colorDot, { backgroundColor: color }]}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </FadeInView>

                    {/* Save Button */}
                    <FadeInView delay={500} from="top">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!name.trim()}
                            activeOpacity={0.85}
                            style={styles.saveButtonContainer}
                        >
                            <LinearGradient
                                colors={
                                    name.trim()
                                        ? [selectedColor, selectedColor + 'CC']
                                        : [colors.surfaceLight, colors.surfaceLight]
                                }
                                style={styles.saveButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons
                                    name="add-circle"
                                    size={24}
                                    color={name.trim() ? '#fff' : colors.textMuted}
                                />
                                <Text
                                    style={[
                                        styles.saveButtonLabel,
                                        { color: name.trim() ? '#fff' : colors.textMuted },
                                    ]}
                                >
                                    Create Habit
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </FadeInView>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomWidth: 0.5,
    },
    headerButton: {
        padding: Spacing.sm,
        minWidth: 50,
    },
    headerTitle: {
        ...Typography.headline,
    },
    saveButtonText: {
        ...Typography.headline,
        textAlign: 'right',
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingBottom: 60,
    },
    previewSection: {
        alignItems: 'center',
        marginBottom: Spacing['3xl'],
    },
    previewCard: {
        alignItems: 'center',
        padding: Spacing['3xl'],
        borderRadius: BorderRadius['2xl'],
        borderWidth: 1,
        width: '100%',
        overflow: 'hidden',
        ...Shadows.md,
    },
    previewEmoji: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    previewName: {
        ...Typography.title3,
        textAlign: 'center',
    },
    previewCategoryBadge: {
        marginTop: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    previewCategoryText: {
        ...Typography.caption,
        fontWeight: '600',
    },
    sectionLabel: {
        ...Typography.caption,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    input: {
        borderWidth: 1,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Typography.body,
    },
    // Category
    categoryScroll: {
        marginHorizontal: -Spacing.xl,
        paddingHorizontal: Spacing.xl,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    categoryEmoji: {
        fontSize: 16,
    },
    categoryLabel: {
        ...Typography.footnote,
        fontWeight: '600',
    },
    // Frequency
    frequencyTypeRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    frequencyTypeChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    frequencyTypeLabel: {
        ...Typography.footnote,
        fontWeight: '600',
    },
    targetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
    },
    targetLabel: {
        ...Typography.subhead,
    },
    targetControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    targetButton: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    targetValue: {
        ...Typography.title2,
        fontWeight: '800',
        minWidth: 30,
        textAlign: 'center',
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    emojiOption: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 3,
    },
    colorDot: {
        width: '100%',
        height: '100%',
        borderRadius: BorderRadius.full,
    },
    saveButtonContainer: {
        marginTop: Spacing['3xl'],
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.xl,
        gap: Spacing.sm,
        ...Shadows.md,
    },
    saveButtonLabel: {
        ...Typography.headline,
    },
});
