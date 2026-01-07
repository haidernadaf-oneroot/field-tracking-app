// tasks/background-location.ts
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "@/services/api";

const BACKGROUND_LOCATION_TASK = "background-location-task";

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background task error:", error);
    return;
  }
  if (!data) return;

  const { locations } = data as { locations: Location.LocationObject[] };
  const location = locations[0];

  try {
    const taskId = await AsyncStorage.getItem("activeTaskId");
    if (!taskId) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      return;
    }

    await apiFetch("/api/tracking", {
      method: "POST",
      body: JSON.stringify({
        taskId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }),
    });
  } catch (err) {
    console.log("Send location failed:", err);
  }
});

// NO export here! Just define the task
