// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { useState } from "react";
// import { router } from "expo-router";

// const API_URL = process.env.EXPO_PUBLIC_API_URL;

// export default function Register() {
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async () => {
//     if (!name || !phone) {
//       Alert.alert("Error", "Please fill all fields");
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await fetch(`${API_URL}/api/users`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name,
//           phone,
//           role: "field",
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || "Registration failed");
//       }

//       Alert.alert("Success", "Account created successfully", [
//         {
//           text: "Login",
//           onPress: () => router.replace("/(auth)/login"),
//         },
//       ]);
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Create Account</Text>

//       <TextInput
//         placeholder="Name"
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//       />

//       <TextInput
//         placeholder="Phone Number"
//         keyboardType="number-pad"
//         style={styles.input}
//         value={phone}
//         onChangeText={setPhone}
//       />

//       <TouchableOpacity
//         style={[styles.btn, loading && { opacity: 0.6 }]}
//         onPress={handleRegister}
//         disabled={loading}
//       >
//         <Text style={styles.btnText}>
//           {loading ? "Creating..." : "Register"}
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
//         <Text style={styles.link}>Already have an account? Login</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", padding: 24 },
//   title: { fontSize: 24, fontWeight: "700", marginBottom: 20 },
//   input: {
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 16,
//   },
//   btn: {
//     backgroundColor: "#16a34a",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   btnText: { color: "#fff", fontWeight: "600" },
//   link: {
//     marginTop: 16,
//     color: "#2563eb",
//     textAlign: "center",
//   },
// });

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name");
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 10-digit phone number"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          role: "field",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      Alert.alert("Success 🎉", "Your account has been created successfully!", [
        {
          text: "Go to Login",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (err: any) {
      Alert.alert("Registration Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf-outline" size={48} color="#16a34a" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join the field force team. Register with your details below
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={24}
              color="#4b5563"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="call-outline"
              size={24}
              color="#4b5563"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="Phone Number"
              keyboardType="number-pad"
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
              editable={!loading}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Register</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.link}>Login here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    marginTop: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 18,
    color: "#1f2937",
  },
  btn: {
    backgroundColor: "#16a34a",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 8,
  },
  link: {
    fontSize: 16,
    color: "#16a34a",
    fontWeight: "600",
  },
});
