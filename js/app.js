/**
 * 愛知・名古屋2026 アジア大会
 * 選手一覧ポータル アプリケーションロジック (app.js)
 * 個人注目選手名鑑 (25名) ＆ チームスポーツ全登録選手名鑑 (6競技109名)
 * 今大会結果（メダル絞り込み）＆ 最後のシーンハイライトリンク対応
 */

let appInitialized = false;

function initApp() {
  if (appInitialized) return;
  appInitialized = true;

  // グローバルまたはFirestoreから読み込まれたデータを参照
  const ATHLETES_DATA = window.ATHLETES_DATA || (typeof ATHLETES_DATA !== 'undefined' ? ATHLETES_DATA : []);
  const TEAMS_DATA = window.TEAMS_DATA || (typeof TEAMS_DATA !== 'undefined' ? TEAMS_DATA : []);

  // DOM要素
  const athletesGrid = document.getElementById('athletesGrid');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const eventSelect = document.getElementById('eventSelect');
  const sortSelect = document.getElementById('sortSelect');
  const currentCount = document.getElementById('currentCount');
  const categoryTabs = document.getElementById('categoryTabs');
  const btnFavFilter = document.getElementById('btnFavFilter');
  const favCountBadge = document.getElementById('favCountBadge');
  const quickModal = document.getElementById('quickModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalContentInner = document.getElementById('modalContentInner');

  // メダル色・ステータスフィルター要素
  const medalFilterButtons = document.getElementById('medalFilterButtons');
  const ongoingCountBadge = document.getElementById('ongoingCountBadge');
  const goldCountBadge = document.getElementById('goldCountBadge');
  const silverCountBadge = document.getElementById('silverCountBadge');
  const bronzeCountBadge = document.getElementById('bronzeCountBadge');
  const upcomingCountBadge = document.getElementById('upcomingCountBadge');

  // チームスポーツ専用UI要素
  const btnModeIndividual = document.getElementById('btnModeIndividual');
  const btnModeTeam = document.getElementById('btnModeTeam');
  const teamSubNav = document.getElementById('teamSubNav');
  const teamPills = document.getElementById('teamPills');
  const teamHeaderContainer = document.getElementById('teamHeaderContainer');

  // 状態管理
  let viewMode = 'individual'; // 'individual' | 'team'
  let currentCategory = 'all';
  let currentMedal = 'all'; // 'all' | 'gold' | 'silver' | 'bronze'
  let currentTeamId = 'football-men'; // チーム種目ID ('football-men', 'football-women', etc., or 'all')
  let currentPosition = 'all'; // チーム内ポジション絞り込み
  let currentSearchQuery = '';
  let currentEvent = 'all';
  let currentSort = 'default';
  let isFavOnly = false;
  let favorites = getStoredFavorites();

  // 初期化
  updateFavBadge();
  updateTournamentScheduleStatus();
  updateMedalCounts();
  populateEventSelect();
  renderAthletes();

  // ==========================================
  // イベントリスナー設定
  // ==========================================

  // メダル色絞り込みボタン
  medalFilterButtons?.addEventListener('click', (e) => {
    const btn = e.target.closest('.medal-btn');
    if (!btn) return;

    medalFilterButtons.querySelectorAll('.medal-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    currentMedal = btn.dataset.medal;
    renderAthletes();
  });

  // 表示モード切り替え (個人注目選手 vs チームスポーツ全登録ロスター)
  btnModeIndividual?.addEventListener('click', () => {
    switchViewMode('individual');
  });

  btnModeTeam?.addEventListener('click', () => {
    switchViewMode('team');
  });

  // チーム種目個別切り替えピルボタン
  teamPills?.addEventListener('click', (e) => {
    const pill = e.target.closest('.team-pill');
    if (!pill) return;

    teamPills.querySelectorAll('.team-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    currentTeamId = pill.dataset.teamId;
    currentPosition = 'all'; // ポジション絞り込みリセット
    renderAthletes();
  });

  // 競技大カテゴリタブ切り替え
  categoryTabs?.addEventListener('click', (e) => {
    const tab = e.target.closest('.cat-tab');
    if (!tab) return;

    categoryTabs.querySelectorAll('.cat-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    currentCategory = tab.dataset.category;

    // 「球技・チームスポーツ」が選択された場合は自動でチームモードに切り替え
    if (currentCategory === 'ball-games') {
      switchViewMode('team');
    } else {
      if (viewMode === 'team') {
        switchViewMode('individual');
      }
      populateEventSelect();
      renderAthletes();
    }
  });

  // リアルタイム検索
  searchInput?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.trim().toLowerCase();
    renderAthletes();
  });

  searchClearBtn?.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchQuery = '';
    renderAthletes();
    searchInput.focus();
  });

  // 種目セレクタ
  eventSelect?.addEventListener('change', (e) => {
    currentEvent = e.target.value;
    // チーム種目が選ばれた場合は自動で該当チームに切り替え
    if (typeof TEAMS_DATA !== 'undefined') {
      const matchedTeam = TEAMS_DATA.find(t => t.event === currentEvent);
      if (matchedTeam) {
        currentTeamId = matchedTeam.id;
        if (viewMode !== 'team') {
          switchViewMode('team', false);
        }
      }
    }
    renderAthletes();
  });

  // ソート順
  sortSelect?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderAthletes();
  });

  // お気に入りトグルボタン
  btnFavFilter?.addEventListener('click', () => {
    isFavOnly = !isFavOnly;
    btnFavFilter.classList.toggle('active', isFavOnly);
    renderAthletes();
  });

  // モーダル閉じる
  modalCloseBtn?.addEventListener('click', closeModal);
  quickModal?.addEventListener('click', (e) => {
    if (e.target === quickModal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quickModal?.classList.contains('open')) {
      closeModal();
    }
  });

  // ページトップに戻るボタン
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // 大会スケジュール＆何日目・開催進行状況の自動計算・表示
  // ==========================================
  function updateTournamentScheduleStatus() {
    // 愛知・名古屋2026アジア競技大会: 2026年9月19日(土) 〜 10月4日(日) (全16日間)
    const startDate = new Date('2026-09-19T00:00:00+09:00');
    const endDate = new Date('2026-10-04T23:59:59+09:00');
    const totalDays = 16;

    const now = new Date();
    const startMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = nowMidnight - startMidnight;
    const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const headerStatusBadge = document.getElementById('headerStatusBadge');
    const headerStatusText = document.getElementById('headerStatusText');
    const scheduleDayBadge = document.getElementById('scheduleDayBadge');
    const scheduleDayText = document.getElementById('scheduleDayText');
    const scheduleProgressBar = document.getElementById('scheduleProgressBar');
    const scheduleProgressLabel = document.getElementById('scheduleProgressLabel');
    const scheduleProgressPercent = document.getElementById('scheduleProgressPercent');

    if (now < startDate) {
      // 開幕前
      const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
      if (headerStatusText) headerStatusText.textContent = `開幕まであと ${daysUntil}日`;
      if (headerStatusBadge) headerStatusBadge.className = 'header-status-badge upcoming';
      if (scheduleDayText) scheduleDayText.textContent = `開幕まであと ${daysUntil}日（9月19日開幕）`;
      if (scheduleProgressBar) scheduleProgressBar.style.width = '0%';
      if (scheduleProgressLabel) scheduleProgressLabel.textContent = '大会開幕準備中';
      if (scheduleProgressPercent) scheduleProgressPercent.textContent = `あと ${daysUntil}日`;
    } else if (now > endDate || currentDay > totalDays) {
      // 終了後
      if (headerStatusText) headerStatusText.textContent = '大会全日程終了（閉幕）';
      if (headerStatusBadge) headerStatusBadge.className = 'header-status-badge finished';
      if (scheduleDayText) scheduleDayText.textContent = '大会全日程終了（全16日間 閉幕）🏁';
      if (scheduleDayBadge) {
        scheduleDayBadge.classList.add('finished');
        scheduleDayBadge.innerHTML = '<span>🏁</span><span>全日程終了（閉幕）</span>';
      }
      if (scheduleProgressBar) scheduleProgressBar.style.width = '100%';
      if (scheduleProgressLabel) scheduleProgressLabel.textContent = '大会終了（全日程閉幕）';
      if (scheduleProgressPercent) scheduleProgressPercent.textContent = '16 / 16 日間 完了';
    } else {
      // 開催中（何日目）
      const percent = Math.min(Math.round((currentDay / totalDays) * 100), 100);
      const dayLabel = `大会${currentDay}日目（DAY ${currentDay} / ${totalDays}）開催中`;
      
      if (headerStatusText) headerStatusText.textContent = `大会${currentDay}日目 / 開催中`;
      if (headerStatusBadge) headerStatusBadge.className = 'header-status-badge live';
      if (scheduleDayText) scheduleDayText.textContent = dayLabel;
      if (scheduleProgressBar) scheduleProgressBar.style.width = `${percent}%`;
      if (scheduleProgressLabel) {
        scheduleProgressLabel.textContent = currentDay <= 5 
          ? `大会序盤（${percent}%経過）` 
          : currentDay <= 12 
            ? `中盤戦クライマックス（${percent}%経過）` 
            : `終盤・メダルラッシュ（${percent}%経過）`;
      }
      if (scheduleProgressPercent) scheduleProgressPercent.textContent = `${currentDay} / ${totalDays} 日間`;
    }
  }

  // ==========================================
  // メダル獲得数・試合進行状況カウントの更新
  // ==========================================
  function updateMedalCounts() {
    let ongoing = 0, gold = 0, silver = 0, bronze = 0, upcoming = 0;

    if (viewMode === 'individual') {
      // 個人選手
      ATHLETES_DATA.forEach(a => {
        const m = a.tournamentResult?.medal;
        if (m === 'ongoing') ongoing++;
        else if (m === 'gold') gold++;
        else if (m === 'silver') silver++;
        else if (m === 'bronze') bronze++;
        else if (m === 'upcoming') upcoming++;
      });
    } else {
      // チームスポーツ
      if (typeof TEAMS_DATA !== 'undefined') {
        TEAMS_DATA.forEach(t => {
          const m = t.tournamentResult?.medal;
          if (m === 'ongoing') ongoing++;
          else if (m === 'gold') gold++;
          else if (m === 'silver') silver++;
          else if (m === 'bronze') bronze++;
          else if (m === 'upcoming') upcoming++;
        });
      }
    }

    if (ongoingCountBadge) ongoingCountBadge.textContent = ongoing;
    if (goldCountBadge) goldCountBadge.textContent = gold;
    if (silverCountBadge) silverCountBadge.textContent = silver;
    if (bronzeCountBadge) bronzeCountBadge.textContent = bronze;
    if (upcomingCountBadge) upcomingCountBadge.textContent = upcoming;
  }

  // ==========================================
  // モード切り替え関数
  // ==========================================
  function switchViewMode(mode, resetFilters = true) {
    viewMode = mode;

    btnModeIndividual?.classList.toggle('active', mode === 'individual');
    btnModeIndividual?.setAttribute('aria-selected', mode === 'individual' ? 'true' : 'false');
    btnModeTeam?.classList.toggle('active', mode === 'team');
    btnModeTeam?.setAttribute('aria-selected', mode === 'team' ? 'true' : 'false');

    if (mode === 'team') {
      if (teamSubNav) teamSubNav.style.display = 'block';
      if (teamHeaderContainer) teamHeaderContainer.style.display = 'block';
      // チームピルのアクティブ状態を同期
      teamPills?.querySelectorAll('.team-pill').forEach(p => {
        p.classList.toggle('active', p.dataset.teamId === currentTeamId);
      });
      // カテゴリタブの「球技」をアクティブに
      categoryTabs?.querySelectorAll('.cat-tab').forEach(t => {
        const isBall = t.dataset.category === 'ball-games';
        t.classList.toggle('active', isBall);
        t.setAttribute('aria-selected', isBall ? 'true' : 'false');
      });
    } else {
      if (teamSubNav) teamSubNav.style.display = 'none';
      if (teamHeaderContainer) teamHeaderContainer.style.display = 'none';
      currentPosition = 'all';
    }

    if (resetFilters) {
      currentEvent = 'all';
      populateEventSelect();
    }

    updateMedalCounts();
    renderAthletes();
  }

  // ==========================================
  // 種目セレクタの動的更新
  // ==========================================
  function populateEventSelect() {
    if (!eventSelect) return;
    eventSelect.innerHTML = '<option value="all">全種目</option>';

    if (viewMode === 'individual') {
      let pool = ATHLETES_DATA;
      if (currentCategory !== 'all') {
        pool = pool.filter(a => a.category === currentCategory);
      }
      const events = Array.from(new Set(pool.map(a => a.event))).sort();
      events.forEach(ev => {
        const opt = document.createElement('option');
        opt.value = ev;
        opt.textContent = ev;
        if (ev === currentEvent) opt.selected = true;
        eventSelect.appendChild(opt);
      });
    } else {
      // チームモード
      if (typeof TEAMS_DATA !== 'undefined') {
        TEAMS_DATA.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.event;
          opt.textContent = `${t.sport}: ${t.event} (${t.athletes.length}名)`;
          if (t.event === currentEvent || t.id === currentTeamId) opt.selected = true;
          eventSelect.appendChild(opt);
        });
      }
    }
  }

  // ==========================================
  // メイン レンダリング関数
  // ==========================================
  function renderAthletes() {
    // 検索語がある場合は個人・チーム全体からハイブリッド検索
    if (currentSearchQuery) {
      renderSearchResults();
      return;
    }

    if (viewMode === 'individual') {
      if (teamHeaderContainer) teamHeaderContainer.style.display = 'none';
      renderIndividualAthletes();
    } else {
      renderTeamRoster();
    }
  }

  // ==========================================
  // 個人選手一覧の描画
  // ==========================================
  function renderIndividualAthletes() {
    let list = [...ATHLETES_DATA];

    // 1. メダル色絞り込み
    if (currentMedal !== 'all') {
      list = list.filter(a => a.tournamentResult?.medal === currentMedal);
    }

    // 2. カテゴリ絞り込み
    if (currentCategory !== 'all') {
      list = list.filter(a => a.category === currentCategory);
    }

    // 3. 種目絞り込み
    if (currentEvent !== 'all') {
      list = list.filter(a => a.event === currentEvent);
    }

    // 4. お気に入り絞り込み
    if (isFavOnly) {
      list = list.filter(a => favorites.includes(a.id));
    }

    // 5. ソート
    if (currentSort === 'kana') {
      list.sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
    } else if (currentSort === 'sport') {
      list.sort((a, b) => (a.sport + a.event).localeCompare(b.sport + b.event, 'ja'));
    }

    currentCount.textContent = list.length;

    if (list.length === 0) {
      renderEmptyState();
      return;
    }

    athletesGrid.innerHTML = list.map(athlete => {
      const isFav = favorites.includes(athlete.id);
      const badgesHtml = (athlete.badges || []).slice(0, 3).map(b => 
        `<span class="honor-badge">${b}</span>`
      ).join('');

      const res = athlete.tournamentResult;

      return `
        <article class="athlete-card" data-id="${athlete.id}">
          <div class="card-image-wrap">
            <img src="${athlete.photoUrl}" alt="${athlete.name} 選手の顔写真" loading="lazy" style="object-position: ${athlete.photoPosition || 'center 20%'};">
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-id="${athlete.id}" title="${isFav ? 'お気に入り解除' : 'お気に入りに追加'}" aria-label="${athlete.name}をお気に入り登録">
              ${isFav ? '★' : '☆'}
            </button>
            <div class="card-sport-badge">
              <span class="badge-sport">${athlete.sport}</span>
              <span class="badge-event">${athlete.event}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="card-name-group">
              <span class="card-kana">${athlete.kana}</span>
              <h2 class="card-name">${athlete.name}</h2>
            </div>
            <div class="card-affiliation">
              <span>🏢</span> ${athlete.affiliation}
            </div>

            ${res ? `
            <div class="card-result-badge ${res.medal}">
              <span>${res.rank}</span>
              <span>•</span>
              <span>${res.record}</span>
            </div>
            ` : ''}

            <div class="card-badges-row">
              ${badgesHtml}
            </div>

            <div class="card-catchphrase">
              ${athlete.catchphrase}
            </div>

            <p class="card-summary">
              ${athlete.summary}
            </p>

            ${res?.finalScene ? `
            <div class="card-final-scene-box">
              <div class="final-scene-title">
                <span>🎬</span> <span>最後のシーン（決定的瞬間）</span>
              </div>
              <div class="final-scene-desc">${res.finalScene.title}</div>
              <a href="${res.finalScene.url}" target="_blank" rel="noopener noreferrer" class="btn-final-scene-link" onclick="event.stopPropagation();">
                <span>▶️</span> <span>${res.finalScene.platform}で最後のシーンを見る</span>
              </a>
            </div>
            ` : ''}

            ${res?.officialTournament ? `
            <div class="card-tournament-box">
              <div class="tournament-box-title">
                <span>📊</span> <span>公式トーナメント表・試合結果</span>
              </div>
              <div class="tournament-box-desc">${res.officialTournament.caption}</div>
              <a href="${res.officialTournament.url}" target="_blank" rel="noopener noreferrer" class="btn-tournament-link" onclick="event.stopPropagation();">
                <span>📊</span> <span>${res.officialTournament.name} ➔</span>
              </a>
              <div class="tournament-box-source">出典: ${res.officialTournament.source}</div>
            </div>
            ` : ''}

            ${athlete.critique?.summaryVerdict ? `
            <div class="card-verdict-box">
              <strong>専門家・メディア分析</strong>
              ${athlete.critique.summaryVerdict}
            </div>
            ` : ''}

            ${(athlete.snsAccounts && athlete.snsAccounts.length > 0) ? `
            <div class="card-mini-sns">
              ${athlete.snsAccounts.map(s => {
                let cls = 'official';
                let icon = '🌐';
                if (s.platform.includes('Instagram')) { cls = 'instagram'; icon = '📷'; }
                else if (s.platform.includes('X')) { cls = 'x'; icon = '𝕏'; }
                else if (s.platform.includes('YouTube')) { cls = 'youtube'; icon = '▶️'; }
                return `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="mini-sns-link ${cls}" title="${s.platform}: ${s.handle}" onclick="event.stopPropagation();">${icon}</a>`;
              }).join('')}
            </div>
            ` : ''}

            <div class="card-footer-actions">
              <a href="athletes/${athlete.id}.html" class="btn-detail" title="${athlete.name}の詳細ページを見る">
                <span>詳細プロフィール</span> <span>➔</span>
              </a>
              <button class="btn-quick-view" data-quick-id="${athlete.id}" title="クイック概要を見る">
                クイック表示
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    attachIndividualCardListeners();
  }

  // ==========================================
  // チームスポーツ全登録ロスターの描画
  // ==========================================
  function renderTeamRoster() {
    if (typeof TEAMS_DATA === 'undefined') return;

    // 表示対象チームの特定
    let targetTeams = [];
    if (currentTeamId === 'all') {
      targetTeams = [...TEAMS_DATA];
      if (teamHeaderContainer) teamHeaderContainer.style.display = 'none';
    } else {
      const selected = TEAMS_DATA.find(t => t.id === currentTeamId);
      if (selected) {
        targetTeams = [selected];
        renderTeamHeader(selected);
      } else {
        targetTeams = [TEAMS_DATA[0]];
        renderTeamHeader(TEAMS_DATA[0]);
      }
    }

    // メダル絞り込み（チーム単位または選手単位）
    if (currentMedal !== 'all') {
      targetTeams = targetTeams.filter(t => t.tournamentResult?.medal === currentMedal);
    }

    // 選手ロスターの抽出
    let athleteList = [];
    targetTeams.forEach(team => {
      team.athletes.forEach(athlete => {
        athleteList.push({
          ...athlete,
          teamId: team.id,
          teamName: team.teamName,
          sport: team.sport,
          event: team.event,
          teamResult: team.tournamentResult
        });
      });
    });

    // ポジション絞り込み（単一チーム選択時のみ有効）
    if (currentTeamId !== 'all' && currentPosition !== 'all') {
      athleteList = athleteList.filter(a => a.pos === currentPosition);
    }

    // お気に入りフィルター
    if (isFavOnly) {
      athleteList = athleteList.filter(a => favorites.includes(a.id));
    }

    // ソート処理
    if (currentSort === 'number') {
      athleteList.sort((a, b) => a.no - b.no);
    } else if (currentSort === 'kana') {
      athleteList.sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
    } else if (currentSort === 'sport') {
      athleteList.sort((a, b) => (a.sport + a.event).localeCompare(b.sport + b.event, 'ja'));
    }

    currentCount.textContent = athleteList.length;

    if (athleteList.length === 0) {
      renderEmptyState();
      return;
    }

    athletesGrid.innerHTML = athleteList.map(athlete => {
      const isFav = favorites.includes(athlete.id);
      const badgesHtml = (athlete.badges || []).slice(0, 3).map(b => 
        `<span class="roster-chip">${b}</span>`
      ).join('');

      const res = athlete.tournamentResult || athlete.teamResult;

      return `
        <article class="roster-card" data-team-athlete-id="${athlete.id}">
          <div class="roster-card-image-wrap">
            <img src="${athlete.photoUrl}" alt="${athlete.name} 選手の顔写真" loading="lazy">
            <div class="roster-number-badge">#${athlete.no}</div>
            <div class="roster-pos-badge">${athlete.pos} | ${athlete.posName || athlete.pos}</div>
            <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-id="${athlete.id}" title="${isFav ? 'お気に入り解除' : 'お気に入りに追加'}" aria-label="${athlete.name}をお気に入り登録">
              ${isFav ? '★' : '☆'}
            </button>
          </div>

          <div class="roster-card-body">
            <div class="roster-header-group">
              <span class="roster-kana">${athlete.kana}</span>
              <h3 class="roster-name">${athlete.name}</h3>
              <span class="roster-romaji">${athlete.romaji}</span>
            </div>

            <div class="roster-affiliation">
              <span>🏢</span> ${athlete.affiliation}
            </div>

            ${res ? `
            <div class="card-result-badge ${res.medal}">
              <span>${res.rank}</span>
              <span>•</span>
              <span>${res.record || res.scoreSummary}</span>
            </div>
            ` : ''}

            <div class="roster-meta-chips">
              <span class="roster-chip">${athlete.heightWeight}</span>
              <span class="roster-chip">${athlete.age}歳</span>
              ${badgesHtml}
            </div>

            <div class="roster-playstyle">
              <strong>プレイスタイル:</strong> ${athlete.playStyle}
            </div>

            ${res?.finalScene ? `
            <div class="card-final-scene-box">
              <div class="final-scene-title">
                <span>🎬</span> <span>チーム最後のシーン（ハイライト）</span>
              </div>
              <div class="final-scene-desc">${res.finalScene.title}</div>
              <a href="${res.finalScene.url}" target="_blank" rel="noopener noreferrer" class="btn-final-scene-link" onclick="event.stopPropagation();">
                <span>▶️</span> <span>${res.finalScene.platform}で最後のシーンを見る</span>
              </a>
            </div>
            ` : ''}

            ${res?.officialTournament ? `
            <div class="card-tournament-box">
              <div class="tournament-box-title">
                <span>📊</span> <span>公式トーナメント表・星取表</span>
              </div>
              <div class="tournament-box-desc">${res.officialTournament.caption}</div>
              <a href="${res.officialTournament.url}" target="_blank" rel="noopener noreferrer" class="btn-tournament-link" onclick="event.stopPropagation();">
                <span>📊</span> <span>${res.officialTournament.name} ➔</span>
              </a>
              <div class="tournament-box-source">出典: ${res.officialTournament.source}</div>
            </div>
            ` : ''}

            ${athlete.critique ? `
            <div class="roster-critique-box">
              <strong>💡 専門家・メディア客観批評</strong>
              <p class="roster-critique-text"><span style="color:#4ade80;">[評価]</span> ${athlete.critique.positive}</p>
              <p class="roster-critique-text" style="margin-top: 4px;"><span style="color:#fb923c;">[課題]</span> ${athlete.critique.critical}</p>
              <span class="roster-critique-source">出典: ${athlete.critique.positiveSource}</span>
            </div>
            ` : ''}

            ${(athlete.snsAccounts && athlete.snsAccounts.length > 0) ? `
            <div class="roster-sns-row">
              ${athlete.snsAccounts.map(s => {
                let cls = 'official';
                let icon = '🌐';
                if (s.platform.includes('Instagram')) { cls = 'instagram'; icon = '📷'; }
                else if (s.platform.includes('X')) { cls = 'x'; icon = '𝕏'; }
                else if (s.platform.includes('YouTube')) { cls = 'youtube'; icon = '▶️'; }
                return `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="mini-sns-link ${cls}" title="${s.platform}: ${s.handle}" onclick="event.stopPropagation();">${icon}</a>`;
              }).join('')}
            </div>
            ` : ''}

            <div class="roster-actions">
              <button class="btn-roster-quick" data-team-quick-id="${athlete.id}">
                クイック詳細・批評を見る ➔
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    attachTeamCardListeners();
  }

  // ==========================================
  // チームヘッダーカードの描画（単一チーム選択時）
  // ==========================================
  function renderTeamHeader(team) {
    if (!teamHeaderContainer) return;
    teamHeaderContainer.style.display = 'block';

    const res = team.tournamentResult;

    // ポジション集計
    const posCounts = {};
    team.athletes.forEach(a => {
      posCounts[a.pos] = (posCounts[a.pos] || 0) + 1;
    });

    const posButtonsHtml = ['all', ...team.positions].map(pos => {
      const label = pos === 'all' ? `全ポジション (${team.athletes.length}名)` : `${pos} (${posCounts[pos] || 0}名)`;
      const activeClass = currentPosition === pos ? 'active' : '';
      return `<button class="pos-btn ${activeClass}" data-pos="${pos}">${label}</button>`;
    }).join('');

    teamHeaderContainer.innerHTML = `
      <section class="team-header-card" aria-label="${team.teamName} 概要情報">
        <div class="team-header-top">
          <div class="team-title-group">
            <span class="team-english-name">${team.englishName}</span>
            <h2>${team.teamName}</h2>
          </div>
          <div class="team-badge-goal">
            <span>🎯 最終結果:</span> <span>${res ? res.rank : team.medalGoal}</span>
          </div>
        </div>

        ${res ? `
        <div class="modal-result-box" style="margin-bottom: 14px;">
          <div class="modal-result-header">
            <span class="modal-result-rank">${res.rank}</span>
            <span class="modal-result-record">${res.scoreSummary}</span>
          </div>
          <p style="font-size: 0.85rem; color: #e2e8f0; line-height: 1.5; margin: 0 0 10px;">${res.detail}</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
            <a href="${res.finalScene.url}" target="_blank" rel="noopener noreferrer" class="btn-final-scene-link">
              <span>▶️</span> <span>【${res.finalScene.platform}】${res.finalScene.title}を見る</span>
            </a>
            ${res.officialTournament ? `
            <a href="${res.officialTournament.url}" target="_blank" rel="noopener noreferrer" class="btn-tournament-link">
              <span>📊</span> <span>【${res.officialTournament.source}】${res.officialTournament.name} ➔</span>
            </a>
            ` : ''}
          </div>
        </div>
        ` : ''}

        <div class="team-slogan-box">
          <p class="team-slogan-text">💬 「${team.slogan}」</p>
        </div>

        <p class="team-summary-text">${team.summary}</p>

        <div class="team-meta-grid">
          <div class="team-meta-item">
            <span class="team-meta-label">監督・ヘッドコーチ</span>
            <span class="team-meta-value">${team.coach}</span>
          </div>
          <div class="team-meta-item">
            <span class="team-meta-label">チームキャプテン</span>
            <span class="team-meta-value">${team.captain}</span>
          </div>
          <div class="team-meta-item">
            <span class="team-meta-label">全登録選手枠</span>
            <span class="team-meta-value"><strong>${team.athletes.length}</strong> 名登録完了</span>
          </div>
          <div class="team-meta-item">
            <span class="team-meta-label">競技会場 / 日程</span>
            <span class="team-meta-value">${team.venue}</span>
          </div>
        </div>

        <div class="pos-filter-container">
          <span class="pos-filter-label">ポジション別クイック絞り込み:</span>
          ${posButtonsHtml}
        </div>
      </section>
    `;

    // ポジションボタンのイベント
    teamHeaderContainer.querySelectorAll('.pos-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPosition = btn.dataset.pos;
        renderTeamRoster();
      });
    });
  }

  // ==========================================
  // ハイブリッド検索結果の描画
  // ==========================================
  function renderSearchResults() {
    if (teamHeaderContainer) teamHeaderContainer.style.display = 'none';

    // 1. 個人選手から検索
    let matchedIndividuals = ATHLETES_DATA.filter(a => {
      const targetStr = [
        a.name, a.kana, a.romaji, a.sport, a.event, a.affiliation, a.birthPlace, a.summary,
        a.tournamentResult?.rank, a.tournamentResult?.record,
        ...(a.badges || [])
      ].join(' ').toLowerCase();
      return targetStr.includes(currentSearchQuery);
    });

    if (currentMedal !== 'all') {
      matchedIndividuals = matchedIndividuals.filter(a => a.tournamentResult?.medal === currentMedal);
    }

    // 2. チーム所属選手から検索
    let matchedTeamAthletes = [];
    if (typeof TEAMS_DATA !== 'undefined') {
      TEAMS_DATA.forEach(team => {
        team.athletes.forEach(athlete => {
          const targetStr = [
            athlete.name, athlete.kana, athlete.romaji, athlete.pos, athlete.posName,
            athlete.affiliation, athlete.playStyle, team.teamName, team.sport, team.event,
            team.tournamentResult?.rank,
            athlete.critique?.positive, athlete.critique?.critical,
            ...(athlete.badges || [])
          ].join(' ').toLowerCase();

          if (targetStr.includes(currentSearchQuery)) {
            matchedTeamAthletes.push({
              ...athlete,
              teamId: team.id,
              teamName: team.teamName,
              sport: team.sport,
              event: team.event,
              teamResult: team.tournamentResult
            });
          }
        });
      });
    }

    if (currentMedal !== 'all') {
      matchedTeamAthletes = matchedTeamAthletes.filter(a => (a.tournamentResult?.medal === currentMedal || a.teamResult?.medal === currentMedal));
    }

    const totalCount = matchedIndividuals.length + matchedTeamAthletes.length;
    currentCount.textContent = totalCount;

    if (totalCount === 0) {
      renderEmptyState();
      return;
    }

    let html = '';

    // 個人選手マッチ分
    if (matchedIndividuals.length > 0) {
      html += matchedIndividuals.map(athlete => {
        const isFav = favorites.includes(athlete.id);
        const res = athlete.tournamentResult;
        return `
          <article class="athlete-card" data-id="${athlete.id}">
            <div class="card-image-wrap">
              <img src="${athlete.photoUrl}" alt="${athlete.name} 選手の顔写真" loading="lazy">
              <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-id="${athlete.id}">
                ${isFav ? '★' : '☆'}
              </button>
              <div class="card-sport-badge">
                <span class="badge-sport">${athlete.sport}</span>
                <span class="badge-event">${athlete.event}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="card-name-group">
                <span class="card-kana">${athlete.kana}</span>
                <h2 class="card-name">${athlete.name}</h2>
              </div>
              <div class="card-affiliation"><span>🏢</span> ${athlete.affiliation}</div>
              ${res ? `
              <div class="card-result-badge ${res.medal}">
                <span>${res.rank}</span> <span>•</span> <span>${res.record}</span>
              </div>
              ` : ''}
              <p class="card-summary">${athlete.summary}</p>
              ${res?.finalScene ? `
              <div class="card-final-scene-box">
                <a href="${res.finalScene.url}" target="_blank" rel="noopener noreferrer" class="btn-final-scene-link" onclick="event.stopPropagation();">
                  <span>▶️</span> <span>${res.finalScene.platform}で最後のシーンを見る</span>
                </a>
              </div>
              ` : ''}
              ${res?.officialTournament ? `
              <div class="card-tournament-box" style="margin-top: 6px; margin-bottom: 6px;">
                <a href="${res.officialTournament.url}" target="_blank" rel="noopener noreferrer" class="btn-tournament-link" onclick="event.stopPropagation();">
                  <span>📊</span> <span>公式トーナメント表・結果 ➔</span>
                </a>
              </div>
              ` : ''}
              <div class="card-footer-actions">
                <a href="athletes/${athlete.id}.html" class="btn-detail">詳細プロフィール ➔</a>
                <button class="btn-quick-view" data-quick-id="${athlete.id}">クイック表示</button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    // チーム選手マッチ分
    if (matchedTeamAthletes.length > 0) {
      html += matchedTeamAthletes.map(athlete => {
        const isFav = favorites.includes(athlete.id);
        const res = athlete.tournamentResult || athlete.teamResult;
        return `
          <article class="roster-card" data-team-athlete-id="${athlete.id}">
            <div class="roster-card-image-wrap">
              <img src="${athlete.photoUrl}" alt="${athlete.name} 選手の顔写真" loading="lazy">
              <div class="roster-number-badge">#${athlete.no}</div>
              <div class="roster-pos-badge">${athlete.pos} | ${athlete.posName || athlete.pos}</div>
              <button class="card-fav-btn ${isFav ? 'active' : ''}" data-fav-id="${athlete.id}">
                ${isFav ? '★' : '☆'}
              </button>
            </div>
            <div class="roster-card-body">
              <div class="roster-header-group">
                <span class="roster-kana">${athlete.kana}</span>
                <h3 class="roster-name">${athlete.name}</h3>
                <span class="roster-romaji">${athlete.teamName}</span>
              </div>
              <div class="roster-affiliation"><span>🏢</span> ${athlete.affiliation}</div>
              ${res ? `
              <div class="card-result-badge ${res.medal}">
                <span>${res.rank}</span> <span>•</span> <span>${res.record || res.scoreSummary}</span>
              </div>
              ` : ''}
              <div class="roster-meta-chips">
                <span class="roster-chip">${athlete.heightWeight}</span>
                <span class="roster-chip">${athlete.age}歳</span>
              </div>
              <div class="roster-playstyle">${athlete.playStyle}</div>
              ${res?.finalScene ? `
              <div class="card-final-scene-box">
                <a href="${res.finalScene.url}" target="_blank" rel="noopener noreferrer" class="btn-final-scene-link" onclick="event.stopPropagation();">
                  <span>▶️</span> <span>最後のシーンを見る</span>
                </a>
              </div>
              ` : ''}
              ${res?.officialTournament ? `
              <div class="card-tournament-box" style="margin-top: 6px; margin-bottom: 6px;">
                <a href="${res.officialTournament.url}" target="_blank" rel="noopener noreferrer" class="btn-tournament-link" onclick="event.stopPropagation();">
                  <span>📊</span> <span>公式トーナメント表・星取表 ➔</span>
                </a>
              </div>
              ` : ''}
              <div class="roster-actions">
                <button class="btn-roster-quick" data-team-quick-id="${athlete.id}">
                  チーム詳細・批評を見る ➔
                </button>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    athletesGrid.innerHTML = html;
    attachIndividualCardListeners();
    attachTeamCardListeners();
  }

  // ==========================================
  // 空状態の表示
  // ==========================================
  function renderEmptyState() {
    athletesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">該当する選手が見つかりませんでした</h3>
        <p class="empty-desc">条件を変更するか、検索キーワードを見直してみてください。</p>
        <button class="btn-reset-filters" id="btnResetFilters">すべてのフィルターを解除</button>
      </div>
    `;
    document.getElementById('btnResetFilters')?.addEventListener('click', resetAllFilters);
  }

  // ==========================================
  // カード内イベント委譲 (個人選手)
  // ==========================================
  function attachIndividualCardListeners() {
    athletesGrid.querySelectorAll('.card-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.favId);
      });
    });

    athletesGrid.querySelectorAll('.btn-quick-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openQuickModal(btn.dataset.quickId);
      });
    });
  }

  // ==========================================
  // カード内イベント委譲 (チーム所属選手)
  // ==========================================
  function attachTeamCardListeners() {
    athletesGrid.querySelectorAll('.card-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(btn.dataset.favId);
      });
    });

    athletesGrid.querySelectorAll('.btn-roster-quick').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTeamAthleteModal(btn.dataset.teamQuickId);
      });
    });
  }

  // ==========================================
  // お気に入り処理
  // ==========================================
  function getStoredFavorites() {
    try {
      const data = localStorage.getItem('aichi2026_fav_athletes');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function toggleFavorite(id) {
    if (favorites.includes(id)) {
      favorites = favorites.filter(favId => favId !== id);
    } else {
      favorites.push(id);
    }
    try {
      localStorage.setItem('aichi2026_fav_athletes', JSON.stringify(favorites));
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
    updateFavBadge();
    renderAthletes();
  }

  function updateFavBadge() {
    if (favCountBadge) favCountBadge.textContent = favorites.length;
  }

  // ==========================================
  // クイックビュー モーダル (個人注目選手)
  // ==========================================
  function openQuickModal(id) {
    const athlete = ATHLETES_DATA.find(a => a.id === id);
    if (!athlete) return;

    const res = athlete.tournamentResult;

    modalContentInner.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
        <img src="${athlete.photoUrl}" alt="${athlete.name}" style="width: 100px; height: 120px; object-fit: cover; object-position: ${athlete.photoPosition || 'center 20%'}; border-radius: 8px; border: 1px solid var(--color-gold);">
        <div>
          <span style="font-size: 0.8rem; color: var(--color-gold); font-weight: 700;">${athlete.sport} / ${athlete.event}</span>
          <h3 style="font-size: 1.6rem; font-weight: 900; color: #fff; margin: 2px 0;">${athlete.name}</h3>
          <p style="font-size: 0.85rem; color: var(--color-text-muted);">${athlete.affiliation} | 出身: ${athlete.birthPlace}</p>
        </div>
      </div>

      ${res ? `
      <div class="modal-result-box">
        <div class="modal-result-header">
          <span class="modal-result-rank">${res.rank}</span>
          <span class="modal-result-record">${res.record}</span>
        </div>
        <p style="font-size: 0.85rem; color: #e2e8f0; line-height: 1.5; margin: 0 0 10px;">${res.summary}</p>
        ${res.finalScene ? `
        <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 10px; margin-bottom: 10px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #f87171; margin-bottom: 4px;">🎬 最後のシーン（決定的瞬間）</div>
          <div style="font-size: 0.82rem; color: #cbd5e0; margin-bottom: 8px;">${res.finalScene.description}</div>
          <a href="${res.finalScene.url}" target="_blank" rel="noopener noreferrer" class="btn-final-scene-link">
            <span>▶️</span> <span>【${res.finalScene.platform}】${res.finalScene.title}を見る</span>
          </a>
        </div>
        ` : ''}
        ${res.officialTournament ? `
        <div style="background: rgba(30, 58, 138, 0.25); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 6px; padding: 10px; margin-bottom: 4px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #60a5fa; margin-bottom: 4px;">📊 公式トーナメント表・試合結果（Draw/Results）</div>
          <div style="font-size: 0.82rem; color: #cbd5e0; margin-bottom: 8px;">${res.officialTournament.caption}</div>
          <a href="${res.officialTournament.url}" target="_blank" rel="noopener noreferrer" class="btn-tournament-link">
            <span>📊</span> <span>【${res.officialTournament.source}】${res.officialTournament.name}を見る ➔</span>
          </a>
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
        ${(athlete.snsAccounts || []).map(s => {
          let bg = 'rgba(255,255,255,0.08)';
          if (s.platform.includes('Instagram')) bg = 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)';
          else if (s.platform.includes('X')) bg = '#000';
          else if (s.platform.includes('YouTube')) bg = '#c4302b';
          return `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; color: #fff; background: ${bg}; border: 1px solid var(--color-border); text-decoration: none;">
            ${s.platform}: ${s.handle}
          </a>`;
        }).join('')}
      </div>

      <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: 8px; margin-bottom: 16px; border-left: 3px solid var(--color-gold);">
        <p style="font-size: 0.95rem; font-weight: 700; color: #fff;">${athlete.catchphrase}</p>
      </div>

      <p style="font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.7; margin-bottom: 16px;">
        ${athlete.detailedProfile?.bio || athlete.summary}
      </p>

      ${athlete.critique ? `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-gold-light); margin-bottom: 8px;">🧐 専門家・メディアによる客観的批評</div>
        <p style="font-size: 0.82rem; color: #d1d5db; line-height: 1.5; margin-bottom: 8px;"><strong style="color: #4ade80;">[評価]</strong> ${athlete.critique.positive}</p>
        <p style="font-size: 0.82rem; color: #d1d5db; line-height: 1.5; margin-bottom: 8px;"><strong style="color: #fb923c;">[課題]</strong> ${athlete.critique.critical}</p>
        <div style="font-size: 0.72rem; color: var(--color-text-muted); border-top: 1px solid var(--color-border); padding-top: 6px;">
          <span>出典: ${athlete.critique.positiveSource} / ${athlete.critique.criticalSource}</span>
        </div>
      </div>
      ` : ''}

      <div style="display: flex; gap: 12px;">
        <a href="athletes/${athlete.id}.html" class="btn-detail" style="text-align: center; justify-content: center; width: 100%;">
          約1ページ分の完全詳細プロフィールを見る ➔
        </a>
      </div>
    `;

    quickModal?.classList.add('open');
    quickModal?.setAttribute('aria-hidden', 'false');
  }

  // ==========================================
  // クイックビュー モーダル (チーム所属選手)
  // ==========================================
  function openTeamAthleteModal(id) {
    if (typeof TEAMS_DATA === 'undefined') return;

    let targetAthlete = null;
    let targetTeam = null;

    for (const team of TEAMS_DATA) {
      const found = team.athletes.find(a => a.id === id);
      if (found) {
        targetAthlete = found;
        targetTeam = team;
        break;
      }
    }

    if (!targetAthlete) return;

    const res = targetAthlete.tournamentResult || targetTeam.tournamentResult;

    modalContentInner.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 20px;">
        <div style="position: relative; width: 100px; height: 120px; flex-shrink: 0; border-radius: 8px; overflow: hidden; border: 1.5px solid var(--color-gold);">
          <img src="${targetAthlete.photoUrl}" alt="${targetAthlete.name}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.85); color: var(--color-gold); font-family: Impact, sans-serif; font-size: 1.1rem; padding: 2px 6px; border-radius: 4px;">#${targetAthlete.no}</span>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--color-gold); font-weight: 700;">${targetTeam.teamName} (${targetAthlete.pos} / ${targetAthlete.posName})</span>
          <h3 style="font-size: 1.6rem; font-weight: 900; color: #fff; margin: 2px 0;">${targetAthlete.name}</h3>
          <p style="font-size: 0.8rem; color: var(--color-gold-light); font-weight: 600; margin-bottom: 4px;">${targetAthlete.romaji}</p>
          <p style="font-size: 0.85rem; color: var(--color-text-muted);">${targetAthlete.affiliation} | ${targetAthlete.heightWeight} / ${targetAthlete.age}歳</p>
        </div>
      </div>

      ${res ? `
      <div class="modal-result-box">
        <div class="modal-result-header">
          <span class="modal-result-rank">${res.rank}</span>
          <span class="modal-result-record">${res.record || res.scoreSummary}</span>
        </div>
        <p style="font-size: 0.85rem; color: #e2e8f0; line-height: 1.5; margin: 0 0 10px;">${res.summary || res.detail}</p>
        ${res.finalScene ? `
        <div style="background: rgba(0,0,0,0.3); border-radius: 6px; padding: 10px; margin-bottom: 10px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #f87171; margin-bottom: 4px;">🎬 チーム最後のシーン（ハイライト）</div>
          <div style="font-size: 0.82rem; color: #cbd5e0; margin-bottom: 8px;">${res.finalScene.description}</div>
          <a href="${res.finalScene.url}" target="_blank" rel="noopener noreferrer" class="btn-final-scene-link">
            <span>▶️</span> <span>【${res.finalScene.platform}】${res.finalScene.title}を見る</span>
          </a>
        </div>
        ` : ''}
        ${res.officialTournament ? `
        <div style="background: rgba(30, 58, 138, 0.25); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 6px; padding: 10px; margin-bottom: 4px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #60a5fa; margin-bottom: 4px;">📊 公式トーナメント表・試合結果（Draw/Results）</div>
          <div style="font-size: 0.82rem; color: #cbd5e0; margin-bottom: 8px;">${res.officialTournament.caption}</div>
          <a href="${res.officialTournament.url}" target="_blank" rel="noopener noreferrer" class="btn-tournament-link">
            <span>📊</span> <span>【${res.officialTournament.source}】${res.officialTournament.name}を見る ➔</span>
          </a>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
        ${(targetAthlete.snsAccounts || []).map(s => {
          let bg = 'rgba(255,255,255,0.08)';
          if (s.platform.includes('Instagram')) bg = 'linear-gradient(45deg, #f09433, #dc2743, #bc1888)';
          else if (s.platform.includes('X')) bg = '#000';
          else if (s.platform.includes('YouTube')) bg = '#c4302b';
          return `<a href="${s.url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; color: #fff; background: ${bg}; border: 1px solid var(--color-border); text-decoration: none;">
            ${s.platform}: ${s.handle}
          </a>`;
        }).join('')}
      </div>

      <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: 8px; margin-bottom: 16px; border-left: 3px solid var(--color-gold);">
        <p style="font-size: 0.8rem; font-weight: 800; color: var(--color-gold-light); margin-bottom: 4px;">⚡ プレイスタイル＆特長</p>
        <p style="font-size: 0.9rem; color: #ffffff; line-height: 1.6; margin: 0;">${targetAthlete.playStyle}</p>
      </div>

      ${targetAthlete.critique ? `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-gold-light); margin-bottom: 8px;">🧐 専門家・メディアによる客観的批評</div>
        <p style="font-size: 0.82rem; color: #d1d5db; line-height: 1.5; margin-bottom: 8px;"><strong style="color: #4ade80;">[評価・強み]</strong> ${targetAthlete.critique.positive}</p>
        <p style="font-size: 0.82rem; color: #d1d5db; line-height: 1.5; margin-bottom: 8px;"><strong style="color: #fb923c;">[課題・懸念点]</strong> ${targetAthlete.critique.critical}</p>
        <p style="font-size: 0.82rem; color: #d1d5db; line-height: 1.5; margin-bottom: 8px;"><strong style="color: var(--color-gold);">[総合見解]</strong> ${targetAthlete.critique.summaryVerdict}</p>
        <div style="font-size: 0.72rem; color: var(--color-text-muted); border-top: 1px solid var(--color-border); padding-top: 6px;">
          <span>引用元: ${targetAthlete.critique.positiveSource} / ${targetAthlete.critique.criticalSource}</span>
        </div>
      </div>
      ` : ''}
    `;

    quickModal?.classList.add('open');
    quickModal?.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    quickModal?.classList.remove('open');
    quickModal?.setAttribute('aria-hidden', 'true');
  }

  // ==========================================
  // フィルター全解除
  // ==========================================
  function resetAllFilters() {
    currentCategory = 'all';
    currentMedal = 'all';
    currentEvent = 'all';
    currentPosition = 'all';
    currentSearchQuery = '';
    isFavOnly = false;
    currentSort = 'default';

    if (searchInput) searchInput.value = '';
    btnFavFilter?.classList.remove('active');
    if (sortSelect) sortSelect.value = 'default';

    categoryTabs?.querySelectorAll('.cat-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.category === 'all');
      t.setAttribute('aria-selected', t.dataset.category === 'all' ? 'true' : 'false');
    });

    medalFilterButtons?.querySelectorAll('.medal-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.medal === 'all');
    });

    switchViewMode('individual');
  }
}

// グローバルにinitAppを公開（Firestoreローダーから呼ばれる）
window.initApp = initApp;

// 万が一firebase-data.jsから呼ばれなかった場合の自動起動フォールバック
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!appInitialized && (window.ATHLETES_DATA || typeof ATHLETES_DATA !== 'undefined')) {
        console.log('[Olympian] フォールバックで初期化を実行します');
        initApp();
      }
    }, 1500);
  });
} else {
  setTimeout(() => {
    if (!appInitialized && (window.ATHLETES_DATA || typeof ATHLETES_DATA !== 'undefined')) {
      console.log('[Olympian] フォールバックで初期化を実行します');
      initApp();
    }
  }, 1500);
}
