import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= CONFIG ================= */
const API_URL = process.env.EXPO_PUBLIC_API_URL;

/* ================= SAFE API FETCH + GET USER ID FROM TOKEN ================= */
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem("token");

  if (!token && !url.includes("/login")) {
    throw new Error("Please log in again");
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error("Invalid JSON response:", text.substring(0, 300));
    throw new Error("Server returned invalid response");
  }

  if (!res.ok) {
    const errorMsg = data.message || data.error || `HTTP ${res.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// Get user ID from JWT token
export const getCurrentUserId = async (): Promise<string> => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload._id || payload.id || payload.userId;
    if (!userId) throw new Error("User ID not found in token");
    return userId;
  } catch (e) {
    throw new Error("Invalid token. Please log in again.");
  }
};

/* ================= HOME SCREEN ================= */
export default function HomeScreen() {
  const trackingIntervalRef = useRef<number | null>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [cropName, setCropName] = useState("");
  const [locationName, setLocationName] = useState("");

  useEffect(() => {
    loadTasks();

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  const loadTasks = async () => {
    try {
      const data = await apiFetch("/api/tasks");
      console.log("Loaded tasks:", data);
      setTasks(data || []);
    } catch (err: any) {
      console.error("Failed to load tasks:", err.message);
      Alert.alert("Error", err.message || "Failed to load tasks");
    }
  };

  // const startTracking = async (taskId: string) => {
  //   console.log("Starting tracking for task:", taskId);

  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       Alert.alert(
  //         "Permission Required",
  //         "Location access is needed to track visits."
  //       );
  //       return;
  //     }

  //     const loc = await Location.getCurrentPositionAsync({
  //       accuracy: Location.Accuracy.High,
  //     });

  //     await apiFetch("/api/tracking", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         taskId,
  //         latitude: loc.coords.latitude,
  //         longitude: loc.coords.longitude,
  //       }),
  //     });

  //     if (trackingIntervalRef.current) {
  //       clearInterval(trackingIntervalRef.current);
  //     }

  //     trackingIntervalRef.current = setInterval(async () => {
  //       try {
  //         const updateLoc = await Location.getCurrentPositionAsync({
  //           accuracy: Location.Accuracy.Balanced,
  //         });
  //         await apiFetch("/api/tracking", {
  //           method: "POST",
  //           body: JSON.stringify({
  //             taskId,
  //             latitude: updateLoc.coords.latitude,
  //             longitude: updateLoc.coords.longitude,
  //           }),
  //         });
  //       } catch (e) {
  //         console.log("Background tracking failed:", e);
  //       }
  //     }, 5 * 1000);

  //     // Correct navigation
  //     router.push({
  //       pathname: "/task/[id]",
  //       params: { id: taskId },
  //     });
  //   } catch (err: any) {
  //     Alert.alert("Error", err.message || "Failed to start tracking");
  //   }
  // };
  const startTracking = async (taskId: string) => {
    console.log("🚀 Starting tracking for task:", taskId);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Location access is needed.");
        return;
      }

      // Optional: Send first location immediately
      const { coords } = await Location.getCurrentPositionAsync({});
      await apiFetch("/api/tracking", {
        method: "POST",
        body: JSON.stringify({
          taskId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });

      // Save active task
      await AsyncStorage.setItem("activeTaskId", taskId);

      // Start background updates
      await Location.startLocationUpdatesAsync("background-location-task", {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000, // Every 5 seconds
        distanceInterval: 5, // Or every 5 meters
        foregroundService: {
          notificationTitle: "Field Visit Active",
          notificationBody: "Tracking your location for task",
          killServiceOnDestroy: true,
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });

      // Navigate to task details
      router.navigate({
        pathname: "/task/[id]",
        params: { id: taskId },
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to start tracking");
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim() || !cropName.trim() || !locationName.trim()) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    try {
      const userId = await getCurrentUserId();

      const newTask = await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: taskTitle.trim(),
          crop: cropName.trim(),
          locationName: locationName.trim(),
          assignedTo: userId,
        }),
      });

      console.log("New task created:", newTask);

      // Safe add
      setTasks((prev) => {
        if (newTask?._id) {
          return [newTask, ...prev];
        }
        return prev;
      });

      // Fallback reload
      if (!newTask?._id) {
        loadTasks();
      }

      setTaskTitle("");
      setCropName("");
      setLocationName("");
      setModalVisible(false);

      Alert.alert("Success", "New task created!");
    } catch (err: any) {
      console.error("Create task error:", err.message);
      Alert.alert("Error", err.message || "Failed to create task");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View style={styles.avatar}>
                <Image
                  source={require("../../assets/images/avatar.jpg")}
                  style={styles.avatarImage}
                />
              </View>
              <View>
                <Text style={styles.greeting}>Hi 👋</Text>
                <Text style={styles.date}>Tuesday, January 6</Text>
              </View>
            </View>
            <View style={styles.weatherChip}>
              <Ionicons name="partly-sunny-outline" size={18} color="#2563eb" />
              <Text style={styles.weatherText}>28°C</Text>
            </View>
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Today’s Summary</Text>
            <TouchableOpacity
              style={styles.addTaskBtn}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addTaskText}>Add Task</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialIcons name="assignment" size={24} color="#4d7c0f" />
              <Text style={styles.summaryValue}>{tasks.length}</Text>
              <Text style={styles.summaryLabel}>Tasks Assigned</Text>
            </View>
            <View style={styles.summaryItem}>
              <MaterialIcons name="trending-up" size={24} color="#166534" />
              <Text style={styles.summaryValue}>₹0</Text>
              <Text style={styles.summaryLabel}>Today's Sales</Text>
            </View>
          </View>
        </View>

        {/* TASKS */}
        <View style={styles.taskSection}>
          <Text style={styles.sectionTitle}>Pending Tasks</Text>

          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tasks yet. Create one!</Text>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item, index) =>
                item._id?.toString() || `task-${index}`
              }
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.taskCard}
                  onPress={() => startTracking(item._id)}
                >
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>
                      {item.title || "Untitled Task"}
                    </Text>
                    <Text style={styles.taskCrop}>
                      Crop: {item.crop || "N/A"}
                    </Text>
                    <Text style={styles.taskLocation}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#64748b"
                      />{" "}
                      {item.locationName || "Unknown"}
                    </Text>
                  </View>
                  <View style={styles.startButton}>
                    <Text style={styles.startText}>Start</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color="#fff"
                      style={{ marginLeft: 6 }}
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Task</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Task Title"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Crop Name"
              value={cropName}
              onChangeText={setCropName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Location/Village Name"
              value={locationName}
              onChangeText={setLocationName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={handleAddTask}
              >
                <Text style={styles.createText}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES (UNCHANGED) ================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0fdf4" },
  container: { flex: 1, padding: 16 },
  header: { marginBottom: 20 },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#bbf7d0",
  },
  avatarImage: { width: "100%", height: "100%" },
  greeting: { fontSize: 24, fontWeight: "700", color: "#166534" },
  date: { color: "#64748b", fontSize: 15 },
  weatherChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  weatherText: { fontWeight: "700", color: "#2563eb" },
  summaryContainer: { marginBottom: 24 },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 19, fontWeight: "700", color: "#1e293b" },
  addTaskBtn: {
    flexDirection: "row",
    backgroundColor: "#4d7c0f",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
  },
  addTaskText: { color: "#fff", fontWeight: "600" },
  summaryRow: { flexDirection: "row", gap: 14 },
  summaryItem: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#166534",
    marginVertical: 8,
  },
  summaryLabel: { color: "#64748b", fontSize: 14 },
  taskSection: { flex: 1 },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: { fontSize: 16, color: "#64748b" },
  taskCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: "600", color: "#1e293b" },
  taskCrop: { fontSize: 14, color: "#4d7c0f", marginTop: 4, fontWeight: "500" },
  taskLocation: { color: "#64748b", marginTop: 6, fontSize: 14 },
  startButton: {
    backgroundColor: "#4d7c0f",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  startText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "92%",
    padding: 24,
    borderRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  modalInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    marginBottom: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 14,
    marginTop: 10,
  },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 12 },
  cancelText: { color: "#64748b", fontWeight: "600", fontSize: 16 },
  createBtn: {
    backgroundColor: "#4d7c0f",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
