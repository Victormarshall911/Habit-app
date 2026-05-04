'widget';
import { VStack, HStack, Text, Spacer, Circle } from '@expo/ui';
import { createWidget } from 'expo-widgets';

// This is the native UI for the iOS Home Screen Widget
export default createWidget(({ entry }) => {
    // entry contains the data passed from the main app
    const { title = 'No Event', targetDate, color = '#7C3AED', emoji = '🎯' } = entry;

    const getTimeLeft = () => {
        if (!targetDate) return { days: 0, hours: 0, mins: 0 };
        const diff = +new Date(targetDate) - +new Date();
        if (diff <= 0) return { days: 0, hours: 0, mins: 0, finished: true };
        
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            mins: Math.floor((diff / 1000 / 60) % 60),
            finished: false
        };
    };

    const { days, hours, mins, finished } = getTimeLeft();

    return (
        <VStack style={{ 
            flex: 1, 
            padding: 16, 
            backgroundColor: color, 
            borderRadius: 22,
            justifyContent: 'space-between'
        }}>
            <HStack style={{ alignItems: 'center', gap: 8 }}>
                <Circle style={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <Text style={{ fontSize: 18 }}>{emoji}</Text>
                </Circle>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                    {title}
                </Text>
            </HStack>

            <Spacer />

            {finished ? (
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                    ✨ Time's up!
                </Text>
            ) : (
                <VStack style={{ gap: 2 }}>
                    <HStack style={{ alignItems: 'baseline', gap: 4 }}>
                        <Text style={{ color: 'white', fontSize: 32, fontWeight: '800' }}>
                            {days}
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>
                            DAYS LEFT
                        </Text>
                    </HStack>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' }}>
                        {hours}h {mins}m remaining
                    </Text>
                </VStack>
            )}
        </VStack>
    );
});
