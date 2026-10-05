/**
 * Olympian - マルチ大会対応 Firestore データローダー & 大会スイッチャー
 *
 * 機能:
 *   1. competitions コレクションから利用可能な大会一覧を取得しプルダウンへ反映
 *   2. 選択された大会のメタデータ（大会名、カラー、日程、公式リンク等）をDOMへ即時反映
 *   3. 該当大会の athletes / teams サブコレクションをフェッチして app.js へ連携
 *   4. URLパラメータ (?comp=xxx) および localStorage による状態永続化
 */

import { db, collection, getDocs, query, orderBy } from './firebase-config.js';

// デフォルトの大会ID
const DEFAULT_COMPETITION_ID = 'asian-games-2026';

// キャッシュ
let cachedCompetitions = [];
let currentCompetition = null;

/**
 * URLパラメータまたはローカルストレージから初期大会IDを決定
 */
function getInitialCompetitionId() {
  const params = new URLSearchParams(window.location.search);
  const paramComp = params.get('comp');
  if (paramComp) return paramComp;

  const stored = localStorage.getItem('olympian_current_competition');
  if (stored) return stored;

  return DEFAULT_COMPETITION_ID;
}

/**
 * ローダー表示制御
 */
function showLoader(show, message = 'Firebase Firestore からデータを読み込み中...') {
  const loader = document.getElementById('firebaseLoader');
  if (!loader) return;
  if (show) {
    loader.style.display = 'flex';
    const msgEl = loader.querySelector('p');
    if (msgEl) msgEl.textContent = message;
  } else {
    loader.style.display = 'none';
  }
}

/**
 * エラー表示
 */
function showError(message) {
  const loader = document.getElementById('firebaseLoader');
  if (loader) {
    loader.innerHTML = `
      <div style="text-align:center;color:#ef4444;padding:2.5rem 1rem;">
        <p style="font-size:2rem;margin-bottom:0.5rem;">⚠️</p>
        <p style="font-weight:600;margin-bottom:1rem;color:#f87171;">${message}</p>
        <button onclick="location.reload()" style="padding:0.6rem 1.2rem;background:#6366f1;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;">再読み込み</button>
      </div>
    `;
    loader.style.display = 'flex';
  }
}

/**
 * Firestoreから全大会マスターを取得
 */
