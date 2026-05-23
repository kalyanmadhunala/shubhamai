// App.jsx
import './global.css';
import React from 'react';
import { Text, TextInput, LogBox, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { Toaster } from 'sonner-native';
// ── Font monkey-patch ─────────────────────────────────────────────────────────
const defaultTextStyle = Text.defaultProps?.style ?? {};
Text.defaultProps = {
  ...(Text.defaultProps ?? {}),
  style: [{ fontFamily: 'Inter-Regular' }, defaultTextStyle],
};
const defaultInputStyle = TextInput.defaultProps?.style ?? {};
TextInput.defaultProps = {
  ...(TextInput.defaultProps ?? {}),
  style: [{ fontFamily: 'Inter-Regular' }, defaultInputStyle],
};

LogBox.ignoreLogs([
  '[react-native-gesture-handler] None of the callbacks in the gesture are worklets',
]);

// ── Inner component so useSafeAreaInsets works inside SafeAreaProvider ────────
function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <AppNavigator />
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
