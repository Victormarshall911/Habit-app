# 🌊 HabitFlow

**HabitFlow** is a modern, premium, and feature-rich habit-tracking application designed to help you build and maintain a better lifestyle. Built with **React Native** and **Expo**, it features a sleek dark-themed UI, smooth micro-animations, and powerful tracking capabilities.

<div align="center">
  <img src="assets/screen1.PNG" width="21%" />
  <img src="assets/screen2.PNG" width="21%" />
  <img src="assets/screen3.PNG" width="21%" />
  <img src="assets/screen4.PNG" width="21%" />
</div>

---

## ✨ Key Features

- 📅 **Flexible Tracking**: Daily, weekly, or monthly goals for each habit.
- 🔥 **Streak System**: Visualize your progress with current and best streaks.
- 📱 **Home Screen Widgets**: Track your countdowns directly from your home screen (iOS & Android).
- ⏳ **Event Countdowns**: Create and track important life events with integrated notifications.
- 🎨 **Dynamic App Icon**: The app icon reflects your streak status, providing a visual cue for your consistency.
- 📊 **Detailed Insights**:
    - **Calendar Heatmaps**: Visualize your consistency over time.
    - **Circular Progress**: Quick overview of your daily goal completion.
    - **Progress Stats**: Track total completions, skips, and scores.
- 🔔 **Smart Reminders**: Customizable local notifications for both habits and countdowns.
- 📂 **Organization**:
    - **Categories**: Group habits (Health, Productivity, Mindfulness, etc.).
    - **Archiving**: Keep your list clean by archiving old habits.
    - **Reordering**: Drag and drop habits to prioritize your day.
- 📝 **Notes**: Attach daily notes to your habits for extra context.
- 💾 **Data Independence**: Export and import your data anytime (CSV/JSON).

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 54)
- **UI Library**: [React Native](https://reactnative.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **Widgets**: [expo-widgets](https://github.com/EvanBacon/expo-widgets) (Native iOS/Android widgets)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Persistent store)
- **Storage**: [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/)
- **Styling**: [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) & Custom Design System
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 📂 Project Structure

```bash
Habit-app/
├── app/                  # Expo Router screens and layouts
│   ├── (tabs)/           # Main tab navigation (Index, Stats, Settings)
│   ├── _layout.tsx       # Root configuration and providers
│   ├── add-habit.tsx     # Habit creation logic
│   └── add-countdown.tsx # Event countdown creation
├── src/
│   ├── components/       # Reusable UI components (Heatmap, Progress, etc.)
│   ├── store/            # Zustand store (habitStore.ts)
│   ├── utils/            # Business logic, date helpers, and stats
│   ├── hooks/            # Custom React hooks
│   ├── constants/        # Theme, colors, and layout constants
│   └── services/         # Notification, WidgetSync, and AppIcon services
├── widgets/              # Native Widget source code (expo-widgets)
└── assets/               # App icons, splash screen, and screenshots
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- [Expo Go](https://expo.dev/go) app on your mobile device (for testing core features)
- **Note**: Widgets and Dynamic App Icons require a [Development Build](https://docs.expo.dev/develop/development-builds/introduction/).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/HabitFlow.git
   cd HabitFlow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Scan the QR code**: Open the Expo Go app on your phone and scan the code shown in your terminal.

---

## 🏗️ Development

### Building for Production

This project uses EAS Build for generating production binaries. 

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Developed with ❤️ by [Victor Marshall](https://github.com/Victormarshall911)
