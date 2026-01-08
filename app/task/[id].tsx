import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useState, useRef } from "react";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= IMPORT API HELPER ================= */
import { apiFetch } from "@/services/api";

/* ================= PRODUCTS (keep images for UI) ================= */
const CROP_PRODUCTS: any = {
  Turmeric: [
    {
      id: "t1",
      name: "Rhizome Guard",
      price: 150,
      image: require("../../assets/images/product1.jpg"),
    },
    {
      id: "t2",
      name: "Curcuma Boost",
      price: 220,
      image: require("../../assets/images/product2.jpg"),
    },
  ],
  "Tender Coconut": [
    {
      id: "tc1",
      name: "Nutri Palm Liquid",
      price: 120,
      image: require("../../assets/images/product2.jpg"),
    },
    {
      id: "tc2",
      name: "Coco Yield Max",
      price: 200,
      image: require("../../assets/images/product4.jpg"),
    },
  ],
  Maize: [
    {
      id: "m1",
      name: "Maize Power Granules",
      price: 140,
      image: require("../../assets/images/product2.jpg"),
    },
    {
      id: "m2",
      name: "Leaf Growth Activator",
      price: 155,
      image: require("../../assets/images/product1.jpg"),
    },
  ],
  Coconut: [
    {
      id: "c1",
      name: "Palm Nutrient Mix",
      price: 210,
      image: require("../../assets/images/product4.jpg"),
    },
    {
      id: "c2",
      name: "Root Strength Plus",
      price: 230,
      image: require("../../assets/images/product1.jpg"),
    },
  ],
};

