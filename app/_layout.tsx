import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HelpWidget } from '../src/components/HelpWidget';
import { LangProvider } from '../src/i18n';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <LangProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
      <HelpWidget />
    </LangProvider>
  );
}
