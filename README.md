# LawStack Mobile

A comprehensive mobile application for law students and professionals built with React Native and Expo.

![LawStack Mobile Logo](./assets/images/logo.png)

## Overview

LawStack Mobile is a powerful learning platform specifically designed for law students and professionals. It provides access to courses, past examination questions, AI-powered chat assistance, quizzes, and a robust search functionality to help users find relevant legal educational content quickly.

## Features

### 🔍 Advanced Search
- Multi-filter search system with institution, course, year, and content type filters
- Real-time search results with debounced input
- Beautiful UI with animated transitions
- Support for searching courses, past questions, and educational resources

### 💬 AI Chat Assistant
- Conversational AI to help with legal questions
- Multiple AI model options with varying capabilities
- Chat history and conversation management
- Rich markdown support for complex legal explanations

### 📚 Course Library
- Browse courses by institution and topic
- Detailed course information and materials
- Course-specific questions and resources
- Interactive learning content

### ❓ Past Questions
- Access to previous examination questions
- Organized by institution, course, and year
- Searchable question database
- Question analysis and explanations

### 📝 Quizzes
- Self-assessment tools
- Course-specific quiz modules
- Performance tracking and analytics
- Exam preparation resources

### 👤 User Authentication
- Secure login and registration
- OTP verification
- Profile management
- Subscription management for premium features

## Technology Stack

- **Frontend Framework**: React Native
- **SDK**: Expo
- **Navigation**: Expo Router
- **State Management**: React Context API & React Query
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: Custom components with Animated library
- **Authentication**: Custom JWT-based auth
- **API Client**: Axios
- **Storage**: AsyncStorage for local data

## Project Structure

```
lawstack_mobile/
├── app/ - Expo Router pages and layouts
│   ├── (auth)/ - Authentication routes
│   ├── (tabs)/ - Main tab navigation
│   ├── courses/ - Course detail pages
│   └── past-questions/ - Question detail pages
├── assets/ - Static assets like images and fonts
├── components/ - Reusable UI components
│   ├── chat/ - Chat interface components
│   ├── common/ - Generic components
│   ├── courses/ - Course-related components
│   ├── home/ - Home screen components
│   └── ui/ - Basic UI elements
├── constants/ - App constants (Colors, Spacing, etc.)
├── contexts/ - React Contexts for state management
├── hooks/ - Custom React hooks
├── lib/ - Utility libraries and functions
├── scripts/ - Development scripts
└── services/ - API services and data fetching logic
    └── hooks/ - React Query hooks for data fetching
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
```powershell
git clone <repository-url>
cd lawstack_mobile
```

2. Install dependencies:
```powershell
npm install
# or
yarn install
```

3. Start the development server:
```powershell
npx expo start
```

### Running on Devices

- **iOS Simulator**: Press `i` in the terminal after starting the development server
- **Android Emulator**: Press `a` in the terminal after starting the development server
- **Physical Device**: Scan the QR code using the Expo Go app

## Building for Production

### Using EAS Build (Recommended)

1. Install EAS CLI:
```powershell
npm install -g eas-cli
```

2. Configure EAS Build:
```powershell
eas build:configure
```

3. Build for specific platforms:
```powershell
# For Android
eas build --platform android

# For iOS
eas build --platform ios
```

### Using Expo Classic Build

```powershell
expo build:android
# or
expo build:ios
```

## Environment Configuration

The app uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
API_URL=https://api.example.com
AUTH_TOKEN_KEY=auth_token
REFRESH_TOKEN_KEY=refresh_token
```

## API Documentation

The app communicates with a backend API for data retrieval and authentication. API endpoints are organized by service:

- `/auth` - Authentication endpoints
- `/courses` - Course data endpoints
- `/questions` - Past question endpoints
- `/search` - Search functionality
- `/chat` - AI chat functionality
- `/quizzes` - Quiz endpoints

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Testing

Run tests with:

```powershell
npm test
# or
yarn test
```

## Troubleshooting

### Common Issues

1. **Metro bundler not starting properly**:
   - Try clearing Metro cache: `npx expo start --clear`

2. **Build failures**:
   - Check that all dependencies are correctly installed
   - Ensure your environment variables are correctly set up

3. **UI rendering issues**:
   - Make sure the device/emulator runs the latest OS version
   - Try reloading the app with `r` in the terminal

## Key Dependencies

- react-native
- expo
- expo-router
- @tanstack/react-query
- nativewind
- react-native-reanimated
- axios
- react-native-markdown-display

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [NativeWind](https://nativewind.dev/)

## Contact

For questions or support, please contact the development team at dev@lawstack.example.com.

---

© 2025 LawStack. All rights reserved.