export default function TaskDetails() {
  const params = useLocalSearchParams();
  const taskId = params.id as string;

  // Debug log
  useEffect(() => {
    console.log("TaskDetails opened");
    console.log("All params:", params);
    console.log("taskId:", taskId);

    if (!taskId) {
      Alert.alert("Error", "Task not found. Returning to home.");
      router.back();
    }
  }, [params]);

  const [coords, setCoords] = useState<any>(null);
  const [stoppedLocation, setStoppedLocation] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [crop, setCrop] = useState("Turmeric");
  const [items, setItems] = useState<any[]>([
    { product: "", price: 0, qty: "" },
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  /* ================= GET START LOCATION ================= */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "Location access required.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  /* ================= STOP LOCATION ================= */
  // const stopLocation = async () => {
  //   if (!taskId) {
  //     Alert.alert("Error", "Task ID missing");
  //     return;
  //   }

  //   try {
  //     const loc = await Location.getCurrentPositionAsync({});

  //     setStoppedLocation({
  //       latitude: loc.coords.latitude,
  //       longitude: loc.coords.longitude,
  //     });

  //     await apiFetch(`/api/tasks/${taskId}/stop`, {
  //       method: "PATCH",
  //       body: JSON.stringify({
  //         latitude: loc.coords.latitude,
  //         longitude: loc.coords.longitude,
  //       }),
  //     });

  //     Alert.alert("Success", "Stop location saved");
  //   } catch (e: any) {
  //     Alert.alert("Error", e.message || "Failed to save stop location");
  //   }
  // };
  // const stopLocation = async () => {
  //   if (!taskId) {
  //     Alert.alert("Error", "Task ID missing");
  //     return;
  //   }

  //   try {
  //     // 1. Get final location
  //     const loc = await Location.getCurrentPositionAsync({});

  //     setStoppedLocation({
  //       latitude: loc.coords.latitude,
  //       longitude: loc.coords.longitude,
  //     });

  //     // 2. Update task with stop location
  //     await apiFetch(`/api/tasks/${taskId}/stop`, {
  //       method: "PATCH",
  //       body: JSON.stringify({
  //         latitude: loc.coords.latitude,
  //         longitude: loc.coords.longitude,
  //       }),
  //     });

  //     // 3. STOP BACKGROUND TRACKING
  //     await Location.stopLocationUpdatesAsync("background-location-task");
  //     await AsyncStorage.removeItem("activeTaskId");

  //     console.log("🛑 Background tracking stopped");

  //     Alert.alert("Success", "Stop location saved & tracking stopped");
  //   } catch (e: any) {
  //     console.error("Stop location error:", e);
  //     Alert.alert("Error", e.message || "Failed to save stop location");
  //   }
  // };

  const stopLocation = async () => {
    if (!taskId) return Alert.alert("Error", "Task ID missing");

    try {
      const loc = await Location.getCurrentPositionAsync({});

      setStoppedLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      await apiFetch(`/api/tasks/${taskId}/stop`, {
        method: "PATCH",
        body: JSON.stringify({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }),
      });

      Alert.alert("Success", "Stop location saved");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save stop location");
    }
  };

  /* ================= IMAGE PICK ================= */
  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert("Limit", "Max 4 photos allowed.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!res.canceled) {
      setImages([...images, res.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  /* ================= PRODUCT HANDLING ================= */
  const addProduct = () => {
    setItems([...items, { product: "", price: 0, qty: "" }]);
  };

  const removeProduct = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const grandTotal = items.reduce(
    (sum, i) => sum + Number(i.qty || 0) * Number(i.price || 0),
    0
  );

  /* ================= SAVE SALE + UPLOAD IMAGES (FIXED) ================= */
  const saveSaleAndImages = async () => {
    if (!taskId) {
      Alert.alert("Error", "Task ID missing");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Required", "Please upload at least 1 photo");
      return;
    }

    const validItems = items.filter(
      (item) => item.product && item.qty && Number(item.qty) > 0
    );

    if (validItems.length === 0) {
      Alert.alert("Required", "Please add at least one product with quantity");
      return;
    }

    setIsUploading(true);

    try {
      // Upload images
      const form = new FormData();
      images.forEach((uri, i) => {
        form.append("images", {
          uri,
          name: `sale_photo_${i}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      const token = await AsyncStorage.getItem("token");

      const uploadRes = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/upload/task/${taskId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(text || "Image upload failed");
      }

      // FIXED: Now matches backend schema exactly
      const products = validItems.map((item) => ({
        product: item.product, // ← Changed from "name" to "product"
        crop: crop, // ← Added crop type
        price: item.price,
        qty: Number(item.qty),
        total: item.price * Number(item.qty),
      }));

      await apiFetch("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          taskId,
          products,
          customerName: customerName.trim() || null,
          paymentType,
        }),
      });

      Alert.alert("Success", "Sale saved & photos uploaded!");

      // Reset form
      setImages([]);
      setItems([{ product: "", price: 0, qty: "" }]);
      setCustomerName("");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save sale");
    } finally {
      setIsUploading(false);
    }
  };

  /* ================= COMPLETE TASK ================= */
  // const completeTask = async () => {
  //   if (!taskId) {
  //     Alert.alert("Error", "Task ID missing");
  //     return;
  //   }

  //   setIsCompleting(true);

  //   try {
  //     await apiFetch(`/api/tasks/${taskId}/complete`, {
  //       method: "PATCH",
  //     });

  //     Alert.alert("Success", "Task Completed");
  //     router.back();
  //   } catch (e: any) {
  //     Alert.alert("Error", e.message || "Failed to complete task");
  //   } finally {
  //     setIsCompleting(false);
  //   }
  // };
  // const completeTask = async () => {
  //   if (!taskId) {
  //     Alert.alert("Error", "Task ID missing");
  //     return;
  //   }

  //   setIsCompleting(true);

  //   try {
  //     await apiFetch(`/api/tasks/${taskId}/complete`, {
  //       method: "PATCH",
  //     });

  //     // STOP TRACKING WHEN TASK IS DONE
  //     await Location.stopLocationUpdatesAsync("background-location-task");
  //     await AsyncStorage.removeItem("activeTaskId");

  //     Alert.alert("Success", "Task Completed");
  //     router.back();
  //   } catch (e: any) {
  //     Alert.alert("Error", e.message || "Failed to complete task");
  //   } finally {
  //     setIsCompleting(false);
  //   }
  // };
  const completeTask = async () => {
    if (!taskId) return Alert.alert("Error", "Task ID missing");

    setIsCompleting(true);

    try {
      await apiFetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
      });

      const running = await Location.hasStartedLocationUpdatesAsync(
        "background-location-task"
      );

      if (running) {
        await Location.stopLocationUpdatesAsync("background-location-task");
      }

      await AsyncStorage.removeItem("activeTaskId");

      Alert.alert("Success", "Task Completed");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to complete task");
    } finally {
      setIsCompleting(false);
    }
  };

  if (!coords) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* TASK HEADER */}
          <View style={styles.headerCard}>
            <Text style={styles.farmerName}>Haider</Text>
            <Text style={styles.taskType}>Visit Farmer - Turmeric</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>

          {/* MAP */}
          <View style={styles.mapCard}>
            <MapView style={StyleSheet.absoluteFillObject} region={coords}>
              <Marker coordinate={coords} title="Start" />
              {stoppedLocation && (
                <Marker
                  coordinate={stoppedLocation}
                  title="Stop"
                  pinColor="green"
                />
              )}
            </MapView>
            <TouchableOpacity style={styles.stopBtn} onPress={stopLocation}>
              <Ionicons name="location" size={18} color="#fff" />
              <Text style={styles.stopBtnText}>Stop Location</Text>
            </TouchableOpacity>
          </View>

          {/* FIELD PHOTOS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              Field Photos ({images.length}/4)
            </Text>
            <View style={styles.imageGrid}>
              {images.map((uri, i) => (
                <View key={i} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeImage(i)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 4 && (
                <TouchableOpacity
                  style={styles.addPhotoBtn}
                  onPress={pickImage}
                >
                  <Ionicons name="camera-outline" size={28} color="#64748b" />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* SALE ENTRY */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Record Sale</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Crop Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={crop}
                  onValueChange={(val) => setCrop(val)}
                >
                  {Object.keys(CROP_PRODUCTS).map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
            </View>

            {items.map((item, index) => (
              <View key={index} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productIndex}>Product {index + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity onPress={() => removeProduct(index)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={item.product}
                    onValueChange={(val) => {
                      const prod = CROP_PRODUCTS[crop].find(
                        (p: any) => p.name === val
                      );
                      const updated = [...items];
                      updated[index] = {
                        ...updated[index],
                        product: val,
                        price: prod?.price || 0,
                      };
                      setItems(updated);
                    }}
                  >
                    <Picker.Item label="Select Product" value="" />
                    {CROP_PRODUCTS[crop].map((p: any) => (
                      <Picker.Item
                        key={p.id}
                        label={`${p.name} (₹${p.price})`}
                        value={p.name}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.qtyPriceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Quantity</Text>
                    <TextInput
                      placeholder="e.g. 5"
                      keyboardType="number-pad"
                      value={item.qty}
                      onChangeText={(val) => {
                        const updated = [...items];
                        updated[index].qty = val;
                        setItems(updated);
                      }}
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.priceInfo}>
                    <Text style={styles.label}>Unit Price</Text>
                    <Text style={styles.priceText}>₹{item.price}</Text>
                  </View>
                  <View style={styles.totalInfo}>
                    <Text style={styles.label}>Total</Text>
                    <Text style={styles.totalText}>
                      ₹{Number(item.qty || 0) * item.price}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addProductBtn} onPress={addProduct}>
              <Ionicons name="add-circle-outline" size={18} color="#4d7c0f" />
              <Text style={styles.addProductText}>Add Another Product</Text>
            </TouchableOpacity>

            <View style={styles.grandTotalCard}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalAmount}>₹{grandTotal}</Text>
            </View>

            <TextInput
              placeholder="Customer Name (Optional)"
              value={customerName}
              onChangeText={setCustomerName}
              style={styles.Customerinput}
            />

            <View style={styles.formGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={paymentType}
                  onValueChange={setPaymentType}
                >
                  <Picker.Item label="Cash" value="cash" />
                  <Picker.Item label="Online/UPI" value="online" />
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={saveSaleAndImages}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Sale Entry</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* COMPLETE TASK BUTTON */}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={completeTask}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.completeBtnText}>
                  Mark Task as Completed
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ================= STYLES — 100% UNCHANGED ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
  },
  loadingText: { fontSize: 16, color: "#64748b" },

  headerCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  farmerName: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  taskType: { fontSize: 15, color: "#64748b", marginTop: 4 },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#fefce8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  statusText: { fontSize: 13, color: "#a16207", fontWeight: "600" },

  mapCard: {
    height: 220,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  stopBtn: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    backgroundColor: "#ef4444",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  stopBtnText: { color: "#fff", fontWeight: "600" },

  sectionCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },

  imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  imageWrapper: { position: "relative" },
  uploadedImage: { width: 90, height: 90, borderRadius: 10 },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#ef4444",
    borderRadius: 15,
    padding: 2,
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  addPhotoText: { marginTop: 6, fontSize: 13, color: "#64748b" },

  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: "#64748b", marginBottom: 6 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  productCard: {
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  productIndex: { fontWeight: "600", color: "#1e293b" },

  qtyPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    width: 100,
    textAlign: "center",
  },

  Customerinput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    width: 200,
    textAlign: "center",
    marginBottom: 16,
  },
  priceInfo: { alignItems: "center" },
  priceText: { fontSize: 17, fontWeight: "600", color: "#4d7c0f" },
  totalInfo: { alignItems: "flex-end" },
  totalText: { fontSize: 17, fontWeight: "700", color: "#166534" },

  addProductBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  addProductText: { color: "#4d7c0f", fontWeight: "600", marginLeft: 6 },

  grandTotalCard: {
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginVertical: 16,
  },
  grandTotalLabel: { fontSize: 16, fontWeight: "600", color: "#166534" },
  grandTotalAmount: { fontSize: 22, fontWeight: "800", color: "#166534" },

  saveBtn: {
    backgroundColor: "#4d7c0f",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  completeBtn: {
    backgroundColor: "#166534",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  completeBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
