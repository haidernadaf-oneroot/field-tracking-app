import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const Explore = () => {
  const router = useRouter(); // ✅ router for navigation

  const handleLogout = () => {
    // later you can also clear token here
    // await AsyncStorage.removeItem("token");

    router.replace("/(auth)/register"); // ✅ go to register page
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* PROFILE HEADER */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/images/avatar.jpg")}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          {/* Name & Role */}
          <Text style={styles.name}>Haider</Text>
          <Text style={styles.role}>Field Sales Executive</Text>

          {/* Weather Status */}
          <View style={styles.weatherBadge}>
            <Ionicons name="partly-sunny-outline" size={18} color="#2563eb" />
            <Text style={styles.weatherText}>28°C • Sunny</Text>
          </View>
        </View>

        {/* STATS GRID */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#4d7c0f"
            />
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color="#166534" />
            <Text style={styles.statValue}>₹68K</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="location-outline" size={24} color="#4d7c0f" />
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Locations Visited</Text>
          </View>
        </View>

        {/* INFO SECTION */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Last Active Location</Text>
              <Text style={styles.infoValue}>Green Market, Bengaluru</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Working Hours</Text>
              <Text style={styles.infoValue}>09:30 AM – 06:30 PM</Text>
            </View>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  container: {
    flex: 1,
    padding: 16,
  },

  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  weatherText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e40af",
  },

  profileHeader: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },

  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  role: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 4,
  },

  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
  },

  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 2,
  },

  logoutBtn: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "600",
  },
});
