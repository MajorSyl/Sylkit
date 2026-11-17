import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HelpWidget } from '../src/components/HelpWidget';
import { LangProvider } from '../src/i18n';
import { colors } from '../src/theme';

export default function RootLayout() {
  // Loading the icon font here lets the static build embed it in every page, so icons render the same
  // on the server and in the browser (no React hydration mismatch). The page never waits for it.
  useFonts(Ionicons.font);
  return (
    <LangProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
      <HelpWidget />
    </LangProvider>
  );
}
