"use client";

import { FirebaseApp, initializeApp } from "firebase/app";
import { OAuthProvider, GoogleAuthProvider, signInWithCredential, Auth, User, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdToken, initializeAuth } from "firebase/auth";
import * as firebaseAuth from 'firebase/auth'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import * as secrets from "./secrets";
import AsyncStorage from "@react-native-async-storage/async-storage";

const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

const firebaseConfig = {
  apiKey: secrets.apiKey,
  authDomain: secrets.authDomain,
  projectId: secrets.projectId,
  storageBucket: secrets.storageBucket,
  messagingSenderId: secrets.messagingSenderId,
  appId: secrets.appId
};

let app = {} as FirebaseApp, auth = {} as Auth;
try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Auth with React Native persistence
    auth = initializeAuth(app, {
        persistence: reactNativePersistence(AsyncStorage),
    });
} catch(e: any) {
    console.warn("Error initializing firebase: ", e);
}
export { 
    secrets,
    OAuthProvider, GoogleAuthProvider, GoogleSignin, signInWithCredential,
    auth, Auth, User, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdToken 
};
