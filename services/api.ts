import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const apiFetch = async (url: string, options: any = {}) => {
  const token = await AsyncStorage.getItem("token");

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  // 👇 important to avoid JSON error when backend sends HTML
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Server error. Check API URL.");
  }

  if (!res.ok) throw new Error(data.message || "API Error");

  return data;
};
