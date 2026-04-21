import { Share, Platform } from 'react-native';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Habit } from '../types/habit';
import {
    calculateStreak,
    calculateLongestStreak,
    getTotalCompletions,
    getTotalSkips
} from './habitStats';

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
        await file.write(jsonString);

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(file.uri, {
                mimeType: 'application/json',
                dialogTitle: 'Backup HabitFlow Data',
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

export const generateHTMLReport = (habits: Habit[]): string => {
    const rows = habits.map(h => `
        <tr>
            <td><span style="font-size: 1.2em; margin-right: 8px;">${h.emoji}</span>${h.name}</td>
            <td>${h.category}</td>
            <td>${h.frequency.target}x ${h.frequency.type}</td>
            <td>${h.createdAt.split('T')[0]}</td>
            <td style="text-align: center; color: #10b981; font-weight: 700;">${getTotalCompletions(h)}</td>
            <td style="text-align: center; color: #f59e0b;">${calculateStreak(h)}</td>
            <td style="text-align: center; color: #6366f1;">${calculateLongestStreak(h)}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HabitFlow Progress Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; padding: 20px; line-height: 1.5; background-color: #f3f4f6; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; borderRadius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        header { margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
        h1 { color: #6366f1; margin: 0; font-size: 24px; }
        .date { color: #6b7280; font-size: 14px; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { text-align: left; background-color: #f9fafb; color: #4b5563; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 15px; border-bottom: 1px solid #e5e7eb; }
        td { padding: 15px; border-bottom: 1px solid #f3f4f6; font-size: 15px; }
        tr:last-child td { border-bottom: none; }
        .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>HabitFlow Progress Report</h1>
            <div class="date">Exported on ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
        </header>
        <table>
            <thead>
                <tr>
                    <th>Habit</th>
                    <th>Category</th>
                    <th>Frequency</th>
                    <th>Created</th>
                    <th style="text-align: center;">Total Done</th>
                    <th style="text-align: center;">Streak</th>
                    <th style="text-align: center;">Best</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
        <div class="footer">
            Generated with <span style="color: #ef4444;">❤</span> by HabitFlow
        </div>
    </div>
</body>
</html>
    `;
};

export const shareReport = async (habits: Habit[]): Promise<void> => {
    const htmlString = generateHTMLReport(habits);
    const fileName = `habitflow-report-${new Date().toISOString().split('T')[0]}.html`;

    // Always use File to ensure it's shared as a file on both platforms
    const file = new File(Paths.cache, fileName);
    await file.write(htmlString);

    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
            mimeType: 'text/html',
            dialogTitle: 'Share Progress Report',
            UTI: 'public.html', // for iOS
        });
    } else {
        // Fallback for UI if sharing not available (unlikely on modern mobile)
        await Share.share({
            message: htmlString,
            title: fileName,
        });
    }
};
