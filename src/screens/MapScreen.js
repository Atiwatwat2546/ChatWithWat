import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, serverTimestamp, getDoc } from 'firebase/firestore';

export default function MapScreen() {
  const [myLocation, setMyLocation] = useState(null);
  const [otherLocations, setOtherLocations] = useState([]);

  const mapRef = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();
  const [selectedUid, setSelectedUid] = useState(null);

  // ฟังก์ชันช่วยสำหรับซูมแบบค่อยๆ (ทำเป็นหลายขั้น) เพื่อให้รู้สึกเป็นอนิเมชันนุ่มนวล
  const animateZoom = (target, steps = 6, finalDelta = 0.002, duration = 900) => {
    if (!mapRef.current || !target) return Promise.resolve();
    const startDelta = 0.02;
    const deltas = [];
    for (let i = 0; i < steps; i++) {
      deltas.push(startDelta - (startDelta - finalDelta) * ((i + 1) / steps));
    }
    const stepDuration = Math.max(40, Math.floor(duration / steps));

    return new Promise((resolve) => {
      let i = 0;
      const step = () => {
        if (i >= deltas.length) {
          resolve();
          return;
        }
        mapRef.current.animateToRegion(
          {
            latitude: target.latitude,
            longitude: target.longitude,
            latitudeDelta: deltas[i],
            longitudeDelta: deltas[i],
          },
          stepDuration
        );
        i++;
        setTimeout(step, stepDuration);
      };
      step();
    });
  };

  // ถ้ามีการส่ง targetUid มาทาง navigation (จาก MessageScreen) ให้ซูมไปตำแหน่งนั้น
  useEffect(() => {
    const targetUid = route.params?.targetUid;
    if (!targetUid) return;

    (async () => {
      let targetLoc = null;
      if (targetUid === auth.currentUser.uid) {
        targetLoc = myLocation;
      } else {
        const found = otherLocations.find((o) => o.uid === targetUid);
        if (found) {
          targetLoc = { latitude: found.latitude, longitude: found.longitude };
        } else {
          const snap = await getDoc(doc(db, 'locations', targetUid));
          if (snap.exists()) {
            const d = snap.data();
            targetLoc = { latitude: d.latitude, longitude: d.longitude };
          }
        }
      }

      if (targetLoc) {
        // ใช้ animateZoom เพื่อได้การซูมแบบค่อยๆ
        await animateZoom(targetLoc, 6, 0.002, 900);
        setSelectedUid(targetUid);
        setTimeout(() => setSelectedUid(null), 4000);
      }

      // ล้าง param หลังใช้แล้ว เพื่อไม่ให้ซูมซ้ำโดยไม่จำเป็น
      navigation.setParams({ targetUid: null });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.targetUid, myLocation, otherLocations]);

  // 📍 ขอ location + update ของตัวเอง
  useEffect(() => {
    let sub;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission denied');
        return;
      }

      sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        async (loc) => {
          const { latitude, longitude } = loc.coords;

          setMyLocation({ latitude, longitude });

          await setDoc(
            doc(db, 'locations', auth.currentUser.uid),
            {
              latitude,
              longitude,
              name: auth.currentUser.email,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      );
    })();

    return () => sub && sub.remove();
  }, []);

  // 👥 realtime location คนอื่น
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'locations'), (snap) => {
      const others = [];

      snap.forEach((d) => {
        if (d.id !== auth.currentUser.uid) {
          others.push({ uid: d.id, ...d.data() });
        }
      });

      setOtherLocations(others);
    });

    return unsub;
  }, []);

  if (!myLocation) {
    return (
      <View style={styles.center}>
        <Text>กำลังโหลดแผนที่...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        ref={mapRef}
        initialRegion={{
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* ตัวเรา */}
        <Marker
          coordinate={myLocation}
          title="Me"
          pinColor={selectedUid === auth.currentUser.uid ? 'red' : 'green'}
        />

        {/* คนอื่น */}
        {otherLocations.map((u) => (
          <Marker
            key={u.uid}
            coordinate={{
              latitude: u.latitude,
              longitude: u.longitude,
            }}
            title={u.name || u.uid}
            pinColor={u.uid === selectedUid ? 'red' : 'blue'}
          />
        ))}
      </MapView>

      {/* ปุ่มเลื่อนไปตำแหน่งตัวเอง */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={async () => {
          if (!myLocation) return;
          await animateZoom(myLocation, 6, 0.002, 900);
          setSelectedUid(auth.currentUser.uid);
          setTimeout(() => setSelectedUid(null), 4000);
        }}
      >
        <Text style={styles.myLocationButtonText}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
    bottom: 28,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  myLocationButtonText: {
    fontSize: 20,
  },
});
