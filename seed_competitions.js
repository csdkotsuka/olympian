/**
 * Olympian - 大会マスターデータ（competitions）投入スクリプト
 * アジア大会、パリオリンピック、東京世界陸上、ロサンゼルス五輪、インターハイ等を登録
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

const COMPETITIONS = [
  {
    id: 'asian-games-2026',
    name: '第20回アジア競技大会（愛知・名古屋2026）',
    shortName: '愛知・名古屋2026',
    subtitle: 'TEAM JAPAN 選手名鑑ポータル',
    emblemText: '26',
    year: 2026,
    category: 'asian_games',
    categoryGroup: '現在開催中・注目大会',
    status: 'active',
    statusBadge: 'live',
    statusText: '大会8日目 / 開催中',
    venue: '愛知県・名古屋市（パロマ瑞穂スタジアム、豊田スタジアム、他）',
    themeColor: '#6366f1',
    description: '2026年秋開催の第20回アジア競技大会。日本国内でのアジア大会開催は1994年広島大会以来32年ぶり。',
    officialUrl: 'https://www.aichi-nagoya2026.org/ja/sports/',
    resultsUrl: 'https://results.asiangames2026.org/#/schedule/daily/',
    hasData: true,
    order: 1
  },
  {
    id: 'olympics-paris-2024',
    name: 'パリ2024 オリンピック競技大会',
    shortName: 'パリオリンピック2024',
    subtitle: 'TEAM JAPAN パリオリンピアン名鑑',
    emblemText: '24',
    year: 2024,
    category: 'olympics',
    categoryGroup: 'オリンピック',
    status: 'archived',
    statusBadge: 'finished',
    statusText: '大会全日程終了（金20・銀12・銅13）',
    venue: 'フランス・パリ（スタッド・ド・フランス 他）',
    themeColor: '#eab308',
    description: '100年ぶりにパリで開催された夏季オリンピック。日本選手団は海外五輪史上最多となる金メダル20個を獲得。',
    officialUrl: 'https://olympics.com/ja/paris-2024',
    resultsUrl: 'https://olympics.com/ja/paris-2024/results',
    hasData: false,
    order: 2
  },
  {
    id: 'world-athletics-tokyo-2025',
    name: '東京2025 世界陸上競技選手権大会',
    shortName: '東京2025世界陸上',
    subtitle: '日本代表・世界の超人名鑑',
    emblemText: '25',
    year: 2025,
    category: 'world_championships',
    categoryGroup: '世界選手権',
    status: 'archived',
    statusBadge: 'finished',
    statusText: '大会終了（国立競技場）',
    venue: '東京都（国立競技場）',
    themeColor: '#ef4444',
    description: '1991年以来34年ぶりに東京・国立競技場で開催された世界陸上選手権。世界のトップアスリートが集結。',
    officialUrl: 'https://worldathletics.org/competitions/world-athletics-championships/tokyo25',
    resultsUrl: 'https://worldathletics.org/',
    hasData: false,
    order: 3
  },
  {
    id: 'olympics-la-2028',
    name: 'ロサンゼルス2028 オリンピック競技大会',
    shortName: 'ロサンゼルス2028',
    subtitle: '次世代アスリート・日本代表候補名鑑',
    emblemText: '28',
    year: 2028,
    category: 'olympics',
    categoryGroup: 'オリンピック',
    status: 'upcoming',
    statusBadge: 'upcoming',
    statusText: '2028年7月 開幕予定',
    venue: 'アメリカ・ロサンゼルス',
    themeColor: '#3b82f6',
    description: '1984年以来44年ぶりのロサンゼルス開催。フラッグフットボールやスカッシュ、クリケット等の新競技も追加予定。',
    officialUrl: 'https://la28.org/',
    resultsUrl: 'https://la28.org/',
    hasData: false,
    order: 4
  },
  {
    id: 'inter-high-2026',
    name: '全国高等学校総合体育大会（インターハイ2026）',
    shortName: 'インターハイ2026',
    subtitle: '高校スポーツの祭典・未来のオリンピアン名鑑',
    emblemText: 'IH',
    year: 2026,
    category: 'domestic',
    categoryGroup: '国内大会・学生スポーツ',
    status: 'upcoming',
    statusBadge: 'upcoming',
    statusText: '全国高校総体',
    venue: '中国ブロック（鳥取・島根・岡山・広島・山口）',
    themeColor: '#10b981',
    description: '全国の高校生アスリートが頂点を争う国内最大の総合スポーツ大会。オリンピックへの登竜門。',
    officialUrl: 'https://www.koukousoutai.com/',
    resultsUrl: 'https://www.koukousoutai.com/',
    hasData: false,
    order: 5
  }
];

async function seed() {
  console.log('[Seed] 大会マスターデータ（competitions）の投入を開始します...');
  for (const comp of COMPETITIONS) {
    const compRef = doc(db, 'competitions', comp.id);
    await setDoc(compRef, {
      ...comp,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log(`✔ 大会登録: ${comp.name} (${comp.id})`);
  }
  console.log('🎉 大会マスターデータの投入が完了しました！');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
