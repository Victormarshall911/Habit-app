import { Share, Platform } from 'react-native';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Habit } from '../store/habitStore';

interface ExportData {
    version: 1;
    exportedAt: string;
    habits: Habit[];
    reminderHours: number[];
}

export const exportHabitData = (habits: Habit[], reminderHours: number[]): string => {
    const data: ExportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        habits,
        reminderHours,
    };
    return JSON.stringify(data, null, 2);
};

export const parseImportData = (jsonString: string): ExportData => {
    try {
        const data = JSON.parse(jsonString);

        if (!data.habits || !Array.isArray(data.habits)) {
            throw new Error('Invalid data format: missing habits array');
        }

        // Validate each habit has required fields
        for (const habit of data.habits) {
            if (!habit.id || !habit.name || !habit.emoji || !habit.color || !habit.createdAt) {
                throw new Error(`Invalid habit data: missing required fields in "${habit.name || 'unknown'}"`);
            }
        }

        return {
            version: data.version || 1,
            exportedAt: data.exportedAt || new Date().toISOString(),
            habits: data.habits,
            reminderHours: data.reminderHours || [8, 12, 16, 20],
        };
    } catch (e: any) {
        if (e.message.startsWith('Invalid')) throw e;
        throw new Error('Could not parse import file. Please ensure it is a valid HabitFlow export.');
    }
};

export const shareExportedData = async (habits: Habit[], reminderHours: number[]): Promise<void> => {
    const jsonString = exportHabitData(habits, reminderHours);
    const fileName = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;

    if (Platform.OS === 'android') {
        // On Android, write to a temp file and share via Sharing
        const file = new File(Paths.cache, fileName);
        file.write(jsonString, { encoding: 'utf8' });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/json',
                dialogTitle: 'Export HabitFlow Data',
            });
        }
    } else {
        // On iOS, use Share API
        await Share.share({
            message: jsonString,
            title: fileName,
        });
    }
};
