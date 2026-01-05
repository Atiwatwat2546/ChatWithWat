import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const email = `${phone}@app.local`;
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F6F6F6" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>เข้าสู่ระบบ</Text>

        <TextInput
          placeholder="เบอร์โทร"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          placeholder="รหัสผ่าน"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity style={styles.loginButton} onPress={login}>
          <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.registerButtonText}>สมัครสมาชิก</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#140147",
  },
  input: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  loginButton: {
    backgroundColor: "#34B7F1",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 5,
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
  paddingVertical: 10, // ความสูงปุ่ม
  paddingHorizontal: 20, // ความกว้างแคบลง
  borderRadius: 25,
  alignSelf: "center", // ปุ่มอยู่ตรงกลาง
},
registerButtonText: {
  color: "black",
  fontSize: 16,
  fontWeight: "bold",
},

});
