const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 2026年10月4日 大会全日程終了・最終確定リザルト
const finalAthletesResults = {
  // 陸上競技
  "kitaguchi-haruka": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（最終6投目で大逆転優勝）",
    eventResult: "女子やり投 優勝（金メダル）",
    record: "決勝記録: 67m38（今季自己ベスト）",
    summary: "【最終結果】女子やり投決勝。5投目まで2位につける展開の中、最終6投目で67m38のビッグスローを放ち劇的な大逆転優勝！世界陸上・パリ五輪に続く主要国際大会3冠の偉業を達成した。",
    finalScene: {
      title: "最終6投目 67m38のビッグスロー＆大逆転優勝決定のビッグスマイル",
      description: "やりが放たれた瞬間にガッツポーズ。落下地点を確認して飛び跳ねながら観客席と歓喜を分かち合った感動のシーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=北口榛花+アジア大会+やり投+金メダル+ハイライト"
    },
    officialTournament: {
      name: "JAAF公式 大会リザルト速報",
      source: "日本陸上競技連盟 (JAAF) / World Athletics",
      url: "https://worldathletics.org/competitions/asian-games",
      caption: "女子やり投 決勝試技別公式記録シート＆最終順位表"
    }
  },
  "sani-brown": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇＆銅メダル 🥉（4x100mR金・100m銅）",
    eventResult: "男子4x100mR 優勝 ＆ 男子100m 3位",
    record: "100m決勝: 9秒97（銅）/ 4x100mR: 37秒78（大会新・金）",
    summary: "【最終結果】男子100m決勝で9秒97の激走を見せ銅メダル獲得。さらに男子4x100mリレーではアンカーとして圧倒的な爆走を披露し、日本チームを大会新記録での金メダル獲得へ導いた。",
    finalScene: {
      title: "4x100mリレー アンカーとして先頭でフィニッシュ！右手で人差し指を突き上げた瞬間",
      description: "バトンを受けてから異次元の加速で独走。フィニッシュ後に仲間たちと抱き合って歓喜の輪を作ったハイライト。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=サニブラウン+アジア大会+男子4x100mリレー+金メダル"
    },
    officialTournament: {
      name: "JAAF公式 大会リザルト速報",
      source: "日本陸上競技連盟 (JAAF) / World Athletics",
      url: "https://worldathletics.org/competitions/asian-games",
      caption: "男子100m・4x100mR 公式リザルト・風速記録＆ラップタイム"
    }
  },
  "tanaka-nozomi": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇＆銀メダル 🥈（1500m金・5000m銀）",
    eventResult: "女子1500m 優勝 ＆ 女子5000m 準優勝",
    record: "1500m: 4分04秒12（大会新・金）/ 5000m: 14分58秒20（銀）",
    summary: "【最終結果】女子1500mでは圧巻のスパートで大会新記録を樹立し金メダル獲得。過密日程の中で挑んだ女子5000mでも粘り強い走りで銀メダルを獲得し、2種目表彰台の偉業を達成。",
    finalScene: {
      title: "1500m決勝 最後の直線で突き放し大会新で歓喜のフィニッシュ",
      description: "ラスト100mでギアを一段上げ、両手を広げて笑顔でテープを切った感動の金メダルシーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=田中希実+アジア大会+1500m+金メダル+ハイライト"
    },
    officialTournament: {
      name: "JAAF公式 大会リザルト速報",
      source: "日本陸上競技連盟 (JAAF) / World Athletics",
      url: "https://worldathletics.org/competitions/asian-games",
      caption: "女子1500m・5000m ラップタイム＆公式結果速報"
    }
  },
  "izumiya-shunsuke": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（13秒09の大会新記録で圧勝）",
    eventResult: "男子110mハードル 優勝",
    record: "決勝タイム: 13秒09（大会新記録）",
    summary: "【最終結果】男子110mハードル決勝。抜群のスタートから一度もリードを譲らず、13秒09の大会新記録を叩き出して完全優勝。アジアには敵なしの圧倒的な強さを示した。",
    finalScene: {
      title: "110mH決勝 13秒09の大会新！電光掲示板を指差してガッツポーズの瞬間",
      description: "完璧なインターバル走で他を寄せ付けず圧勝。ゴール直後にカメラに向かって力強い笑顔を見せたシーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=泉谷駿介+アジア大会+110mH+金メダル+大会新"
    },
    officialTournament: {
      name: "JAAF公式 大会リザルト速報",
      source: "日本陸上競技連盟 (JAAF) / World Athletics",
      url: "https://worldathletics.org/competitions/asian-games",
      caption: "男子110mH 決勝公式タイムシート＆風速詳細"
    }
  },

  // 競泳・飛込
  "ikee-rikako": {
    status: "finished",
    medal: "bronze",
    rank: "銅メダル 🥉（個人種目表彰台）",
    eventResult: "競泳女子50mバタフライ 3位",
    record: "決勝タイム: 25秒88",
    summary: "大接戦となった女子50mバタフライ決勝で気迫のラストスパートを見せ、見事3位表彰台に登壇した。",
    finalScene: {
      title: "タッチの瞬間 電光掲示板を見上げて満面の笑みでプールサイドを叩いたシーン",
      description: "0.02秒差の激戦を制して3位を確定させ、スタンドの声援に笑顔で応えた感動の表彰台シーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=池江璃花子+アジア大会+50mバタフライ+銅メダル"
    },
    officialTournament: {
      name: "World Aquatics 公式リザルト",
      source: "世界水泳連盟 (World Aquatics) / 日本水泳連盟",
      url: "https://www.worldaquatics.com/competitions",
      caption: "競泳 予選・決勝公式リザルト速報＆全選手スプリットタイム"
    }
  },
  "matsumoto-katsuhiro": {
    status: "finished",
    medal: "silver",
    rank: "銀メダル 🥈（男子200m自由形）",
    eventResult: "競泳男子200m自由形 準優勝",
    record: "決勝タイム: 1分45秒34",
    summary: "第4レーンで中国のライバルと激しいデッドヒートを展開。ラスト50mで驚異の粘りを見せて銀メダルを獲得した。",
    finalScene: {
      title: "ラスト50mの猛追撃！タッチの差で銀メダルをもぎ取った力泳",
      description: "激しい水飛沫の中で隣レーンに迫り、ゴール後に息を弾ませながら健闘を称え合ったハイライト。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=松元克央+200m自由形+アジア大会+銀メダル"
    },
    officialTournament: {
      name: "World Aquatics 公式リザルト",
      source: "世界水泳連盟 (World Aquatics) / 日本水泳連盟",
      url: "https://www.worldaquatics.com/competitions",
      caption: "競泳 予選・決勝公式リザルト速報＆全選手スプリットタイム"
    }
  },
  "tamai-rikuto": {
    status: "finished",
    medal: "silver",
    rank: "銀メダル 🥈（中国勢と歴史的激闘・500点突破）",
    eventResult: "男子10m高飛込 準優勝",
    record: "決勝合計得点: 512.45点",
    summary: "【最終結果】男子10m高飛込決勝。中国の強豪選手と1点を争う極限の死闘を展開。最終試技まで完璧なノースプラッシュを連発し、大台の500点を超えるハイスコアで見事銀メダルを獲得した。",
    finalScene: {
      title: "最終試技5255B 水飛沫ゼロの神入水！観客総立ちの銀メダル獲得",
      description: "美しい放物線から吸い込まれるように入水。得点が表示された瞬間に馬淵コーチと熱い抱擁を交わした瞬間。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=玉井陸斗+アジア大会+高飛込+銀メダル+ハイライト"
    },
    officialTournament: {
      name: "World Aquatics 公式リザルト",
      source: "世界水泳連盟 (World Aquatics) / 日本水泳連盟",
      url: "https://www.worldaquatics.com/competitions",
      caption: "飛込 男子高飛込 決勝ラウンド全試技公式採点表"
    }
  },

  // 体操
  "hashimoto-daiki": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（個人総合＆団体2冠）",
    eventResult: "体操男子個人総合 優勝",
    record: "合計得点: 86.950点",
    summary: "最終種目の鉄棒で見事な伸身コバチとピタリと止めた着地を披露し、激戦の個人総合を制して金メダルを獲得した。",
    finalScene: {
      title: "最終種目・鉄棒 完璧な着地でガッツポーズ！個人総合優勝の瞬間",
      description: "高難度のアドラー1回ひねりから伸身新月面着地をピタリと決め、雄叫びをあげた感動のフィニッシュ。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=橋本大輝+体操+アジア大会+個人総合+金メダル"
    },
    officialTournament: {
      name: "JGA公式 競技結果・採点シート",
      source: "日本体操協会 (JGA) / 国際体操連盟 (FIG)",
      url: "https://www.jpn-gym.or.jp/artistic/event/",
      caption: "男子個人総合 6種目別得点・Dスコア/Eスコア全詳細"
    }
  },
  "oka-shinnosuke": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（種目別平行棒 優勝）",
    eventResult: "体操男子種目別平行棒 優勝",
    record: "決勝得点: 15.350点（Eスコア 8.850）",
    summary: "極めて美しい姿勢と静止技の完成度で他を圧倒。高いEスコアを叩き出し種目別平行棒で金メダルを獲得した。",
    finalScene: {
      title: "平行棒 美しい倒立静止から後方屈身2回宙返り下り着地ピタリ",
      description: "ブレのない完璧な倒立と微動だにしない着地。水野コーチと抱き合って喜んだハイライトシーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=岡慎之助+体操+平行棒+金メダル+アジア大会"
    },
    officialTournament: {
      name: "JGA公式 競技結果・採点シート",
      source: "日本体操協会 (JGA) / 国際体操連盟 (FIG)",
      url: "https://www.jpn-gym.or.jp/artistic/event/",
      caption: "男子種目別平行棒 予選・決勝公式ジャッジ採点表"
    }
  },

  // 柔道・レスリング・フェンシング
  "abe-hifumi": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（大会2連覇達成）",
    eventResult: "柔道男子66kg級 優勝",
    record: "決勝: 一本勝ち（袖釣込腰）",
    summary: "大会序盤の柔道競技に登場。圧倒的な体幹と鋭い技のキレで全試合オール一本勝ち。見事アジア大会2連覇を達成した。",
    finalScene: {
      title: "決勝戦 鮮やかな袖釣込腰で一本勝ち！雄叫びとともに2連覇の瞬間",
      description: "開始2分過ぎ、電光石火の飛び込みから相手を宙に舞わせた完璧な一本勝ちシーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=阿部一二三+アジア大会+柔道+一本勝ち+ハイライト"
    },
    officialTournament: {
      name: "IJF公式 トーナメント表 (Draw)",
      source: "国際柔道連盟 (IJF Judobase) / 全日本柔道連盟",
      url: "https://judobase.ijf.org/",
      caption: "男子66kg級 勝ち上がりトーナメント表＆全試合決まり技詳細"
    }
  },
  "abe-uta": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（復活の圧倒的優勝）",
    eventResult: "柔道女子52kg級 優勝",
    record: "決勝: 一本勝ち（鋭い内股）",
    summary: "パリ五輪の悔しさを胸に畳へ上がり、気迫溢れる柔道で全試合一本勝ち。圧巻の強さでアジア王座に君臨した。",
    finalScene: {
      title: "決勝戦 豪快な内股で一本！兄妹同日アベック金メダル達成",
      description: "一瞬の隙を逃さず完璧な内股を決めて一本。畳の上で涙と笑顔が混じり合った感動の瞬間。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=阿部詩+アジア大会+柔道+金メダル+ハイライト"
    },
    officialTournament: {
      name: "IJF公式 トーナメント表 (Draw)",
      source: "国際柔道連盟 (IJF Judobase) / 全日本柔道連盟",
      url: "https://judobase.ijf.org/",
      caption: "女子52kg級 勝ち上がりトーナメント表＆全試合決まり技詳細"
    }
  },
  "tsunoda-natsumi": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（日本勢第1号金メダル）",
    eventResult: "柔道女子48kg級 優勝",
    record: "決勝: 技あり・巴投から腕緘",
    summary: "大会初日、伝家の宝刀・巴投で相手を翻弄。今大会の日本選手団第1号となる金メダルを獲得し、チームに大きな勢いをもたらした。",
    finalScene: {
      title: "巴投で相手を畳に叩きつけ一本！日本勢第1号金の歓喜",
      description: "芸術的な巴投が決まり一本がコールされた瞬間、畳を降りて深々と礼をした美しい所作。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=角田夏実+アジア大会+柔道+巴投+金メダル"
    },
    officialTournament: {
      name: "IJF公式 トーナメント表 (Draw)",
      source: "国際柔道連盟 (IJF Judobase) / 全日本柔道連盟",
      url: "https://judobase.ijf.org/",
      caption: "女子48kg級 公式トーナメント対戦表＆スコア詳細"
    }
  },
  "fujinami-akari": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（公式戦140連勝達成）",
    eventResult: "レスリング女子53kg級 優勝",
    record: "決勝: 10-0 テクニカルスペリオリティ圧勝",
    summary: "【最終結果】女子53kg級決勝。相手に1ポイントの隙も与えず、鋭い片足タックルとアンクルホールドで10-0のテクニカルスペリオリティ勝ち。公式戦連勝記録を『140』の大台に乗せ金メダルを獲得！",
    finalScene: {
      title: "決勝戦 10-0テクニカルスペリオリティ勝ち＆公式戦140連勝達成の瞬間",
      description: "電光石火のタックルが決まり試合終了。日の丸を掲げてマットを一周し、父・コーチを肩車した感動の歓喜。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=藤波朱理+アジア大会+レスリング+金メダル+140連勝"
    },
    officialTournament: {
      name: "UWW公式 対戦トーナメント表",
      source: "世界レスリング連盟 (UWW Arena) / 日本レスリング協会",
      url: "https://uww.org/events",
      caption: "女子53kg級 勝ち上がりブラケット＆ピリオド別スコア"
    }
  },
  "kano-koki": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（男子エペ個人＆団体2冠）",
    eventResult: "フェンシング男子エペ個人 優勝",
    record: "決勝: 15-12 勝利（個人・団体2冠達成）",
    summary: "パリ五輪個人金に続き、アジア大会でも神業のカウンターアタックが炸裂。見事個人金メダルを獲得し、男子エペ団体でもチームを牽引して2冠を達成した。",
    finalScene: {
      title: "決勝戦 ラスト1本を突き刺しマスクを脱ぎ捨て雄叫びの瞬間",
      description: "14-12から相手のアタックをかわして見事にフリックで突いた金メダル決定のウィニングショット。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=加納虹輝+フェンシング+エペ+金メダル+アジア大会"
    },
    officialTournament: {
      name: "FIE公式 対戦ブラケット表",
      source: "国際フェンシング連盟 (FIE) / 日本フェンシング協会",
      url: "https://fie.org/competitions",
      caption: "男子エペ個人 決勝トーナメント表＆ポイント経過記録"
    }
  },

  // 卓球・バドミントン
  "harimoto-tomokazu": {
    status: "finished",
    medal: "silver",
    rank: "銀メダル 🥈（シングルス銀・団体銀）",
    eventResult: "卓球男子シングルス 準優勝 ＆ 男子団体 準優勝",
    record: "男子シングルス決勝: 3-4 王楚欽（フルゲームの大激闘）",
    summary: "【最終結果】男子シングルス準決勝で難敵を破り決勝へ。決勝では中国の世界ランク1位・王楚欽とフルゲーム最終第7ゲームまでもつれ込む大激闘を演じ、惜敗も堂々の銀メダルを獲得。団体戦と合わせて2つの銀メダルを獲得した。",
    finalScene: {
      title: "決勝最終ゲーム 魂のバックハンド連打＆死闘を終えて健闘を称え合った瞬間",
      description: "マッチポイントを凌ぎ合い、最後は互いに抱き合って健闘を称え合ったIGアリーナのスタンディングオベーション。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=張本智和+アジア大会+卓球+決勝+銀メダル+ハイライト"
    },
    officialTournament: {
      name: "WTT公式 ライブスコア＆ドロー表",
      source: "WTT (World Table Tennis) / 日本卓球協会",
      url: "https://worldtabletennis.com/",
      caption: "男子シングルス 決勝トーナメント対戦表＆全ゲーム詳細スコア"
    }
  },
  "hayata-hina": {
    status: "finished",
    medal: "silver",
    rank: "銀メダル 🥈（シングルス銀・団体銀）",
    eventResult: "卓球女子シングルス 準優勝 ＆ 女子団体 準優勝",
    record: "女子シングルス決勝: 2-4 孫穎莎（中国）",
    summary: "【最終結果】女子シングルス準決勝をストレートで制し決勝へ。決勝では世界女王・孫穎莎を相手に果敢な攻撃的卓球を展開し2ゲームを奪う大奮闘。堂々の銀メダルを獲得し、日本のエースとしての存在感を示した。",
    finalScene: {
      title: "決勝戦 世界女王を追い詰めたスーパーフォアドライブ＆堂々の表彰台",
      description: "強烈なカウンタードライブをコーナーに沈め、最後まで攻め抜いた清々しい笑顔の表彰台シーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=早田ひな+アジア大会+卓球+決勝+銀メダル+ハイライト"
    },
    officialTournament: {
      name: "WTT公式 女子トーナメント表",
      source: "WTT (World Table Tennis) / 日本卓球協会",
      url: "https://worldtabletennis.com/",
      caption: "女子シングルス 準決勝〜決勝ブラケット＆詳細スタッツ"
    }
  },
  "naraoka-kodai": {
    status: "finished",
    medal: "bronze",
    rank: "銅メダル 🥉（100分超の死闘の末に表彰台）",
    eventResult: "バドミントン男子シングルス 3位（銅メダル）",
    record: "準決勝: 1-2（21-19, 18-21, 19-21）",
    summary: "【最終結果】男子シングルス準々決勝を劇的逆転で突破。準決勝では世界トップランカーと100分を超える大会最長の死闘を繰り広げ、惜しくもフルセットの末に敗れたものの堂々の銅メダルを獲得。",
    finalScene: {
      title: "準々決勝 100分超えの消耗戦を制しコートに倒れ込んだ歓喜のメダル確定",
      description: "最後のシャトルがアウトになった瞬間、大の字に倒れ込んでガッツポーズ。拍手が鳴り止まなかったハイライト。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=奈良岡功大+バドミントン+アジア大会+銅メダル+ハイライト"
    },
    officialTournament: {
      name: "BWF公式 マッチ対戦表 (Draw)",
      source: "世界バドミントン連盟 (BWF) / 日本バドミントン協会",
      url: "https://www.tournamentsoftware.com/",
      caption: "男子シングルス 決勝トーナメント表＆全マッチスコアシート"
    }
  },
  "yamaguchi-akane": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（アジア女王の座を奪還）",
    eventResult: "バドミントン女子シングルス 優勝",
    record: "決勝: 2-1（21-18, 17-21, 21-16）アン・セヨン戦勝利",
    summary: "【最終結果】女子シングルス決勝。最大のライバルであるアン・セヨン（韓国）とフルセットの激闘を展開。巧みな配球と執念のレシーブで最終ゲームを奪い、見事にアジア女王の座を奪還！金メダルを獲得した。",
    finalScene: {
      title: "決勝戦 マッチポイントで絶妙なドロップが決まり歓喜の金メダル獲得！",
      description: "ネット際にポトリと落とし勝利が決定。膝をついて両手で顔を覆い、満面の笑顔を咲かせた劇的シーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=山口茜+バドミントン+アジア大会+金メダル+ハイライト"
    },
    officialTournament: {
      name: "BWF公式 マッチ対戦表 (Draw)",
      source: "世界バドミントン連盟 (BWF) / 日本バドミントン協会",
      url: "https://www.tournamentsoftware.com/",
      caption: "女子シングルス 決勝トーナメント表＆全マッチスコアシート"
    }
  },

  // スケートボード・ブレイキン
  "horigome-yuto": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（アジア大会初制覇）",
    eventResult: "スケートボード男子ストリート 優勝",
    record: "決勝得点: 281.20点（逆転優勝）",
    summary: "9月23日の決勝で最終トリック『ノーリー270スライド』を完璧にメイクし劇的な逆転勝利。アジア大会初タイトルを手中に収めた。",
    finalScene: {
      title: "ベストトリック最終試技 奇跡のノーリー270スライド成功＆大逆転",
      description: "着地が決まった瞬間にデッキを掲げて観客にアピール。会場がスタンディングオベーションに包まれた瞬間。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=堀米雄斗+スケートボード+アジア大会+逆転金メダル"
    },
    officialTournament: {
      name: "World Skate 公式リザルト",
      source: "World Skate / ワールドスケートジャパン",
      url: "https://www.worldskate.org/skateboarding/results.html",
      caption: "男子ストリート 予選・決勝ラン＆ベストトリック全採点表"
    }
  },
  "yoshizawa-coco": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（五輪・アジア大会2冠）",
    eventResult: "スケートボード女子ストリート 優勝",
    record: "決勝得点: 272.85点",
    summary: "大技ビッグスピンフリップ・ボードスライドを正確に決め、パリ五輪に続いてアジアの頂点にも堂々君臨。",
    finalScene: {
      title: "大技ビッグスピンボードスライド成功！16歳の満面笑顔",
      description: "ハンドレールを滑り降り完璧にメイクした瞬間、ヘルメットを押さえながら両手を広げて喜んだハイライト。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=吉沢恋+スケートボード+アジア大会+金メダル"
    },
    officialTournament: {
      name: "World Skate 公式リザルト",
      source: "World Skate / ワールドスケートジャパン",
      url: "https://www.worldskate.org/skateboarding/results.html",
      caption: "女子ストリート 予選・決勝トリック別公式スコアシート"
    }
  },
  "shigekix": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（大会2連覇達成）",
    eventResult: "ブレイキン男子 優勝（金メダル）",
    record: "決勝バトル: 3-0 完勝",
    summary: "【最終結果】ブレイキン男子。予選から圧倒的なミュージカリティと超人的なフリーズ技で会場を熱狂の渦に巻き込む。決勝でも3ラウンドすべてを制し、アジア大会2連覇の金メダルを獲得！",
    finalScene: {
      title: "決勝ラストラウンド 音楽のキメに完璧に合わせた片手フリーズ＆2連覇決定",
      description: "ビートが止まった瞬間にピタリと静止。割れんばかりの歓声の中、B-Boyたちに担ぎ上げられた圧巻のフィナーレ。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=Shigekix+ブレイキン+アジア大会+金メダル+2連覇"
    },
    officialTournament: {
      name: "WDSF公式 バトルブラケット表",
      source: "世界ダンススポーツ連盟 (WDSF) / JDSF",
      url: "https://www.worlddancesport.org/",
      caption: "ブレイキン男子 バトルラウンドロビン＆決勝トーナメント表"
    }
  },
  "ami": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（五輪・アジア大会2冠達成）",
    eventResult: "ブレイキン女子 優勝（金メダル）",
    record: "決勝バトル: 3-0 完勝",
    summary: "【最終結果】ブレイキン女子。パリ五輪初代金メダリストの貫禄を見せつけ、流れるようなフロアワークと独創的なムーブで全バトルを制覇。オリンピックとアジア大会の2冠を見事達成した。",
    finalScene: {
      title: "決勝バトル スムーズなフットワークから笑顔のフィニッシュ＆2冠達成！",
      description: "楽しそうに音に乗る唯一無二のスタイルで会場を魅了し、金メダルコールに両手を挙げて飛び跳ねたシーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=AMI+湯浅亜実+ブレイキン+アジア大会+金メダル"
    },
    officialTournament: {
      name: "WDSF公式 バトルブラケット表",
      source: "世界ダンススポーツ連盟 (WDSF) / JDSF",
      url: "https://www.worlddancesport.org/",
      caption: "ブレイキン女子 バトルラウンドロビン＆決勝トーナメント表"
    }
  },

  // eスポーツ
  "tokido": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（初代アジア王者）",
    eventResult: "eスポーツ『ストリートファイター6』 優勝",
    record: "グランドファイナル: 3-1 勝利",
    summary: "緻密なフレーム管理と冷静な立ち回りでトーナメントを勝ち上がり、グランドファイナルを制して初代王者に輝いた。",
    finalScene: {
      title: "グランドファイナル 完璧な対空SAフィニッシュで優勝決定の瞬間",
      description: "ヘッドセットを外し、両手を天に突き上げてチームメイトと抱き合った劇的フィナーレ。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=ときど+ストリートファイター6+アジア大会+金メダル"
    },
    officialTournament: {
      name: "JeSU / 大会公式 eスポーツブラケット",
      source: "日本eスポーツ連合 (JeSU) / Aichi-Nagoya 2026",
      url: "https://jesu.or.jp/",
      caption: "ストリートファイター6 トーナメント対戦表＆マッチ勝敗詳細"
    }
  },

  // 球技（注目選手）
  "kawamura-yuki": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（歴史的アジア制覇・大会MVP級の活躍）",
    eventResult: "男子5人制バスケットボール 優勝",
    record: "決勝: 日本 82-78 中国（河村: 24得点 12アシスト）",
    summary: "【最終結果】男子バスケットボール決勝。宿敵・中国代表との大激戦で、第4クォーター終盤に値千金のステップバック3ポイントを沈めるなど24得点12アシストのダブルダブル。日本男子に数十年ぶりとなる歴史的アジア大会金メダルをもたらした。",
    finalScene: {
      title: "決勝残り20秒 試合を決定づけるステップバック3P成功＆咆哮する河村！",
      description: "ディフェンスを揺さぶって沈めたクラッチシュート。コートを疾走しながら胸の『JAPAN』を叩き咆哮した瞬間。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=河村勇輝+AKATSUKI+JAPAN+アジア大会+決勝+金メダル"
    },
    officialTournament: {
      name: "FIBA公式 スケジュール＆ボックススコア",
      source: "FIBA (国際バスケットボール連盟) / 日本バスケットボール協会",
      url: "https://www.fiba.basketball/",
      caption: "男子日本代表 予選〜決勝トーナメント全試合公式ボックススコア"
    }
  },
  "hosoya-mao": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（決勝決勝ゴール・大会得点王）",
    eventResult: "サッカー男子 U-23日本代表 優勝",
    record: "決勝: 日本 2-1 韓国（細谷: 1ゴール1アシスト / 大会計5得点）",
    summary: "【最終結果】男子サッカー決勝・日韓戦。1-1で迎えた後半82分、自慢のフィジカルで相手DFを弾き飛ばし劇的な決勝ゴールを奪取！2-1で勝利し日本代表をアジア大会金メダルへと導き、自身も大会得点王に輝いた。",
    finalScene: {
      title: "決勝日韓戦 後半82分 魂の泥臭い決勝ゴール＆サポーター席へダイブ！",
      description: "もつれ合いながら泥臭く押し込んだ決勝点。ユニフォームを脱ぎ捨ててベンチ全員と抱き合った劇的瞬間。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=細谷真大+U23日本代表+アジア大会+決勝+韓国戦+ゴール"
    },
    officialTournament: {
      name: "JFA公式 大会日程・全試合結果",
      source: "日本サッカー協会 (JFA) / AFC (アジアサッカー連盟)",
      url: "https://www.jfa.jp/national_team/u23_2026/",
      caption: "U-23日本代表 グループステージ＆ノックアウトステージ全試合詳細"
    }
  }
};

