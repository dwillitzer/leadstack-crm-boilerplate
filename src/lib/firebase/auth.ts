import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./client";

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );
  await createSessionCookie(credential.user);
  return credential;
}

export async function signUpWithEmail(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(
    getFirebaseAuth(),
    email,
    password,
  );
  await createSessionCookie(credential.user);
  return credential;
}

export async function signOutUser() {
  await fetch("/api/logout", { method: "GET" }).catch((err) =>
    console.warn("logout endpoint failed", err),
  );
  return signOut(getFirebaseAuth());
}

/**
 * Exchange the Firebase ID token for the __session cookie that
 * next-firebase-auth-edge middleware uses to gate protected routes.
 */
async function createSessionCookie(user: User): Promise<void> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/login", {
    method: "GET",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    throw new Error(
      `Session cookie request failed: ${res.status} ${res.statusText}`,
    );
  }
}
