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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { showNotification } from "../notifications";

export default function RegisterScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // 🔐 ขอ OTP
  const requestOtp = () => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generatedOtp);

    showNotification("🔐 OTP", `รหัส OTP คือ ${generatedOtp}`);

    Alert.prompt(
      "ยืนยัน OTP",
      "กรอกรหัส OTP ที่ได้รับ",
      (input) => {
        if (input === generatedOtp) {
          setOtpVerified(true);
          Alert.alert("ยืนยันเบอร์สำเร็จ");
        } else {
          Alert.alert("OTP ไม่ถูกต้อง");
        }
      },
      "plain-text"
    );
  };

  const register = async () => {
    if (!phone || !name || !password || !confirmPassword) {
      Alert.alert("กรอกข้อมูลให้ครบ");
      return;
    }
    if (!otpVerified) {
      Alert.alert("กรุณายืนยัน OTP ก่อน");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    try {
      const email = `${phone}@app.local`;
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        phone,
        name,
        createdAt: Date.now(),
      });
      Alert.alert("สมัครสำเร็จ");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert(err.message);
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
        <Text style={styles.title}>สมัครสมาชิก</Text>

        <TextInput
          placeholder="เบอร์โทร"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        {phone.length >= 9 && !otpVerified && (
          <TouchableOpacity style={styles.otpButton} onPress={requestOtp}>
            <Text style={styles.otpButtonText}>ขอ OTP</Text>
          </TouchableOpacity>
        )}

        {otpVerified && <Text style={styles.verifiedText}>✔ ยืนยันเบอร์แล้ว</Text>}

        <TextInput
          placeholder="ชื่อ"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {/* รหัสผ่าน */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="รหัสผ่าน"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={styles.inputWithIcon}
          />
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {/* ยืนยันรหัสผ่าน */}
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="ยืนยันรหัสผ่าน"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.inputWithIcon}
          />
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text>{showConfirmPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity style={styles.registerButton} onPress={register}>
          <Text style={styles.registerButtonText}>สมัครสมาชิก</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginLinkText}>ไปหน้าเข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 40, textAlign: "center", color: "#140147" },
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
  inputWrapper: {
  position: "relative",
  marginBottom: 20,
},

inputWithIcon: {
  backgroundColor: "#FFF",
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 25,
  fontSize: 16,
  borderWidth: 1,
  borderColor: "#DDD",
  paddingRight: 45, // เว้นช่องให้ไอคอนอยู่ขวา
},

iconRight: {
  position: "absolute",
  right: 15,
  top: "50%",
  transform: [{ translateY: -12 }], // กึ่งกลางกล่อง
},
  otpButton: { backgroundColor: "#34B7F1", paddingVertical: 12, borderRadius: 25, alignItems: "center", marginBottom: 15 },
  otpButtonText: { color: "white", fontWeight: "bold" },
  verifiedText: { color: "green", marginBottom: 15, fontWeight: "bold" },
  registerButton: { backgroundColor: "#34B7F1", paddingVertical: 14, borderRadius: 25, alignItems: "center", marginBottom: 15 },
  registerButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  loginLink: { alignItems: "center", paddingVertical: 14 },
  loginLinkText: { color: "#34B7F1", fontSize: 16, fontWeight: "bold" },
  passwordContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  eye: { marginLeft: 10, fontSize: 18 },
});
