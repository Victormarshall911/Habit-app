import React, { useState } from 'react';
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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useTheme } from '../src/hooks/useTheme';
import { useHabitStore } from '../src/store/habitStore';
import {
    HabitColors,
    HabitEmojis,
    Spacing,
    Typography,
    BorderRadius,
    Shadows,
} from '../src/constants/theme';

export default function AddHabitScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const addHabit = useHabitStore((s) => s.addHabit);

    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('💪');
    const [selectedColor, setSelectedColor] = useState(HabitColors[0]);

    const handleSave = async () => {
        if (!name.trim()) return;

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        addHabit({
            name: name.trim(),
            emoji: selectedEmoji,
            color: selectedColor,
        });

        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View
                style={[styles.container, { backgroundColor: colors.background }]}
            >
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.delay(50).springify()}
                    style={[
                        styles.header,
                        {
                            paddingTop: insets.top + Spacing.md,
                            borderBottomColor: colors.border,
                        },
                    ]}
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
                                styles.saveButton,
                                {
                                    color: name.trim() ? colors.primary : colors.textMuted,
                                },
                            ]}
                        >
                            Save
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Preview */}
                    <Animated.View
                        entering={FadeInDown.delay(100).springify()}
                        style={styles.previewSection}
                    >
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
                        </View>
                    </Animated.View>

                    {/* Name Input */}
                    <Animated.View entering={FadeInDown.delay(200).springify()}>
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
                    </Animated.View>

                    {/* Emoji Picker */}
                    <Animated.View entering={FadeInDown.delay(300).springify()}>
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
                    </Animated.View>

                    {/* Color Picker */}
                    <Animated.View entering={FadeInDown.delay(400).springify()}>
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
                    </Animated.View>

                    {/* Save Button */}
                    <Animated.View entering={FadeInUp.delay(500).springify()}>
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
                                        styles.saveButtonText,
                                        { color: name.trim() ? '#fff' : colors.textMuted },
                                    ]}
                                >
                                    Create Habit
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
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
    saveButton: {
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
    saveButtonText: {
        ...Typography.headline,
    },
});