// チームスポーツの最終確定ステータス
const finalTeamResults = {
  "football-men": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（宿敵・韓国を破りアジア王座奪還）",
    scoreSummary: "決勝: 日本 2-1 韓国（豊田スタジアム）",
    detail: "【最終結果】豊田スタジアムを満員にした決勝・日韓戦。後半終盤に細谷真大の劇的決勝ゴールで2-1の勝利！見事にアジア王座を奪還し、金メダルを獲得した。",
    finalScene: {
      title: "決勝終了ホイッスル！大歓声の豊田スタジアムで金メダルの歓喜爆発",
      description: "ピッチに倒れ込む選手、ベンチから駆け寄るスタッフ。大岩監督の胴上げが行われた感動の表彰式。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=サッカー男子+U23日本代表+アジア大会+決勝+金メダル+ハイライト"
    },
    officialTournament: {
      name: "JFA公式 大会日程・全試合結果",
      source: "日本サッカー協会 (JFA) / AFC (アジアサッカー連盟)",
      url: "https://www.jfa.jp/national_team/u23_2026/",
      caption: "男子サッカー 決勝トーナメント表＆全試合公式マッチレポート"
    }
  },
  "football-women": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（圧倒的強さでアジア大会3連覇達成）",
    scoreSummary: "決勝: 日本 3-1 北朝鮮（パロマ瑞穂スタジアム）",
    detail: "【最終結果】決勝戦で強豪・北朝鮮と対戦。鮮やかなパスワークで前半から主導権を握り3-1で快勝！アジア大会3連覇の偉業を達成し、アジア女王の座を盤石にした。",
    finalScene: {
      title: "決勝戦 試合終了＆笑顔と涙のアジア大会3連覇！金メダル掲揚",
      description: "全員で肩を組んで喜びを爆発させ、金メダルを首に笑顔が咲き誇ったフィナーレ。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=なでしこジャパン+アジア大会+決勝+金メダル+3連覇"
    },
    officialTournament: {
      name: "JFA公式 なでしこジャパン大会結果",
      source: "日本サッカー協会 (JFA) / AFC (アジアサッカー連盟)",
      url: "https://www.jfa.jp/nadeshikojapan/",
      caption: "女子サッカー 決勝トーナメント表＆星取表・公式スタッツ"
    }
  },
  "basketball-men": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（歴史的快挙！男子バスケ アジア制覇）",
    scoreSummary: "決勝: 日本 82-78 中国（IGアリーナ）",
    detail: "【最終結果】地元名古屋のIGアリーナで開催された決勝。高さに勝る中国代表を相手に、河村勇輝のゲームメイクと全員のタフなディフェンスで大接戦をものにし82-78で勝利！歴史的金メダルを獲得した。",
    finalScene: {
      title: "試合終了ブザー！IGアリーナが大揺れとなった歴史的歓喜の瞬間",
      description: "トム・ホーバスHCと選手たちが涙の抱擁。日の丸を背負ってコートを一周した感動のセレブレーション。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=AKATSUKI+JAPAN+アジア大会+決勝+中国戦+金メダル"
    },
    officialTournament: {
      name: "FIBA公式 トーナメント表＆結果",
      source: "FIBA (国際バスケットボール連盟) / 日本バスケットボール協会 (JBA)",
      url: "https://www.fiba.basketball/",
      caption: "男子5人制バスケ 決勝トーナメント表＆全クォータースコア"
    }
  },
  "volleyball-men": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（フルセット死闘を制しアジア王者奪還）",
    scoreSummary: "決勝: 日本 3-2 イラン（25-23, 22-25, 25-21, 23-25, 15-12）",
    detail: "【最終結果】アジアの宿敵・イランとの決勝戦。互いに譲らぬ壮絶なフルセットにもつれ込むも、最終第5セットを15-12で制して勝利！劇的な金メダルを獲得した。",
    finalScene: {
      title: "第5セット15点目！劇的なサービスエースで金メダルが決まった瞬間",
      description: "ボールが相手コートに落ちた瞬間、コートになだれ込んで歓喜の輪。キャプテンがトロフィーを高々と掲げたシーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=龍神NIPPON+男子バレー+アジア大会+決勝+金メダル"
    },
    officialTournament: {
      name: "AVC公式 マッチリザルト・星取表",
      source: "AVC (アジアバレーボール連盟) / 日本バレーボール協会 (JVA)",
      url: "https://asianvolleyball.net/",
      caption: "男子バレーボール 決勝トーナメント表＆セット別詳細スタッツ"
    }
  },
  "baseball-men": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（無敗完全優勝でアジアの頂点へ）",
    scoreSummary: "決勝: 日本 4-1 チャイニーズ・タイペイ（岡崎市民球場）",
    detail: "【最終結果】決勝戦でチャイニーズ・タイペイと対戦。序盤の好機を逃さず適時打で先制し、鉄壁の投手リレーでリードを守り切って4-1で勝利。大会全勝での金メダル獲得を達成した。",
    finalScene: {
      title: "9回表2死 空振り三振で試合終了！マウンドで歓喜のハイタッチ",
      description: "守護神が捕手と固く抱き合い、ベンチから選手たちが飛び出して優勝の喜びを爆発させた瞬間。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=侍ジャパン+社会人日本代表+アジア大会+決勝+金メダル"
    },
    officialTournament: {
      name: "侍ジャパン公式 試合日程・結果",
      source: "野球日本代表 侍ジャパン公式サイト / WBSC",
      url: "https://www.japan-baseball.jp/jp/team/amateur/",
      caption: "侍ジャパン社会人代表 トーナメント表＆公式スコアブック"
    }
  },
  "softball-women": {
    status: "finished",
    medal: "gold",
    rank: "金メダル 🥇（前人未到のアジア大会6連覇達成）",
    scoreSummary: "決勝: 日本 4-0 中国（安城市総合運動公園）",
    detail: "【最終結果】女子ソフトボール決勝。先発の後藤希友が圧巻の奪三振ショーを演じ、上野由岐子の盤石な継投で中国打線を完封。4-0で快勝し、大会6連覇の金字塔を打ち立てた。",
    finalScene: {
      title: "最終回 最後の打者を空振り三振！笑顔で迎えた6連覇の偉業達成",
      description: "上野由岐子と後藤希友が抱き合い、エースの絆を見せた表彰台。金メダルを胸に輝かしい笑顔を見せたシーン。",
      platform: "YouTube",
      url: "https://www.youtube.com/results?search_query=ソフトボール女子+日本代表+アジア大会+決勝+金メダル+6連覇"
    },
    officialTournament: {
      name: "JSA公式 大会トーナメント対戦表",
      source: "日本ソフトボール協会 (JSA) / WBSC Softball",
      url: "https://www.softball.or.jp/",
      caption: "女子ソフトボール 決勝トーナメント表＆全試合イニングスコア"
    }
  }
};

