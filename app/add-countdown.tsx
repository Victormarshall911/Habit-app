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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import FadeInView from '../src/components/FadeInView';
import { useTheme } from '../src/hooks/useTheme';
import { useHabitStore } from '../src/store/habitStore';
import { scheduleCountdownNotification } from '../src/services/notifications';
import {
    HabitColors,
    HabitEmojis,
    Spacing,
    Typography,
    BorderRadius,
    Shadows,
} from '../src/constants/theme';

export default function AddCountdownScreen() {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const addCountdown = useHabitStore((s) => s.addCountdown);

    const [title, setTitle] = React.useState('');
    const [targetDate, setTargetDate] = React.useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const [selectedEmoji, setSelectedEmoji] = React.useState('🎯');
    const [selectedColor, setSelectedColor] = React.useState(HabitColors[0]);
    
    const [showDatePicker, setShowDatePicker] = React.useState(Platform.OS === 'ios');
    const [showTimePicker, setShowTimePicker] = React.useState(Platform.OS === 'ios');

    const handleSave = async () => {
        if (!title.trim()) return;

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const countdownId = 'cd_' + Date.now().toString(36); // Temporary ID for notification mapping
        const notificationId = await scheduleCountdownNotification(
            countdownId,
            title.trim(),
            targetDate.toISOString(),
            selectedEmoji
        );

        addCountdown({
            title: title.trim(),
            targetDate: targetDate.toISOString(),
            emoji: selectedEmoji,
            color: selectedColor,
        }, notificationId);

        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (selectedDate) {
            const newDate = new Date(targetDate);
            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setTargetDate(newDate);
        }
    };

    const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (selectedTime) {
            const newDate = new Date(targetDate);
            newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
            setTargetDate(newDate);
        }
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
                        New Countdown
                    </Text>

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!title.trim()}
                        style={styles.headerButton}
                    >
                        <Text
                            style={[
                                styles.saveButtonText,
                                {
                                    color: title.trim() ? colors.primary : colors.textMuted,
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
                        <LinearGradient
                            colors={[selectedColor, selectedColor + 'CC']}
                            style={styles.previewCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.previewEmojiContainer}>
                                <Text style={{ fontSize: 32 }}>{selectedEmoji}</Text>
                            </View>
                            <Text style={styles.previewTitle} numberOfLines={1}>
                                {title || 'Event Name'}
                            </Text>
                            <Text style={styles.previewDate}>
                                {targetDate.toLocaleDateString()} at {targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </LinearGradient>
                    </FadeInView>

                    {/* Title Input */}
                    <FadeInView delay={200}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            TITLE
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
                            placeholder="e.g. My Birthday"
                            placeholderTextColor={colors.textMuted}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={40}
                            returnKeyType="done"
                        />
                    </FadeInView>

                    {/* Date & Time Selection */}
                    <FadeInView delay={250}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            DATE & TIME
                        </Text>
                        
                        {Platform.OS === 'android' ? (
                            <View style={styles.pickerRowAndroid}>
                                <TouchableOpacity 
                                    onPress={() => setShowDatePicker(true)}
                                    style={[styles.pickerBtnAndroid, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                                >
                                    <Ionicons name="calendar" size={20} color={colors.primary} />
                                    <Text style={[styles.pickerBtnText, { color: colors.text }]}>{targetDate.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => setShowTimePicker(true)}
                                    style={[styles.pickerBtnAndroid, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                                >
                                    <Ionicons name="time" size={20} color={colors.primary} />
                                    <Text style={[styles.pickerBtnText, { color: colors.text }]}>{targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.pickerRowIos}>
                                <DateTimePicker
                                    value={targetDate}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                    minimumDate={new Date()}
                                    themeVariant={isDark ? 'dark' : 'light'}
                                />
                                <DateTimePicker
                                    value={targetDate}
                                    mode="time"
                                    display="default"
                                    onChange={onTimeChange}
                                    themeVariant={isDark ? 'dark' : 'light'}
                                />
                            </View>
                        )}

                        {showDatePicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={targetDate}
                                mode="date"
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}
                        {showTimePicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={targetDate}
                                mode="time"
                                onChange={onTimeChange}
                            />
                        )}
                    </FadeInView>

                    {/* Emoji Picker */}
                    <FadeInView delay={300}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            ICON
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
                            <View style={styles.emojiRow}>
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
                        </ScrollView>
                    </FadeInView>

                    {/* Color Picker */}
                    <FadeInView delay={350}>
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                            COLOR
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
                    <FadeInView delay={450} from="top">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!title.trim()}
                            activeOpacity={0.85}
                            style={styles.saveButtonContainer}
                        >
                            <LinearGradient
                                colors={
                                    title.trim()
                                        ? [selectedColor, selectedColor + 'CC']
                                        : [colors.surfaceLight, colors.surfaceLight]
                                }
                                style={styles.saveButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons
                                    name="timer"
                                    size={24}
                                    color={title.trim() ? '#fff' : colors.textMuted}
                                />
                                <Text
                                    style={[
                                        styles.saveButtonLabel,
                                        { color: title.trim() ? '#fff' : colors.textMuted },
                                    ]}
                                >
                                    Start Countdown
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
        marginBottom: Spacing.xl,
    },
    previewCard: {
        width: '100%',
        padding: Spacing.xl,
        borderRadius: BorderRadius['2xl'],
        alignItems: 'center',
        ...Shadows.md,
    },
    previewEmojiContainer: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.xl,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    previewTitle: {
        ...Typography.title3,
        color: '#fff',
        textAlign: 'center',
    },
    previewDate: {
        ...Typography.caption,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
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
    pickerRowIos: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    pickerRowAndroid: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    pickerBtnAndroid: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    pickerBtnText: {
        ...Typography.subhead,
        fontWeight: '600',
    },
    emojiScroll: {
        marginHorizontal: -Spacing.xl,
        paddingHorizontal: Spacing.xl,
    },
    emojiRow: {
        flexDirection: 'row',
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
