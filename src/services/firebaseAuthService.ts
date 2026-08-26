/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  facebookProvider,
} from '../lib/firebase';
import {
  FirestoreChild,
  FirestoreUser,
  PetType,
  SocialProviderType,
} from '../types';

export interface SocialAuthResult {
  success: boolean;
  user?: FirebaseUser;
  email?: string;
  provider: SocialProviderType;
  needsEmailCapture?: boolean;
  isOperationNotAllowed?: boolean;
  error?: string;
}

const PROVIDER_DISPLAY_NAMES: Record<SocialProviderType, string> = {
  google: 'Google',
  facebook: 'Facebook',
};

export const firebaseAuthService = {
  /**
   * Social Authentication via Firebase Auth Providers exclusively:
   * Google ('GoogleAuthProvider') and Facebook ('FacebookAuthProvider')
   */
  async signInWithSocial(providerType: SocialProviderType): Promise<SocialAuthResult> {
    try {
      const providerInstance = providerType === 'facebook' ? facebookProvider : googleProvider;

      const credential = await signInWithPopup(auth, providerInstance);
      const user = credential.user;
      const email = user.email || user.providerData?.[0]?.email || '';

      // Immediately initialize / sync Firestore document under users/{uid} with isOtpVerified: true & isProfileComplete: true
      if (user.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(
            userDocRef,
            {
              uid: user.uid,
              email: email || '',
              authProvider: providerType,
              isOtpVerified: true,
              isProfileComplete: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          console.log(`[Firestore] User initialized with isOtpVerified: true and isProfileComplete: true for UID: ${user.uid}`);
        } catch (syncErr) {
          console.warn('[Firestore] Social user sync notice:', syncErr);
        }
      }

      return {
        success: true,
        user,
        email: email || undefined,
        provider: providerType,
        needsEmailCapture: !email,
      };
    } catch (err: any) {
      console.warn(`[Firebase Social Auth] ${providerType} login notice:`, err?.code, err?.message);

      const providerLabel = PROVIDER_DISPLAY_NAMES[providerType] || providerType;
      let friendlyError = `No se pudo iniciar sesión con ${providerLabel}.`;
      let isOperationNotAllowed = false;

      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
        isOperationNotAllowed = true;
        friendlyError = `El inicio de sesión con ${providerLabel} aún no está habilitado en la consola de Firebase Authentication. Puedes ingresar con Google o habilitar ${providerLabel} en tu consola de Firebase.`;
      } else if (err?.code === 'auth/popup-blocked') {
        friendlyError = 'El navegador bloqueó la ventana emergente. Por favor permite popups para autorizar tu cuenta.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        friendlyError = 'La ventana de autenticación se cerró antes de completar el acceso.';
      } else if (err?.code === 'auth/cancelled-popup-request') {
        friendlyError = 'Se canceló la ventana de autenticación previa.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        friendlyError = 'El dominio de la aplicación no está en la lista de dominios autorizados de Firebase Console.';
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        friendlyError = 'Ya existe una cuenta con este correo pero asociada a otro método de acceso.';
      } else if (err?.code === 'auth/network-request-failed') {
        friendlyError = 'Error de conexión con los servidores de Firebase. Verifica tu conexión a internet.';
      } else if (err?.message) {
        friendlyError = err.message;
      }

      return {
        success: false,
        error: friendlyError,
        isOperationNotAllowed,
        provider: providerType,
      };
    }
  },

  /**
   * Generates and dispatches a 6-digit random OTP with 10-minute validity
   */
  async sendOtp(email: string, uid?: string): Promise<{ success: boolean; expiresAt?: number; emailDispatched?: boolean; error?: string }> {
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), uid }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'No se pudo enviar el código de verificación.',
        };
      }

      return {
        success: true,
        expiresAt: data.expiresAt,
        emailDispatched: data.emailDispatched,
      };
    } catch (err: any) {
      return {
        success: false,
        error: 'Error de conexión al enviar el código OTP.',
      };
    }
  },

  /**
   * Verifies the 6-digit OTP code.
   * On success, registers/updates the user document in Cloud Firestore under `users/{uid}`
   * with `isOtpVerified: true`.
   */
  async verifyOtpAndSyncUser(params: {
    uid: string;
    email: string;
    authProvider: SocialProviderType | string;
    code: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { uid, email, authProvider, code } = params;
    try {
      // 1. Verify via backend endpoint
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email, code }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Código de verificación incorrecto o expirado.',
        };
      }

      // 2. Persist user document in Cloud Firestore under `users/{uid}`
      try {
        const userDocRef = doc(db, 'users', uid);
        const userSnapshot = await getDoc(userDocRef);

        const userData: Partial<FirestoreUser> = {
          uid,
          email,
          authProvider,
          isOtpVerified: true,
          isProfileComplete: userSnapshot.exists() ? userSnapshot.data()?.isProfileComplete || false : false,
          updatedAt: serverTimestamp(),
        };

        if (!userSnapshot.exists()) {
          userData.createdAt = serverTimestamp();
        }

        await setDoc(userDocRef, userData, { merge: true });
        console.log(`[Firestore] User document synchronized for UID: ${uid}`);
      } catch (firestoreErr: any) {
        console.warn('[Firestore Sync Notice] Firestore write:', firestoreErr?.message || firestoreErr);
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: 'Error al procesar la verificación.',
      };
    }
  },

  /**
   * Saves the child's profile in Cloud Firestore under `users/{uid}/children/{childId}`
   * and marks `isProfileComplete: true` on `users/{uid}`.
   */
  async saveChildProfile(params: {
    uid: string;
    childName: string;
    ageGroup: string | number;
    avatarId: string;
    petType: PetType;
    petCustomName: string;
  }): Promise<{ success: boolean; childId?: string; error?: string }> {
    const { uid, childName, ageGroup, avatarId, petType, petCustomName } = params;

    try {
      const childId = `child_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const childDocRef = doc(db, 'users', uid, 'children', childId);

      const childPayload: FirestoreChild = {
        childId,
        name: childName.trim(),
        ageGroup,
        avatarId,
        pet: {
          type: petType,
          customName: petCustomName.trim(),
        },
        createdAt: serverTimestamp(),
      };

      // Write child document to subcollection
      await setDoc(childDocRef, childPayload);

      // Update parent user document with `isOtpVerified: true` and `isProfileComplete: true`
      const userDocRef = doc(db, 'users', uid);
      await setDoc(
        userDocRef,
        {
          isOtpVerified: true,
          isProfileComplete: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      console.log(`[Firestore] Child profile successfully saved under users/${uid}/children/${childId}`);

      return {
        success: true,
        childId,
      };
    } catch (err: any) {
      console.error('[Firestore Save Child Error]', err);
      return {
        success: false,
        error: 'No se pudo guardar el perfil del niño en Firestore: ' + (err?.message || 'Error desconocido'),
      };
    }
  },

  /**
   * Synchronizes / creates user document with isOtpVerified: true and isProfileComplete: true on registration
   */
  async syncNewUserDocument(params: {
    uid: string;
    email: string;
    authProvider?: string;
    isProfileComplete?: boolean;
  }): Promise<void> {
    const { uid, email, authProvider = 'google', isProfileComplete = true } = params;
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(
        userDocRef,
        {
          uid,
          email,
          authProvider,
          isOtpVerified: true,
          isProfileComplete,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      console.log(`[Firestore] syncNewUserDocument complete for UID: ${uid}`);
    } catch (err) {
      console.warn('[Firestore syncNewUserDocument notice]:', err);
    }
  },

  /**
   * Fetches user document from Firestore `users/{uid}`
   */
  async getUserData(uid: string): Promise<FirestoreUser | null> {
    try {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        return snap.data() as FirestoreUser;
      }
      return null;
    } catch (err) {
      console.warn('[Firestore] getUserData error:', err);
      return null;
    }
  },

  /**
   * Fetches child profiles from `users/{uid}/children`
   */
  async getChildren(uid: string): Promise<FirestoreChild[]> {
    try {
      const childrenCollRef = collection(db, 'users', uid, 'children');
      const snap = await getDocs(childrenCollRef);
      const list: FirestoreChild[] = [];
      snap.forEach((d) => {
        list.push(d.data() as FirestoreChild);
      });
      return list;
    } catch (err) {
      console.warn('[Firestore] getChildren error:', err);
      return [];
    }
  },

  /**
   * Sign out from Firebase Auth
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[Firebase Auth] Sign out notice:', err);
    }
  },
};
