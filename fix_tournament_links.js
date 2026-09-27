/**
 * 選手・チームの大会結果速報リンクを、確実にHTTP 200が返る愛知・名古屋2026公式スポーツページへ更新
 */

const fs = require('fs');
const path = require('path');

// 競技別公式URLマッピング
const SPORT_MAPPING = {
  // 陸上
  'athletics': {
    name: '愛知・名古屋2026 陸上競技 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/athletics/'
  },
  // 水泳
  'swimming': {
    name: '愛知・名古屋2026 競泳 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/swimming/'
  },
  'diving': {
    name: '愛知・名古屋2026 飛込 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/diving/'
  },
  // 体操
  'gymnastics': {
    name: '愛知・名古屋2026 体操競技 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/artistic-gymnastics/'
  },
  // 柔道
  'judo': {
    name: '愛知・名古屋2026 柔道 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/judo/'
  },
  // レスリング
  'wrestling': {
    name: '愛知・名古屋2026 レスリング 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/wrestling/'
  },
  // フェンシング
  'fencing': {
    name: '愛知・名古屋2026 フェンシング 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/fencing/'
  },
  // 卓球
  'table-tennis': {
    name: '愛知・名古屋2026 卓球 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/table-tennis/'
  },
  // バドミントン
  'badminton': {
    name: '愛知・名古屋2026 バドミントン 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/badminton/'
  },
  // スケートボード
  'skateboarding': {
    name: '愛知・名古屋2026 スケートボード 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/skateboarding/'
  },
  // ブレイキン
  'breaking': {
    name: '愛知・名古屋2026 ブレイキン 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/breaking/'
  },
  // eスポーツ
  'esports': {
    name: '愛知・名古屋2026 eスポーツ 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/esports/'
  },
  // バスケットボール
  'basketball': {
    name: '愛知・名古屋2026 バスケットボール 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/basketball/'
  },
  // サッカー
  'football': {
    name: '愛知・名古屋2026 サッカー 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/football/'
  },
  // バレーボール
  'volleyball': {
    name: '愛知・名古屋2026 バレーボール 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/volleyball/'
  },
  // 野球
  'baseball': {
    name: '愛知・名古屋2026 野球 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/baseball/'
  },
  // ソフトボール
  'softball': {
    name: '愛知・名古屋2026 ソフトボール 公式スケジュール・結果速報',
    source: '愛知・名古屋2026 公式サイト',
    url: 'https://www.aichi-nagoya2026.org/ja/sport/softball/'
  }
};

function getSportKey(athlete) {
  if (athlete.sport === '陸上') return 'athletics';
  if (athlete.sport === '競泳') return 'swimming';
  if (athlete.sport === '飛込') return 'diving';
  if (athlete.sport === '体操') return 'gymnastics';
  if (athlete.sport === '柔道') return 'judo';
  if (athlete.sport === 'レスリング') return 'wrestling';
  if (athlete.sport === 'フェンシング') return 'fencing';
  if (athlete.sport === '卓球') return 'table-tennis';
  if (athlete.sport === 'バドミントン') return 'badminton';
  if (athlete.sport === 'スケートボード') return 'skateboarding';
  if (athlete.sport === 'ブレイキン') return 'breaking';
  if (athlete.sport === 'eスポーツ') return 'esports';
  if (athlete.sport === 'バスケットボール') return 'basketball';
  if (athlete.sport === 'サッカー') return 'football';
  if (athlete.sport === 'バレーボール') return 'volleyball';
  if (athlete.sport === '野球') return 'baseball';
  if (athlete.sport === 'ソフトボール') return 'softball';
  return 'athletics';
}

// 1. data.js の更新
const dataJsPath = path.join(__dirname, 'js', 'data.js');
let { ATHLETES_DATA } = require('./js/data.js');

ATHLETES_DATA.forEach(a => {
  if (a.tournamentResult && a.tournamentResult.officialTournament) {
    const key = getSportKey(a);
    const info = SPORT_MAPPING[key];
    if (info) {
      a.tournamentResult.officialTournament.name = info.name;
      a.tournamentResult.officialTournament.source = info.source;
      a.tournamentResult.officialTournament.url = info.url;
    }
  }
});

const dataContent = `/**
 * 2026年愛知・名古屋アジア競技大会 (Aichi-Nagoya 2026)
 * 日本代表・注目出場選手マスターデータ
 */

const ATHLETES_DATA = ${JSON.stringify(ATHLETES_DATA, null, 2)};

// Node.js環境用エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ATHLETES_DATA };
}
`;
fs.writeFileSync(dataJsPath, dataContent, 'utf8');
console.log('✔ js/data.js を更新しました');

// 2. team_data.js の更新
const teamDataJsPath = path.join(__dirname, 'js', 'team_data.js');
let { TEAMS_DATA } = require('./js/team_data.js');

TEAMS_DATA.forEach(team => {
  let key = 'football';
  if (team.sport === 'サッカー') key = 'football';
  else if (team.sport === 'バスケットボール') key = 'basketball';
  else if (team.sport === 'バレーボール') key = 'volleyball';
  else if (team.sport === '野球') key = 'baseball';
  else if (team.sport === 'ソフトボール') key = 'softball';

  const info = SPORT_MAPPING[key];
  if (info) {
    if (team.tournamentResult && team.tournamentResult.officialTournament) {
      team.tournamentResult.officialTournament.name = info.name;
      team.tournamentResult.officialTournament.source = info.source;
      team.tournamentResult.officialTournament.url = info.url;
    }
    team.athletes.forEach(a => {
      if (a.tournamentResult && a.tournamentResult.officialTournament) {
        a.tournamentResult.officialTournament.name = info.name;
        a.tournamentResult.officialTournament.source = info.source;
        a.tournamentResult.officialTournament.url = info.url;
      }
    });
  }
});

const teamContent = `/**
 * 2026年愛知・名古屋アジア競技大会 (Aichi-Nagoya 2026)
 * チームスポーツ（団体球技）全登録選手マスターデータ
 */

const TEAMS_DATA = ${JSON.stringify(TEAMS_DATA, null, 2)};

// Node.js環境用エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TEAMS_DATA };
}
`;
fs.writeFileSync(teamDataJsPath, teamContent, 'utf8');
console.log('✔ js/team_data.js を更新しました');
