# Livvy

A React Native mobile application built with Expo and NativeWind.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For mobile development:
  - **Android**: [Android Studio](https://developer.android.com/studio) with an emulator or physical device
  - **iOS**: [Xcode](https://developer.apple.com/xcode/) (macOS only) with a simulator or physical device
- Alternatively, install the [Expo Go](https://expo.dev/client) app on your mobile device

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/G-Zanc/project_livvy.git
   cd project_livvy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

Start the development server:
```bash
npm start
```

This will open Expo DevTools. From there you can:

- **Press `a`** - Open on Android emulator/device
- **Press `i`** - Open on iOS simulator (macOS only)
- **Press `w`** - Open in web browser
- **Scan the QR code** - Open in Expo Go app on your physical device

### Platform-specific commands

```bash
# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web
npm run web
```

## Tech Stack

- [Expo](https://expo.dev/) - React Native framework
- [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing
- [NativeWind](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [TypeScript](https://www.typescriptlang.org/) - Type safety
