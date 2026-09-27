/**
 * Firebase 設定 & 初期化
 * Olympian プロジェクト (olympian-8f55c)
 *
 * このファイルはFirebaseのSDK設定を保持します。
 * APIキーはFirebaseのクライアントサイド用であり、
 * セキュリティはFirestore Security Rulesで担保します。
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA2crYIcgycPF0REceYHrDmcjTvXR97QXE",
  authDomain: "olympian-8f55c.firebaseapp.com",
  projectId: "olympian-8f55c",
  storageBucket: "olympian-8f55c.firebasestorage.app",
  messagingSenderId: "668961289531",
  appId: "1:668961289531:web:72b77bd5687209aaf7731e",
  measurementId: "G-NHR5M8R4QK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, query, orderBy };
