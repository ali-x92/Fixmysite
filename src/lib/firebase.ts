import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDn_9ecokJHWoD6ctso-RxxzLA-_glvwdA",
  authDomain: "fixmysite-66e3f.firebaseapp.com",
  projectId: "fixmysite-66e3f",
  storageBucket: "fixmysite-66e3f.firebasestorage.app",
  messagingSenderId: "259295108554",
  appId: "1:259295108554:web:21686b1525568aab9f0333",
  measurementId: "G-9R48617R5V",
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export async function initializeFirebaseAnalytics(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) getAnalytics(firebaseApp);
  } catch {
    // Analytics is optional and must not affect the application when blocked by a browser.
  }
}
