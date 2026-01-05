import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setUserData(snap.data());
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      {/* 🔹 โปรไฟล์ */}
      <View style={styles.profileCard}>
        <Text style={styles.welcome}>ยินดีต้อนรับ</Text>
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.phone}>{userData?.phone}</Text>
      </View>

      {/* 🔹 เมนูหลัก */}
      <View style={styles.menuRow}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Messages')}
        >
          <Text style={styles.menuIcon}>💬</Text>
          <Text>แชท</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.menuIcon}>🗺</Text>
          <Text>แผนที่</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 ออกจากระบบ */}
      <TouchableOpacity
        style={styles.logout}
        onPress={() => signOut(auth)}
      >
        <Text style={{ color: 'white' }}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#dd3d3dff',
    paddingTop: 80, // <-- เพิ่มจากเดิม 20 เป็น 60 จะเลื่อนทุกอย่างลงมา
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
    // ถ้าต้องการเลื่อนเฉพาะโปรไฟล์ สามารถใช้ marginTop แทน paddingTop ของ container
    // marginTop: 20,
  },
  welcome: {
    fontSize: 18, // <-- เพิ่มจาก 16 เป็น 18
    color: '#000000ff',
  },
  name: {
    fontSize: 28, // <-- เพิ่มจาก 24 เป็น 28
    fontWeight: 'bold',
    marginVertical: 4,
    color:'#140147ff',
  },
  phone: {
    fontSize: 16, // <-- เพิ่มจากไม่มีเป็น 16
    color: '#af9f0cff',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30, // เพิ่มช่องว่างระหว่างเมนูกับ logout
  },
  menuButton: {
    backgroundColor: '#fff',
    width: '48%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  menuIcon: {
    fontSize: 50,
    marginBottom: 8,
  },
  logout: {
    marginTop: 'auto',
    backgroundColor: '#b62f2dff',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,        // <-- เพิ่มเส้นกรอบ
    borderColor: '#000000ff',
  },
});

