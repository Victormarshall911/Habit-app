'widget';
import { VStack, HStack, Text, Spacer, Circle, ZStack } from '@expo/ui/swift-ui';
import { padding, frame, background, foregroundStyle, font, cornerRadius } from '@expo/ui/swift-ui/modifiers';
import { createWidget } from 'expo-widgets';

// This is the native UI for the Home Screen Widget (iOS & Android)
export default createWidget('CountdownWidget', (props: { entry: { title?: string, targetDate?: string, color?: string, emoji?: string } }) => {
    const { entry } = props;
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
        <VStack 
            alignment="leading"
            modifiers={[
                frame({ maxWidth: Infinity, maxHeight: Infinity }),
                padding({ all: 16 }),
                background(color),
                cornerRadius(22)
            ]}
        >
            <HStack spacing={8} alignment="center">
                <ZStack modifiers={[frame({ width: 32, height: 32 })]}>
                    <Circle modifiers={[foregroundStyle('rgba(255,255,255,0.2)')]} />
                    <Text modifiers={[font({ size: 18 })]}>{emoji}</Text>
                </ZStack>
                <Text modifiers={[foregroundStyle('white'), font({ size: 14, weight: 'semibold' })]}>
                    {title}
                </Text>
            </HStack>

            <Spacer />

            {finished ? (
                <Text modifiers={[foregroundStyle('white'), font({ size: 18, weight: 'bold' })]}>
                    ✨ Time's up!
                </Text>
            ) : (
                <VStack alignment="leading" spacing={2}>
                    <HStack alignment="bottom" spacing={4}>
                        <Text modifiers={[foregroundStyle('white'), font({ size: 32, weight: 'heavy' })]}>
                            {days}
                        </Text>
                        <Text modifiers={[foregroundStyle('rgba(255,255,255,0.7)'), font({ size: 12, weight: 'semibold' })]}>
                            DAYS LEFT
                        </Text>
                    </HStack>
                    <Text modifiers={[foregroundStyle('rgba(255,255,255,0.8)'), font({ size: 14, weight: 'medium' })]}>
                        {hours}h {mins}m remaining
                    </Text>
                </VStack>
            )}
        </VStack>
    );
});
