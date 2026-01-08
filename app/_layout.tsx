import "../tasks/background-location"; // ✅ this actually runs the file

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="task/[id]" />
    </Stack>
  );
}