async function loadCompetitions() {
  try {
    const compRef = collection(db, 'competitions');
    const q = query(compRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    cachedCompetitions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return cachedCompetitions;
  } catch (err) {
    console.warn('[Olympian] 大会マスター取得エラー、フォールバックを使用:', err);
    return [
      { id: 'asian-games-2026', name: '第20回アジア競技大会（愛知・名古屋2026）', shortName: '愛知・名古屋2026', emblemText: '26', order: 1 }
    ];
  }
}

/**
 * 大会プルダウンUIの構築
 */
function renderTournamentSelector(competitions, activeCompId) {
  const select = document.getElementById('tournamentSelect');
  if (!select) return;

  select.innerHTML = '';

  // カテゴリグループごとに整理
  const groups = {};
  competitions.forEach(c => {
    const groupName = c.categoryGroup || 'その他';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(c);
  });

  Object.entries(groups).forEach(([groupName, comps]) => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = groupName;
    comps.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.shortName || c.name}${c.hasData === false ? '（準備中）' : ''}`;
      if (c.id === activeCompId) opt.selected = true;
      optgroup.appendChild(opt);
    });
    select.appendChild(optgroup);
  });

  // 選択切り替えイベント
  select.onchange = (e) => {
    switchCompetition(e.target.value);
  };
}

/**
 * 選択された大会のメタ情報をUIに反映（ヘッダー・スローガン・テーマ色等）
 */
function applyCompetitionTheme(comp) {
  if (!comp) return;

  // ページタイトル
  document.title = `${comp.name} | TEAM JAPAN 選手名鑑ポータル - Olympian`;

  // ヘッダーロゴテキスト
  const titleEl = document.querySelector('.logo-text-group h1');
  if (titleEl) titleEl.textContent = comp.name;

  const subEl = document.querySelector('.logo-sub');
  if (subEl) subEl.textContent = comp.subtitle || 'TEAM JAPAN 選手名鑑ポータル';

  // エンブレムバッジ
  const emblemEl = document.querySelector('.emblem-icon');
  if (emblemEl) emblemEl.textContent = comp.emblemText || '26';

  // ヘッダー日程ステータスバッジ
  const headerStatusText = document.getElementById('headerStatusText');
  if (headerStatusText && comp.statusText) {
    headerStatusText.textContent = comp.statusText;
  }
  const headerStatusBadge = document.getElementById('headerStatusBadge');
  if (headerStatusBadge && comp.statusBadge) {
    headerStatusBadge.className = `header-status-badge ${comp.statusBadge}`;
  }

  // 公式スケジュールボタン
  const scheduleBtn = document.querySelector('.header-schedule-btn');
  if (scheduleBtn && comp.officialUrl) {
    scheduleBtn.href = comp.officialUrl;
  }
  const heroScheduleBtn = document.querySelector('.btn-official-schedule');
  if (heroScheduleBtn && comp.officialUrl) {
    heroScheduleBtn.href = comp.officialUrl;
    const labelSpan = heroScheduleBtn.querySelector('span:nth-child(2)');
    if (labelSpan) {
      labelSpan.textContent = `${comp.shortName} 公式競技スケジュール・全日程タイムテーブルを見る ➔`;
    }
  }

  // 大会セレクターバーの現在大会バッジ
  const currentBadge = document.getElementById('currentTourneyBadge');
  if (currentBadge) {
    currentBadge.textContent = comp.shortName || comp.name;
  }
}

/**
 * 特定大会の選手データを取得
 */
async function loadAthletes(compId) {
  const athletesRef = collection(db, 'competitions', compId, 'athletes');
  const q = query(athletesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 特定大会のチームデータを取得
 */
async function loadTeams(compId) {
  const teamsRef = collection(db, 'competitions', compId, 'teams');
  const q = query(teamsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * 準備中（選手データ未投入）大会のプレースホルダー表示
 */
function renderComingSoonState(comp) {
  const grid = document.getElementById('athletesGrid');
  if (!grid) return;

  const countEl = document.getElementById('currentCount');
  if (countEl) countEl.textContent = '0';

  grid.innerHTML = `
    <div style="grid-column: 1 / -1; background: rgba(30, 41, 59, 0.7); border: 2px dashed rgba(99, 102, 241, 0.4); border-radius: 16px; padding: 4rem 2rem; text-align: center; color: #e2e8f0; margin: 2rem 0;">
      <div style="font-size: 3.5rem; margin-bottom: 1rem;">🏆</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; color: #f8fafc;">
        ${comp.name}
      </h2>
      <p style="font-size: 1rem; color: #94a3b8; max-width: 600px; margin: 0 auto 1.5rem; line-height: 1.6;">
        ${comp.description || '本大会の日本代表・注目選手名鑑データは現在編成・準備中です。'}
      </p>
      <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(99, 102, 241, 0.2); padding: 8px 18px; border-radius: 30px; font-weight: 600; color: #a5b4fc; margin-bottom: 1.5rem; border: 1px solid rgba(129, 140, 248, 0.3);">
        <span>📢</span> <span>選手データ順次公開予定</span>
      </div>
      <div>
        <button onclick="window.switchCompetition('asian-games-2026')" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 15px rgba(99,102,241,0.4);">
          開催中の「愛知・名古屋2026」を表示する ➔
        </button>
      </div>
    </div>
  `;
}

/**
 * 大会切り替えメイン関数
 */
async function switchCompetition(compId) {
  showLoader(true, `「${compId}」のデータを取得中...`);

  // URLパラメータ更新
  const url = new URL(window.location.href);
  url.searchParams.set('comp', compId);
  window.history.replaceState({}, '', url.toString());
  localStorage.setItem('olympian_current_competition', compId);

  // 対象大会メタ情報特定
  const comp = cachedCompetitions.find(c => c.id === compId) || { id: compId, name: compId };
  currentCompetition = comp;
  applyCompetitionTheme(comp);

  try {
    const [athletes, teams] = await Promise.all([
      loadAthletes(compId),
      loadTeams(compId)
    ]);

    showLoader(false);

    if (athletes.length === 0 && teams.length === 0) {
      // まだデータがない大会
      renderComingSoonState(comp);
      return;
    }

    // 取得データをグローバル変数へセット
    // ※ asian-games-2026 について、ローカルの最新データ（大会全日程終了・最終成績確定版）がロードされている場合、
    // Firestoreのデータが古い（ongoing/upcomingを含む）なら最新の確定版を維持
    if (compId === 'asian-games-2026' && window.ATHLETES_DATA && window.ATHLETES_DATA.length > 0) {
      const hasOngoingInFirestore = athletes.some(a => a.tournamentResult?.status === 'ongoing' || a.tournamentResult?.status === 'upcoming');
      const localIsFinished = window.ATHLETES_DATA.every(a => a.tournamentResult?.status === 'finished');
      if (hasOngoingInFirestore && localIsFinished) {
        console.log('[Olympian] 大会全日程終了の最新最終成績データを保持します。');
      } else {
        window.ATHLETES_DATA = athletes;
        window.TEAMS_DATA = teams;
      }
    } else {
      window.ATHLETES_DATA = athletes;
      window.TEAMS_DATA = teams;
    }

    // app.js の再初期化
    if (typeof window.initApp === 'function') {
      window.initApp(true);
    }

  } catch (err) {
    console.error(`[Olympian] 大会データ読み込みエラー (${compId}):`, err);
    showError(`大会「${comp.name || compId}」のデータ取得に失敗しました。`);
  }
}

// グローバル公開（UIから直接呼び出し可能）
window.switchCompetition = switchCompetition;

/**
 * 初期化処理
 */
async function init() {
  showLoader(true);

  try {
    // 1. 全大会一覧を取得
    const competitions = await loadCompetitions();

    // 2. 表示対象の大会ID決定
    const targetCompId = getInitialCompetitionId();

    // 3. 大会セレクターUI描画
    renderTournamentSelector(competitions, targetCompId);

    // 4. 初回大会データ読み込み
    await switchCompetition(targetCompId);

  } catch (err) {
    console.error('[Olympian] 初期化エラー:', err);
    showError('初期データの読み込みに失敗しました。');
  }
}

document.addEventListener('DOMContentLoaded', init);
