import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, serverTimestamp } from 'firebase/firestore';

export default function MapScreen() {
  const [myLocation, setMyLocation] = useState(null);
  const [otherLocations, setOtherLocations] = useState([]);

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
    <MapView
      style={{ flex: 1 }}
      region={{
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
        pinColor="green"
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
          pinColor="blue"
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
