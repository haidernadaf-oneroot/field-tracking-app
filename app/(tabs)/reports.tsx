import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0fdf4" }}>
      <View style={styles.container}>
        {/* SIMPLE HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Report</Text>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Sales</Text>
            <Text style={styles.totalAmount}>₹68,000</Text>
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
            <Text style={styles.metricValue}>6</Text>
            <Text style={styles.metricLabel}>Tasks Completed</Text>
          </View>

          {/* Locations Visited */}
          <View style={styles.metricCard}>
            <Ionicons name="location-outline" size={28} color="#4d7c0f" />
            <Text style={styles.metricValue}>4</Text>
            <Text style={styles.metricLabel}>Locations Visited</Text>
          </View>

          {/* Total Sales (already shown in header, so smaller card) */}
          <View style={[styles.metricCard, styles.salesCard]}>
            <MaterialIcons name="trending-up" size={28} color="#166534" />
            <Text style={styles.metricValueSmall}>₹68K</Text>
            <Text style={styles.metricLabel}>Today</Text>
          </View>
        </View>

        {/* PLACEHOLDER FOR FUTURE */}
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
    backgroundColor: "#f0fdf4", // Soft green background
  },

  // Header (same pattern as SalesScreen)
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

  // Metrics (same card style as HomeScreen summary)
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
    backgroundColor: "#f0fdf4", // Light green tint for sales
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
