/**
 * 選手個別詳細ページ動的描画スクリプト (detail.js)
 */

let detailInitialized = false;

function initDetail() {
  if (detailInitialized) return;
  detailInitialized = true;

  const ATHLETES_DATA = window.ATHLETES_DATA || (typeof window.ATHLETES_DATA !== 'undefined' ? window.ATHLETES_DATA : (typeof ATHLETES_DATA !== 'undefined' ? ATHLETES_DATA : []));

  const container = document.getElementById('detailContainer');
  const params = new URLSearchParams(window.location.search);
  const athleteId = params.get('id');

  const athlete = ATHLETES_DATA.find(a => a.id === athleteId) || ATHLETES_DATA[0];
  if (!athlete) return;

  const currentIndex = ATHLETES_DATA.findIndex(a => a.id === athlete.id);
  const prevAthlete = currentIndex > 0 ? ATHLETES_DATA[currentIndex - 1] : ATHLETES_DATA[ATHLETES_DATA.length - 1];
  const nextAthlete = currentIndex < ATHLETES_DATA.length - 1 ? ATHLETES_DATA[currentIndex + 1] : ATHLETES_DATA[0];

  document.title = `${athlete.name}（${athlete.sport}・${athlete.event}）| 2026年愛知・名古屋アジア大会 日本代表選手名鑑`;

  const badgesHtml = (athlete.badges || []).map(b => 
    `<span class="detail-badge-item">🏅 ${b}</span>`
  ).join('');

  const highlightsHtml = (athlete.detailedProfile.highlights || []).map(h => `
    <div class="timeline-item">
      <span class="tl-year">${h.year}</span>
      <span class="tl-title">${h.title}</span>
      <span class="tl-result">${h.result}</span>
    </div>
  `).join('');

  const linksHtml = (athlete.detailedProfile.officialLinks || []).map(l => `
    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="ext-link-chip">
      <span>🔗</span>
      <span>${l.label}</span>
    </a>
  `).join('');

  const snsHtml = (athlete.snsAccounts || []).map(s => {
    let platformClass = 'sns-official';
    let icon = '🌐';
    if (s.platform.includes('Instagram')) { platformClass = 'sns-instagram'; icon = '📷'; }
    else if (s.platform.includes('X')) { platformClass = 'sns-x'; icon = '𝕏'; }
    else if (s.platform.includes('YouTube')) { platformClass = 'sns-youtube'; icon = '▶️'; }
    return `<a href="${s.url}" target="_blank" rel="noopener noreferrer" class="sns-chip-link ${platformClass}" title="${athlete.name}公式 ${s.platform}">
      <span>${icon}</span>
      <span>${s.platform}: ${s.handle}</span>
    </a>`;
  }).join('');

  const c = athlete.critique;
  const critiqueHtml = c ? `
        <!-- 専門家・メディアによる客観的批評 -->
        <section class="section-block">
          <h2 class="section-header-title">
            <span class="sec-icon">🧐</span>
            <span>専門家・メディアによる客観的分析・批評</span>
          </h2>
          <div class="critique-container">
            ${c.summaryVerdict ? `
            <div class="verdict-banner">
              <span class="verdict-tag">総合評価・展望</span>
              <p class="verdict-text">${c.summaryVerdict}</p>
            </div>
            ` : ''}
            <div class="critique-grid">
              <div class="critique-card positive">
                <div class="critique-header">
                  <div class="critique-title">
                    <span>✨</span>
                    <span>強み・世界トップ水準の評価</span>
                  </div>
                </div>
                <p class="critique-body">${c.positive}</p>
                <div class="critique-source-box">
                  <span class="source-label">出典・ソース:</span>
                  <span>${c.positiveSource}</span>
                </div>
              </div>

              <div class="critique-card critical">
                <div class="critique-header">
                  <div class="critique-title">
                    <span>⚠️</span>
                    <span>課題・懸念される客観的事実</span>
                  </div>
                </div>
                <p class="critique-body">${c.critical}</p>
                <div class="critique-source-box">
                  <span class="source-label">出典・ソース:</span>
                  <span>${c.criticalSource}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
  ` : '';

  container.innerHTML = `
    <!-- パンくず & アクションバー -->
    <div class="nav-breadcrumbs-bar">
      <a href="index.html" class="back-link">
        <span>←</span>
        <span>競技・選手一覧へ戻る</span>
      </a>

      <div class="page-actions-group">
        <button class="action-btn-print" onclick="window.print()" title="このページを印刷またはPDF保存">
          <span>🖨️</span>
          <span>印刷 / PDF保存</span>
        </button>
      </div>
    </div>

    <!-- メイン詳細カード -->
    <article class="athlete-detail-card">
      
      <!-- ヒーローセクション -->
      <section class="detail-hero">
        <div class="detail-photo-wrap">
          <img src="${athlete.photoUrl}" alt="${athlete.name} 選手の顔写真" style="object-position: ${athlete.photoPosition || 'center 20%'};">
        </div>

        <div class="detail-hero-info">
          <div class="detail-cat-badge">
            <span>${athlete.categoryName}</span>
            <span>•</span>
            <span>${athlete.sport} / ${athlete.event}</span>
          </div>
          
          <span class="detail-kana">${athlete.kana}</span>
          <h1 class="detail-name">${athlete.name}</h1>
          <div class="detail-romaji">${athlete.romaji}</div>

          <div class="detail-affiliation">
            <span>🏢 所属:</span> <strong>${athlete.affiliation}</strong>
          </div>

          <div class="detail-badges-list">
            ${badgesHtml}
          </div>

          <div class="detail-catchphrase-box">
            ${athlete.catchphrase}
          </div>

          ${snsHtml ? `
          <!-- 公式SNSアカウント -->
          <div class="athlete-sns-row">
            ${snsHtml}
          </div>
          ` : ''}
        </div>
      </section>

      <!-- 詳細情報ボディ -->
      <div class="detail-content-body">
        
        <!-- 基本プロフィール表 -->
        <div class="profile-meta-grid">
          <div class="meta-item-cell">
            <span class="meta-label">生年月日 / 年齢</span>
            <span class="meta-val">${athlete.birthDate}（${athlete.age}歳）</span>
          </div>
          <div class="meta-item-cell">
            <span class="meta-label">出身地</span>
            <span class="meta-val">${athlete.birthPlace}</span>
          </div>
          <div class="meta-item-cell">
            <span class="meta-label">身長 / 体重</span>
            <span class="meta-val">${athlete.heightWeight}</span>
          </div>
          <div class="meta-item-cell">
            <span class="meta-label">代表種目</span>
            <span class="meta-val">${athlete.event}</span>
          </div>
        </div>

        <!-- 今大会結果＆最後のシーン -->
        ${athlete.tournamentResult ? `
        <section class="section-block tournament-result-block">
          <h2 class="section-header-title">
            <span class="sec-icon">🏅</span>
            <span>愛知・名古屋2026 今大会最終結果</span>
          </h2>
          <div class="modal-result-box" style="margin-bottom: 24px;">
            <div class="modal-result-header">
              <span class="modal-result-rank">${athlete.tournamentResult.rank}</span>
              <span class="modal-result-record">${athlete.tournamentResult.record}</span>
            </div>
            <p style="font-size: 0.92rem; color: #f1f5f9; line-height: 1.6; margin: 0 0 14px;">${athlete.tournamentResult.summary}</p>
            ${athlete.tournamentResult.finalScene ? `
            <div style="background: rgba(0,0,0,0.35); border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
              <div style="font-size: 0.85rem; font-weight: 800; color: #f87171; margin-bottom: 4px;">🎬 最後のシーン（決定的瞬間・ハイライト）</div>
              <div style="font-size: 0.85rem; color: #cbd5e0; margin-bottom: 10px; line-height: 1.5;">${athlete.tournamentResult.finalScene.description}</div>
              <a href="${athlete.tournamentResult.finalScene.url}" target="_blank" rel="noopener noreferrer" class="btn-final-scene-link" style="font-size: 0.82rem; padding: 7px 16px;">
                <span>▶️</span> <span>【${athlete.tournamentResult.finalScene.platform}】${athlete.tournamentResult.finalScene.title} を見る</span>
              </a>
            </div>
            ` : ''}
            ${athlete.tournamentResult.officialTournament ? `
            <div style="background: rgba(30, 58, 138, 0.3); border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 8px; padding: 12px 14px;">
              <div style="font-size: 0.85rem; font-weight: 800; color: #60a5fa; margin-bottom: 4px;">📊 公式トーナメント表・競技記録速報（Draw/Results）</div>
              <div style="font-size: 0.85rem; color: #e2e8f0; margin-bottom: 10px; line-height: 1.5;">${athlete.tournamentResult.officialTournament.caption}</div>
              <a href="${athlete.tournamentResult.officialTournament.url}" target="_blank" rel="noopener noreferrer" class="btn-tournament-link" style="font-size: 0.82rem; padding: 7px 16px;">
                <span>📊</span> <span>【${athlete.tournamentResult.officialTournament.source}】${athlete.tournamentResult.officialTournament.name} を見る ➔</span>
              </a>
            </div>
            ` : ''}
          </div>
        </section>
        ` : ''}

        <!-- 選手経歴・ストーリー -->
        <section class="section-block">
          <h2 class="section-header-title">
            <span class="sec-icon">📖</span>
            <span>経歴・これまでの歩み</span>
          </h2>
          <p class="section-text">
            ${athlete.detailedProfile.bio}
          </p>
        </section>

        <!-- 主な戦績・ハイライト -->
        <section class="section-block">
          <h2 class="section-header-title">
            <span class="sec-icon">🏆</span>
            <span>主要大会ハイライト戦績</span>
          </h2>
          <div class="timeline-list">
            ${highlightsHtml}
          </div>
        </section>

        <!-- プレイスタイルと強み -->
        <section class="section-block">
          <h2 class="section-header-title">
            <span class="sec-icon">⚡</span>
            <span>プレイスタイル＆世界を制する武器</span>
          </h2>
          <p class="section-text">
            ${athlete.detailedProfile.playStyle}
          </p>
        </section>

        ${critiqueHtml}

        <!-- 2026年愛知・名古屋大会への意気込み -->
        <section class="section-block">
          <h2 class="section-header-title">
            <span class="sec-icon">💬</span>
            <span>愛知・名古屋2026への決意とメッセージ</span>
          </h2>
          <div class="quote-message-box">
            <p>${athlete.detailedProfile.message2026}</p>
          </div>
        </section>

        <!-- 競技日程・観戦ガイド -->
        <section class="section-block">
          <h2 class="section-header-title">
            <span class="sec-icon">📅</span>
            <span>大会スケジュール＆観戦のツボ</span>
          </h2>
          <div class="schedule-box">
            <div class="schedule-card-inner">
              <div class="sched-title">🗓️ 出場予定日程・会場</div>
              <div class="sched-text">${athlete.detailedProfile.schedule}</div>
            </div>
            <div class="schedule-card-inner">
              <div class="sched-title">👀 観戦の注目ポイント</div>
              <div class="sched-text">${athlete.detailedProfile.viewingPoints}</div>
            </div>
          </div>
        </section>

        <!-- 関連リンク -->
        ${linksHtml ? `
        <section class="section-block">
          <h2 class="section-header-title">
            <span class="sec-icon">🌐</span>
            <span>関連情報・外部リンク</span>
          </h2>
          <div class="links-flex-wrap">
            ${linksHtml}
          </div>
        </section>
        ` : ''}

      </div>
    </article>

    <!-- 前後の選手ナビゲーション -->
    <nav class="athlete-prev-next-nav" aria-label="他の選手へのナビゲーション">
      <a href="athlete.html?id=${prevAthlete.id}" class="pn-btn pn-prev">
        <span class="pn-dir">← 前の選手</span>
        <span class="pn-name">${prevAthlete.name}（${prevAthlete.sport}）</span>
      </a>
      <a href="index.html" class="pn-btn" style="text-align: center; justify-content: center; max-width: 160px;">
        <span class="pn-dir">一覧</span>
        <span class="pn-name">選手名鑑TOP</span>
      </a>
      <a href="athlete.html?id=${nextAthlete.id}" class="pn-btn pn-next" style="text-align: right;">
        <span class="pn-dir">次の選手 →</span>
        <span class="pn-name">${nextAthlete.name}（${nextAthlete.sport}）</span>
      </a>
    </nav>
  `;

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
  }
}

// グローバルにinitAppとして公開（firebase-data.jsから呼ばれる）
window.initApp = initDetail;

// 万が一firebase-data.jsが使われない場合の自動起動フォールバック
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!detailInitialized && (window.ATHLETES_DATA || typeof ATHLETES_DATA !== 'undefined')) {
        initDetail();
      }
    }, 1500);
  });
} else {
  setTimeout(() => {
    if (!detailInitialized && (window.ATHLETES_DATA || typeof ATHLETES_DATA !== 'undefined')) {
      initDetail();
    }
  }, 1500);
}
