import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api"; // Your existing helper

// Format date nicely
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    date.toDateString() ===
    new Date(now.setDate(now.getDate() - 1)).toDateString();

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Today • ${time}`;
  if (isYesterday) return `Yesterday • ${time}`;
  return date.toLocaleDateString("en-IN") + ` • ${time}`;
};

export default function SalesScreen() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      const data = await apiFetch("/api/sales/my");
      // Sort newest first
      const sorted = data.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSales(sorted);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = sales.reduce((sum, sale) => sum + sale.grandTotal, 0);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f0fdf4" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#166534" />
          <Text style={{ marginTop: 12, color: "#64748b" }}>
            Loading sales...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (sales.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f0fdf4" }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Sales History</Text>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Earnings</Text>
              <Text style={styles.totalAmount}>₹0</Text>
            </View>
          </View>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="receipt-outline" size={60} color="#cbd5e1" />
            <Text style={{ marginTop: 16, fontSize: 18, color: "#64748b" }}>
              No sales recorded yet
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0fdf4" }}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Sales History</Text>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.totalAmount}>
              ₹{totalEarnings.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* SALES LIST */}
        <FlatList
          data={sales}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isExpanded = expandedId === item._id;
            const productCount = item.products.length;
            const showMoreCount = productCount - 1;

            // Use first product for main display
            const mainProduct = item.products[0];

            return (
              <View style={styles.saleCard}>
                {/* MAIN ROW */}
                <TouchableOpacity
                  style={styles.mainRow}
                  onPress={() => toggleExpand(item._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.mainProductRow}>
                    {/* Placeholder image since we don't have real images yet */}
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="leaf-outline" size={28} color="#86efac" />
                    </View>

                    <View style={styles.mainInfo}>
                      <Text style={styles.customerName}>
                        {item.customerName || "Customer"}
                      </Text>
                      <Text style={styles.mainProductName}>
                        {mainProduct.product}
                        {showMoreCount > 0 && (
                          <Text style={styles.moreText}>
                            {" + "}
                            {showMoreCount} more
                          </Text>
                        )}
                      </Text>
                    </View>

                    <View style={styles.rightSection}>
                      <Text style={styles.amount}>
                        ₹{item.grandTotal.toLocaleString("en-IN")}
                      </Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#64748b"
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* EXPANDED PRODUCTS */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    {item.products.slice(1).map((prod: any, idx: number) => (
                      <View key={idx} style={styles.expandedProductRow}>
                        <View style={styles.smallProductImagePlaceholder}>
                          <Ionicons
                            name="leaf-outline"
                            size={22}
                            color="#86efac"
                          />
                        </View>
                        <View style={styles.expandedProductInfo}>
                          <Text style={styles.expandedProductName}>
                            {prod.product}
                          </Text>
                          <Text style={styles.expandedDetails}>
                            {prod.crop} • Qty: {prod.qty}
                          </Text>
                        </View>
                        <Text style={styles.expandedAmount}>
                          ₹{prod.total.toLocaleString("en-IN")}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* FOOTER */}
                <View style={styles.footerRow}>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                  <View
                    style={[
                      styles.paymentBadge,
                      item.paymentType === "cash"
                        ? styles.cashBadge
                        : styles.onlineBadge,
                    ]}
                  >
                    <Text style={styles.paymentText}>
                      {item.paymentType === "cash" ? "Cash" : "Online"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
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
  totalLabel: { fontSize: 15, color: "#525252" },
  totalAmount: { fontSize: 20, fontWeight: "700", color: "#166534" },

  listContent: { padding: 16, paddingTop: 8 },
  separator: { height: 12 },

  saleCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  mainRow: {
    marginBottom: 12,
  },
  mainProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  productImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  mainInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  mainProductName: {
    fontSize: 15,
    color: "#1e293b",
    marginTop: 2,
  },
  moreText: {
    color: "#64748b",
    fontWeight: "500",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },

  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  expandedProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  smallProductImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedProductInfo: {
    flex: 1,
  },
  expandedProductName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  expandedDetails: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  expandedAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  date: {
    fontSize: 13,
    color: "#64748b",
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashBadge: { backgroundColor: "#dcfce7" },
  onlineBadge: { backgroundColor: "#f0fdf4" },
  paymentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
  },
});