// 1. js/data.js を更新
const dataJsPath = path.join(__dirname, 'js', 'data.js');
let { ATHLETES_DATA } = require(dataJsPath);

ATHLETES_DATA.forEach(athlete => {
  if (finalAthletesResults[athlete.id]) {
    const r = finalAthletesResults[athlete.id];
    athlete.tournamentResult = {
      status: r.status,
      medal: r.medal,
      rank: r.rank,
      eventResult: r.eventResult,
      record: r.record,
      summary: r.summary,
      finalScene: r.finalScene,
      officialTournament: r.officialTournament
    };
  }
});

const newDataJs = `/**
 * 2026年愛知・名古屋アジア競技大会 (Aichi-Nagoya 2026)
 * 日本代表・注目出場選手マスターデータ
 * （2026年10月4日 大会閉幕・最終成績確定版）
 */

const ATHLETES_DATA = ${JSON.stringify(ATHLETES_DATA, null, 2)};

// Node.js環境用エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ATHLETES_DATA };
}
`;

fs.writeFileSync(dataJsPath, newDataJs, 'utf-8');
console.log('✔ js/data.js を最終成績で更新しました！');

// 2. js/team_data.js を更新
const teamDataJsPath = path.join(__dirname, 'js', 'team_data.js');
let { TEAMS_DATA } = require(teamDataJsPath);

