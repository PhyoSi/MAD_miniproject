import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  Unsubscribe
} from "firebase/auth";
import { auth } from "../config/firebase";

let signInPromise: Promise<void> | null = null;

export function signInAnon(): Promise<void> {
  if (auth.currentUser) {
    return Promise.resolve();
  }

  if (!signInPromise) {
    signInPromise = signInAnonymously(auth)
      .then(() => undefined)
      .finally(() => {
        signInPromise = null;
      });
  }

  return signInPromise;
}

export function onAuthReady(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// Wait for auth to be ready before any Firestore operation
export function waitForAuth(): Promise<User> {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    let unsubscribe: Unsubscribe = () => undefined;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      reject(new Error("Authentication timed out"));
    }, 15000);

    unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (settled) return;

      if (user) {
        settled = true;
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(user);
        return;
      }

      try {
        await signInAnon();
      } catch (error) {
        settled = true;
        clearTimeout(timeoutId);
        unsubscribe();
        reject(error instanceof Error ? error : new Error("Failed anonymous sign-in"));
      }
    });
  });
}