"use client";

import { initializeApp } from "firebase/app";
import { Auth, User, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdToken, initializeAuth } from "firebase/auth";
import * as firebaseAuth from 'firebase/auth';    
import { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } from "@/secrets/firebase_keys";
import AsyncStorage from "@react-native-async-storage/async-storage";

const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
    persistence: reactNativePersistence(AsyncStorage),
});

export { auth, Auth, User, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdToken };
