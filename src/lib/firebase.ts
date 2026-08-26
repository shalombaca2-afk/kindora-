/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYsUADh9ekk2PH4reqLqYVt4QZaPkSHgU",
  authDomain: "gen-lang-client-0210361178.firebaseapp.com",
  projectId: "gen-lang-client-0210361178",
  storageBucket: "gen-lang-client-0210361178.firebasestorage.app",
  messagingSenderId: "819821429413",
  appId: "1:819821429413:web:8a198a16358db88cde034c"
};

const FIRESTORE_DATABASE_ID = "ai-studio-kindora-fe11d333-7042-4dd6-91b1-9da569b9a4ea";

// Initialize Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore using the configured database ID
export const db = FIRESTORE_DATABASE_ID
  ? getFirestore(app, FIRESTORE_DATABASE_ID)
  : getFirestore(app);

// Configure Social Auth Providers (Google & Facebook)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
