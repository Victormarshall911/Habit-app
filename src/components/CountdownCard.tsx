import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Countdown } from '../types/habit';
import { BorderRadius, Spacing, Typography, Shadows } from '../constants/theme';

interface CountdownCardProps {
    countdown: Countdown;
    onDelete?: (id: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export default function CountdownCard({
    countdown,
    onDelete,
}: CountdownCardProps) {
    const { colors, isDark } = useTheme();
    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft(countdown.targetDate));

    React.useEffect(() => {
        const timer = setInterval(() => {
            const next = calculateTimeLeft(countdown.targetDate);
            setTimeLeft(next);
            
            // If it just finished, we could trigger a special effect here
            if (next.total <= 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown.targetDate]);

    function calculateTimeLeft(target: string) {
        const difference = +new Date(target) - +new Date();
        let timeLeft = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            total: difference
        };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                total: difference
            };
        }

        return timeLeft;
    }

    const handleDelete = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete?.(countdown.id);
    };

    const isFinished = timeLeft.total <= 0;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[countdown.color, countdown.color + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
            >
                <View style={styles.header}>
                    <View style={styles.emojiContainer}>
                        <Text style={styles.emoji}>{countdown.emoji}</Text>
                    </View>
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                        <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={1}>{countdown.title}</Text>
                    
                    {isFinished ? (
                        <View style={styles.finishedContainer}>
                            <Text style={styles.finishedText}>✨ Time's up! 🎉</Text>
                        </View>
                    ) : (
                        <View style={styles.timerRow}>
                            <TimerUnit value={timeLeft.days} label="Days" />
                            <TimerDivider />
                            <TimerUnit value={timeLeft.hours} label="Hrs" />
                            <TimerDivider />
                            <TimerUnit value={timeLeft.minutes} label="Min" />
                            <TimerDivider />
                            <TimerUnit value={timeLeft.seconds} label="Sec" />
                        </View>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
}

function TimerUnit({ value, label }: { value: number; label: string }) {
    return (
        <View style={styles.unit}>
            <Text style={styles.unitValue}>{value.toString().padStart(2, '0')}</Text>
            <Text style={styles.unitLabel}>{label}</Text>
        </View>
    );
}

function TimerDivider() {
    return (
        <View style={styles.divider}>
            <Text style={styles.dividerText}>:</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        marginRight: Spacing.md,
        borderRadius: BorderRadius['2xl'],
        overflow: 'hidden',
        ...Shadows.md,
    },
    card: {
        padding: Spacing.lg,
        height: 140,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emojiContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.lg,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 18,
    },
    deleteBtn: {
        padding: 4,
    },
    content: {
        marginTop: Spacing.sm,
    },
    title: {
        ...Typography.title3,
        color: '#fff',
        marginBottom: Spacing.sm,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    unit: {
        alignItems: 'center',
    },
    unitValue: {
        ...Typography.title,
        color: '#fff',
        fontSize: 22,
        lineHeight: 26,
    },
    unitLabel: {
        ...Typography.caption2,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    divider: {
        paddingHorizontal: 4,
        paddingTop: 2,
    },
    dividerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 18,
        fontWeight: 'bold',
    },
    finishedContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
    },
    finishedText: {
        ...Typography.subhead,
        color: '#fff',
        fontWeight: 'bold',
    },
});
