// app/(tabs)/products-view.tsx
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/services/api";

type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  // Optional fields for future enhancements
  discount?: string;
  ribbon?: string;
  company?: string;
  originalPrice?: number;
  saved?: number;
  size?: string;
};

export default function ProductsViewScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await apiFetch("/api/products");
      setProducts(data || []);
    } catch (err: any) {
      console.error("Load products error:", err);
      Alert.alert("Error", err.message || "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = useCallback(() => {
    loadProducts(true);
  }, []);

  const renderProduct = ({ item }: { item: Product }) => {
    // For now, since your API only has price, we'll show it as current price
    // You can later add originalPrice, discount, etc.
    const currentPrice = item.price;
    const originalPrice = item.originalPrice || null;
    const saved = originalPrice ? originalPrice - currentPrice : null;

    return (
      <View style={styles.card}>
        {/* Discount Badge - only if provided */}
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}

        {/* Product Image */}
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
          resizeMode="contain"
        />

        {/* Ribbon - Trending / High Demand */}
        {item.ribbon && (
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>{item.ribbon}</Text>
          </View>
        )}

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>

          {/* {item.company && <Text style={styles.company}>{item.company}</Text>} */}

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>₹{currentPrice}</Text>
            {originalPrice && (
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            )}
          </View>

          {saved && <Text style={styles.saved}>Saved Price ₹{saved}</Text>}

          {/* Size or Stock Info */}
          <Text style={styles.size}>
            {item.size || `Stock: ${item.quantity}`}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Featured Products</Text>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No products available</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 6,
    padding: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ff7a33",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  productImage: {
    width: "100%",
    height: 140,
    // marginTop: 10,
  },
  ribbon: {
    backgroundColor: "#ef4444",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    // marginTop: -12,
    // marginBottom: 8,
  },
  ribbonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  details: {
    // marginTop: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    minHeight: 40,
  },

  // company: {
  //   fontSize: 13,
  //   color: "#64748b",
  // },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },
  originalPrice: {
    fontSize: 14,
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  saved: {
    fontSize: 13,
    color: "#4d7c0f",
    marginTop: 4,
    fontWeight: "600",
  },
  size: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#64748b",
  },
});
