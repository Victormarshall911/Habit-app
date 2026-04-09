# HabitFlow

## Overview

This project is a mobile habit tracker designed to help you build and maintain daily routines. It lets you create and manage your habits, track your daily progress, and visualize your consistency over time, making it easier to stay motivated and reach your goals.

## Features

*   **Personalized Habit Creation**: Easily add new habits, customizing each with a name, an emoji, and a distinct color.
*   **Daily Tracking & Progress**: Mark habits as complete each day and see your overall progress with a visual daily tracker.
*   **Detailed Habit Insights**: Dive into individual habit pages to view current and longest streaks, total completions, and historical data.
*   **Visual Consistency Tracking**: Utilize a weekly overview and monthly calendar heatmaps to see your habit completion patterns at a glance.
*   **Motivational Quotes**: Get inspired with a daily quote focused on consistency and personal growth.
*   **Customizable Reminders**: Schedule daily notifications at your preferred times to help you stay on track.
*   **Adaptive User Interface**: Enjoy a seamless experience with automatic light and dark mode switching based on your device settings.
*   **Local Data Persistence**: All your habits and progress are saved directly on your device, ensuring privacy and quick access.

## Usage

HabitFlow is a mobile application. Once you've set it up, you can start building your routines:

1.  **Launch the App**: Open the HabitFlow app on your device.
2.  **Add Your First Habit**:
    *   On the main "Today" screen, you will see a large "Add Habit" button if you don't have any habits yet, or a floating action button (FAB) at the bottom right.
    *   Tap the button to open the "New Habit" screen.
    *   Enter a name for your habit, choose an emoji icon, and select a color.
    *   Tap "Save" to create your habit.
3.  **Track Daily Progress**:
    *   On the "Today" screen, your habits will be listed.
    *   Tap the checkbox next to a habit to mark it as complete for the day. Tap again to unmark it.
    *   The circular progress indicator at the top will update to show your daily completion rate.
4.  **View Habit Details**:
    *   Tap on any habit card on the "Today" screen to see its dedicated detail page.
    *   Here you can see your current and longest streaks, total completions, a weekly overview, and a monthly heatmap of your activity.
    *   You can also mark the habit as done for today from this screen or delete the habit.
5.  **Check Your Stats**:
    *   Navigate to the "Stats" tab to see an overview of your progress across all habits, including total active streaks, best overall streak, and total completions.
    *   Individual habit stats, including weekly overviews and calendar heatmaps, are also available here.
6.  **Configure Settings**:
    *   Go to the "Settings" tab to manage your notifications.
    *   You can enable or disable habit reminders and customize the specific hours you want to receive them.

## Technologies Used

| Technology | Description |
| :------------------------------ | :--------------------------------------------- |
| [TypeScript](https://www.typescriptlang.org/) | Superset of JavaScript for type safety. |
| [React Native](https://reactnative.dev/) | Framework for building native mobile apps. |
| [Expo](https://expo.dev/) | Tools and services for building universal apps. |
| [Expo Router](https://expo.github.io/router/) | File-system-based router for Expo and React Native. |
| [Zustand](https://zustand-di.github.io/ | A small, fast, and scalable state management solution. |
| [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) | API for handling local and push notifications. |
| [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | Provides tactile feedback. |
| [React Native SVG](https://github.com/react-native-community/react-native-svg) | Library for rendering SVG images and elements. |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Persistent key-value storage for React Native. |

## Contributing

We'd love for you to contribute to HabitFlow! Here are some guidelines:

1.  **Fork the repository**: Start by forking the project to your own GitHub account.
2.  **Clone the repository**: Clone your forked repository to your local machine.
    ```bash
    git clone https://github.com/your-username/HabitFlow.git
    cd HabitFlow
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    # or yarn install
    ```
4.  **Create a new branch**:
    ```bash
    git checkout -b feature/your-feature-name
    ```
5.  **Make your changes**: Implement your feature or fix.
6.  **Test your changes**: Ensure everything works as expected.
7.  **Commit your changes**: Write clear and concise commit messages.
    ```bash
    git commit -m "feat: Add new awesome feature"
    ```
8.  **Push to your branch**:
    ```bash
    git push origin feature/your-feature-name
    ```
9.  **Open a Pull Request**: Submit a pull request to the main `HabitFlow` repository. Please describe your changes in detail.

## License

This project does not currently have an explicit license file. Please contact the author for licensing information.

## Author Info

*   **Marshall Victor**
    -   [LinkedIn](https://www.linkedin.com/in/marshall-victor-501460213/)
    -   [X (formerly Twitter)](https://x.com/marshallvicto18)
## Badges

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-223441?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-di.github.io/)
