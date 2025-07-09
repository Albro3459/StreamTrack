"use client";

import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithCredential, Auth, User, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdToken, initializeAuth } from "firebase/auth";
import * as firebaseAuth from 'firebase/auth'; 
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';


import * as authKeys from "@/secrets/authKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";

const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

const firebaseConfig = {
  apiKey: authKeys.apiKey,
  authDomain: authKeys.authDomain,
  projectId: authKeys.projectId,
  storageBucket: authKeys.storageBucket,
  messagingSenderId: authKeys.messagingSenderId,
  appId: authKeys.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
    persistence: reactNativePersistence(AsyncStorage),
});

export { 
    authKeys,
    AuthSession, Google, GoogleAuthProvider, signInWithCredential, // Google
    auth, Auth, User, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdToken 
};
