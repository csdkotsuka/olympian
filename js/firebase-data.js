/**
 * Olympian - Firestore データローダー
 *
 * Firestoreから選手・チームデータを読み込み、
 * 既存の ATHLETES_DATA / TEAMS_DATA 互換形式で
 * グローバル変数にセットします。
 *
 * 対応コレクション:
 *   competitions/{competitionId}              大会メタ情報
 *   competitions/{competitionId}/athletes     個人選手
 *   competitions/{competitionId}/teams        チーム（athletes サブコレクション含む）
 *
 * 将来の大会拡張:
 *   competitionId を切り替えるだけで別大会データを表示可能
 *   例: 'asian-games-2026', 'world-championships-2027', etc.
 */

import { db, collection, getDocs, query, orderBy } from './firebase-config.js';

// ==========================================
// 現在表示する大会ID（将来はURLパラメータやUIで切り替え可能）
// ==========================================
const CURRENT_COMPETITION_ID = 'asian-games-2026';

/**
 * ローディングオーバーレイを表示/非表示
 */
function showLoader(show) {
  const loader = document.getElementById('firebaseLoader');
  if (!loader) return;
  loader.style.display = show ? 'flex' : 'none';
}

/**
 * エラーメッセージを表示
 */
function showError(message) {
  const loader = document.getElementById('firebaseLoader');
  if (loader) {
    loader.innerHTML = `
      <div style="text-align:center;color:#ef4444;padding:2rem;">
        <p style="font-size:1.5rem;margin-bottom:0.5rem;">⚠️</p>
        <p style="margin-bottom:1rem;">${message}</p>
        <button onclick="location.reload()" style="padding:0.5rem 1rem;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;">再読み込み</button>
      </div>
    `;
    loader.style.display = 'flex';
  }
}

/**
 * Firestoreから個人選手データを読み込む
 * @returns {Promise<Array>}
 */
async function loadAthletes() {
  const athletesRef = collection(
    db,
    'competitions', CURRENT_COMPETITION_ID, 'athletes'
  );
  const q = query(athletesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Firestoreからチームデータを読み込む
 * （athletesフィールドは各チームドキュメントに配列として埋め込み）
 * @returns {Promise<Array>}
 */
async function loadTeams() {
  const teamsRef = collection(
    db,
    'competitions', CURRENT_COMPETITION_ID, 'teams'
  );
  const q = query(teamsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * メイン: Firestoreからデータを取得してグローバル変数にセット後、
 * app.js の初期化関数を呼ぶ
 */
async function initializeFromFirestore() {
  showLoader(true);

  try {
    const [athletes, teams] = await Promise.all([
      loadAthletes(),
      loadTeams()
    ]);

    // グローバル変数として既存 app.js に引き渡す
    window.ATHLETES_DATA = athletes;
    window.TEAMS_DATA = teams;

    showLoader(false);

    // app.js の初期化を呼び出す（DOMContentLoadedの代替）
    if (typeof window.initApp === 'function') {
      window.initApp();
    } else {
      console.warn('[Olympian] window.initApp() が見つかりません。app.js の読み込みを確認してください。');
    }

  } catch (err) {
    console.error('[Olympian] Firestoreデータ読み込みエラー:', err);
    showError('データの読み込みに失敗しました。<br>ネットワーク接続を確認してください。');
  }
}

// DOM準備完了後に実行
document.addEventListener('DOMContentLoaded', initializeFromFirestore);
