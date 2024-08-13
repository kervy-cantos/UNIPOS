// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';

// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
	databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
	projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_APP_ID,
	measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export default { app, auth };
