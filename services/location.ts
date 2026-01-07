import * as Location from "expo-location";

export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Location permission is required");
    return null;
  }

  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
}
