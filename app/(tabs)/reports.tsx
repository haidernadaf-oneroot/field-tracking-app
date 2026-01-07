// app/reports.tsx
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";

export default function ReportsScreen() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyReport();
  }, []);

  const loadDailyReport = async () => {
    try {
      const data = await apiFetch("/api/reports/daily");
      setReport(data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f0fdf4" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#166534" />
          <Text style={{ marginTop: 12, color: "#64748b" }}>
            Loading report...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSales = report?.totalSalesToday || 0;
  const tasksCompleted = report?.completedTasksToday || 0;
  const locationsVisited = report?.locationsVisitedToday || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0fdf4" }}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Report</Text>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Sales Today</Text>
            <Text style={styles.totalAmount}>
              ₹{totalSales.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* METRICS GRID */}
        <View style={styles.metricsGrid}>
          {/* Tasks Completed */}
          <View style={styles.metricCard}>
            <MaterialIcons
              name="check-circle-outline"
              size={28}
              color="#4d7c0f"
            />
            <Text style={styles.metricValue}>{tasksCompleted}</Text>
            <Text style={styles.metricLabel}>Tasks Completed</Text>
          </View>

          {/* Locations Visited */}
          <View style={styles.metricCard}>
            <Ionicons name="location-outline" size={28} color="#4d7c0f" />
            <Text style={styles.metricValue}>{locationsVisited}</Text>
            <Text style={styles.metricLabel}>Locations Visited</Text>
          </View>

          {/* Total Sales Small Card */}
          <View style={[styles.metricCard, styles.salesCard]}>
            <MaterialIcons name="trending-up" size={28} color="#166534" />
            <Text style={styles.metricValueSmall}>
              ₹
              {totalSales > 999
                ? (totalSales / 1000).toFixed(1) + "K"
                : totalSales}
            </Text>
            <Text style={styles.metricLabel}>Today</Text>
          </View>
        </View>

        {/* FUTURE PLACEHOLDER */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Weekly & Monthly reports coming soon
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 15,
    color: "#64748b",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#166534",
  },
  metricsGrid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  metricCard: {
    backgroundColor: "#fff",
    flex: 1,
    minWidth: 110,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  salesCard: {
    backgroundColor: "#f0fdf4",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginVertical: 8,
  },
  metricValueSmall: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#a3a3a3",
    textAlign: "center",
  },
});
