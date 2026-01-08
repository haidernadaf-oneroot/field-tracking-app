import type {} from "../tasks/background-location";

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