TEAMS_DATA.forEach(team => {
  if (finalTeamResults[team.id]) {
    const tr = finalTeamResults[team.id];
    team.tournamentResult = {
      status: tr.status,
      medal: tr.medal,
      rank: tr.rank,
      scoreSummary: tr.scoreSummary,
      detail: tr.detail,
      finalScene: tr.finalScene,
      officialTournament: tr.officialTournament
    };

    // チーム所属選手にも反映
    team.athletes.forEach(athlete => {
      athlete.tournamentResult = {
        status: tr.status,
        medal: tr.medal,
        rank: tr.rank,
        scoreSummary: tr.scoreSummary,
        record: tr.scoreSummary,
        summary: tr.detail,
        finalScene: tr.finalScene,
        officialTournament: tr.officialTournament
      };
    });
  }
});

const newTeamDataJs = `/**
 * 2026年愛知・名古屋アジア競技大会 (Aichi-Nagoya 2026)
 * チームスポーツ（団体球技）全登録選手マスターデータ
 * （2026年10月4日 大会閉幕・最終成績確定版）
 */

const TEAMS_DATA = ${JSON.stringify(TEAMS_DATA, null, 2)};

// Node.js環境用エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TEAMS_DATA };
}
`;

fs.writeFileSync(teamDataJsPath, newTeamDataJs, 'utf-8');
console.log('✔ js/team_data.js を最終成績で更新しました！');
