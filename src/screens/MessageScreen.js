import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { showNotification } from '../notifications';

// เปิด LayoutAnimation สำหรับ Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MessageScreen() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    let firstLoad = true;

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // ทำ Layout Animation ตอนข้อความใหม่เข้ามา
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setMessages(msgs);

      if (firstLoad) {
        firstLoad = false;
        return;
      }

      const latest = msgs[0];
      if (latest && latest.uid !== auth.currentUser?.uid) {
        showNotification(`📩 ${latest.name}`, latest.text);
      }
    });

    return unsub;
  }, []);

  const sendMessage = async () => {
    if (!text) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const location = await Location.getCurrentPositionAsync({});
    const user = auth.currentUser;
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    const userData = userSnap.data();

    await addDoc(collection(db, 'messages'), {
      uid: user.uid,
      name: userData.name,
      text,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      createdAt: serverTimestamp(),
    });

    setText('');
  };

  const renderItem = ({ item }) => {
    const isMe = item.uid === auth.currentUser?.uid;
    return (
      <TouchableOpacity
        disabled={isMe}
        onPress={() =>
          navigation.navigate('Map', { targetUid: item.uid })
        }
      >
        <View
          style={[
            styles.messageBubble,
            {
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              backgroundColor: isMe ? '#DCF8C6' : '#FFF',
              borderColor: isMe ? '#34B7F1' : '#DDD',
            },
          ]}
        >
          {!isMe && <Text style={styles.senderName}>{item.name}</Text>}
          <Text style={styles.messageText}>{item.text}</Text>
          {!isMe && (
            <Text style={styles.tapInfo}>แตะเพื่อดูตำแหน่งบนแผนที่</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F6F6F6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // keyboardVerticalOffset={0}
    >
      {/* ปุ่มทดสอบแจ้งเตือนเล็กๆ มุมขวาบน */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => showNotification('🔔 Test', 'ระบบแจ้งเตือนทำงานแล้ว')}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>Test</Text>
      </TouchableOpacity>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ padding: 16, paddingTop: 60 }} // เว้น top ให้ปุ่มไม่บัง
        renderItem={renderItem}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="พิมพ์ข้อความ..."
          value={text}
          onChangeText={setText}
          style={styles.textInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>ส่ง</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    maxWidth: '80%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  tapInfo: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F9F9F9',
  },
  sendButton: {
    backgroundColor: '#34B7F1',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 20,
  },
  testButton: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    elevation: 5,
  },
});
