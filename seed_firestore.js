/**
 * Olympian - Firestore 初期データ投入スクリプト
 * 
 * 既存の data.js (個人選手25名) と team_data.js (チーム6競技109名) を
 * Firestore の olympian-8f55c プロジェクトへ投入します。
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

const { ATHLETES_DATA } = require('./js/data.js');
const { TEAMS_DATA } = require('./js/team_data.js');

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

const COMPETITION_ID = 'asian-games-2026';

async function seedData() {
  console.log(`[Seed] 大会ID '${COMPETITION_ID}' のデータ投入を開始します...`);

  // 1. 大会メタ情報の登録
  const competitionRef = doc(db, 'competitions', COMPETITION_ID);
  await setDoc(competitionRef, {
    id: COMPETITION_ID,
    name: '第20回アジア競技大会（愛知・名古屋2026）',
    shortName: '愛知・名古屋2026',
    englishName: '20th Asian Games Aichi-Nagoya 2026',
    year: 2026,
    category: 'asian_games',
    startDate: '2026-09-19',
    endDate: '2026-10-04',
    totalDays: 16,
    venue: '愛知県・名古屋市（パロマ瑞穂スタジアム、豊田スタジアム、他）',
    description: '2026年秋開催の第20回アジア競技大会（愛知・名古屋）日本代表・注目選手の公式名鑑ポータル。',
    officialUrl: 'https://www.aichi-nagoya2026.org/ja/sports/',
    resultsUrl: 'https://results.asiangames2026.org/#/schedule/daily/',
    updatedAt: serverTimestamp()
  }, { merge: true });
  console.log(`✔ 大会メタ情報を保存しました: ${COMPETITION_ID}`);

  // 2. 個人選手データの投入 (25名)
  console.log(`[Seed] 個人選手 ${ATHLETES_DATA.length} 名の投入中...`);
  for (let i = 0; i < ATHLETES_DATA.length; i++) {
    const athlete = ATHLETES_DATA[i];
    const athleteRef = doc(db, 'competitions', COMPETITION_ID, 'athletes', athlete.id);
    await setDoc(athleteRef, {
      ...athlete,
      competitionId: COMPETITION_ID,
      order: i + 1,
      updatedAt: serverTimestamp()
    });
    console.log(`  [${i + 1}/${ATHLETES_DATA.length}] 個人選手保存: ${athlete.name} (${athlete.id})`);
  }
  console.log(`✔ 個人選手 ${ATHLETES_DATA.length} 名の保存完了`);

  // 3. チームデータの投入 (6競技)
  console.log(`[Seed] チームスポーツ ${TEAMS_DATA.length} チームの投入中...`);
  for (let i = 0; i < TEAMS_DATA.length; i++) {
    const team = TEAMS_DATA[i];
    const teamRef = doc(db, 'competitions', COMPETITION_ID, 'teams', team.id);
    await setDoc(teamRef, {
      ...team,
      competitionId: COMPETITION_ID,
      order: i + 1,
      updatedAt: serverTimestamp()
    });
    console.log(`  [${i + 1}/${TEAMS_DATA.length}] チーム保存: ${team.teamName} (${team.athletes.length}名登録)`);
  }
  console.log(`✔ チーム ${TEAMS_DATA.length} チームの保存完了`);

  console.log(`\n🎉 全データの Firestore 投入が正常に完了しました！`);
  process.exit(0);
}

seedData().catch(err => {
  console.error('❌ シード投入エラー:', err);
  process.exit(1);
});
