import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxYXdKV0jUdMq3uYTB5fh2XqHmt4A_SVo",
  authDomain: "testexpo-90dd3.firebaseapp.com",
  projectId: "testexpo-90dd3",
  storageBucket: "testexpo-90dd3.firebasestorage.app",
  messagingSenderId: "284694259994",
  appId: "1:284694259994:web:c3365716132297270024a3",
  measurementId: "G-5DM69305PZ"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(
    ReactNativeAsyncStorage
  ),
});

export const db = getFirestore(app);
