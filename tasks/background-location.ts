import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "@/services/api";

const BACKGROUND_LOCATION_TASK = "background-location-task";

// ✅ This log tells you the file is loaded when app starts
console.log("✅ Background location task file LOADED");

// ✅ Check if task already defined (prevents Fast Refresh crash)
if (!TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK)) {
  console.log("✅ Registering background location task...");

  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    console.log("📍 Background location task TRIGGERED");

    if (error) {
      console.error("❌ Background task error:", error);
      return;
    }

    if (!data) {
      console.log("⚠️ No data in background task");
      return;
    }

    const { locations } = data as {
      locations: Location.LocationObject[];
    };

    const location = locations?.[0];
    if (!location) {
      console.log("⚠️ No location object");
      return;
    }

    try {
      const taskId = await AsyncStorage.getItem("activeTaskId");

      if (!taskId) {
        console.log("🛑 No active taskId found, stopping tracking");

        const isRunning = await Location.hasStartedLocationUpdatesAsync(
          BACKGROUND_LOCATION_TASK
        );

        if (isRunning) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
          console.log("🛑 Background tracking stopped");
        }

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

      console.log(
        "✅ Location sent:",
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (err) {
      console.log("❌ Send location failed:", err);
    }
  });
} else {
  console.log("ℹ️ Background task already registered");
}
