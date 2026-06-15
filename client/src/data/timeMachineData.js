export const TIME_MACHINE_EVENTS = [
  {
    id: "evt_0001",
    title: "開學典禮暨新生訓練",
    location: "中正紀念館",
    x: 75.95,
    y: 27.61,
    timestamp: "2025-09-08T09:00:00",
    duration_minutes: 240,
    popularity_score: 95,
    source: "北科大教務處",
    type: "校級活動",
    message: "各位大一新生大家好！歡迎來到北科大，請盡速入座，典禮即將開始！",
    sceneId: 'ntut_campus',
    quest: {
      title: "【限時】參加開學典禮",
      description: "在典禮結束前抵達中正紀念館。"
    },
    detective_clue: "有人在新生開學那天的集會上掉了一個重要的入學指南... 記得大概是 9月8日 早上？"
  },
  {
    id: "evt_0002",
    title: "全校社團博覽會",
    location: "圖書館",
    x: 62.22,
    y: 59.25,
    timestamp: "2025-09-10T10:00:00",
    duration_minutes: 360,
    popularity_score: 120,
    source: "學務處課外活動指導組",
    type: "大型活動",
    message: "快來看看有沒有喜歡的社團！吉他社、熱舞社、還有機研社都在招新喔！",
    sceneId: 'ntut_campus',
    quest: {
      title: "【限時】社團博覽會",
      description: "去圖書館前逛逛社團攤位。"
    },
    detective_clue: "大馬同學說想加社團，但錯過了 9月10日 的社團博覽會，我們回去幫他拿份宣傳單吧！"
  },
  {
    id: "evt_0003",
    title: "資工系迎新茶會",
    location: "第六教學大樓",
    x: 36.66,
    y: 26.76,
    timestamp: "2025-09-15T18:30:00",
    duration_minutes: 150,
    popularity_score: 50,
    source: "資工系學會IG",
    type: "系所活動",
    message: "學弟妹們晚上好！等下有抽獎跟分家活動，披薩已經叫好囉！"
  },
  {
    id: "evt_0004",
    title: "第一次期中考週起跑",
    location: "圖書館",
    x: 62.22,
    y: 59.25,
    timestamp: "2025-11-03T08:00:00",
    duration_minutes: 1440, // 一整天
    popularity_score: 200,
    source: "Dcard北科版",
    type: "學術事件",
    message: "天啊，微積分跟普物全部擠在同一天考，圖書館已經沒位子了啦！"
  },
  {
    id: "evt_0005",
    title: "耶誕點燈演唱會",
    location: "中正紀念館",
    x: 75.95,
    y: 27.61,
    timestamp: "2025-12-24T18:00:00",
    duration_minutes: 240,
    popularity_score: 150,
    source: "北科大學生會FB",
    type: "節慶活動",
    message: "Merry Christmas！今晚有超強卡司陣容，現場還有市集跟熱紅酒喔！"
  },
  {
    id: "evt_0006",
    title: "期末考最後衝刺",
    location: "綜合科館",
    x: 74.80,
    y: 78.57,
    timestamp: "2026-01-08T10:00:00",
    duration_minutes: 600,
    popularity_score: 80,
    source: "Dcard北科版",
    type: "學術事件",
    message: "綜合科館自習室大爆滿... 大家都在死命念資料結構。"
  },
  {
    id: "evt_0007",
    title: "下學期開學日",
    location: "行政大樓",
    x: 69.71,
    y: 76.38,
    timestamp: "2026-02-16T08:00:00",
    duration_minutes: 480,
    popularity_score: 60,
    source: "校方公告",
    type: "行政事件",
    message: "開學第一天，要去教務處補交選課單的人請排隊！"
  },
  {
    id: "evt_0008",
    title: "北科大校慶園遊會",
    location: "第一教學大樓",
    x: 31.02,
    y: 33.66,
    timestamp: "2026-10-31T09:00:00", // 注意：這通常在上學期，這裡先排進 timeline
    duration_minutes: 420,
    popularity_score: 180,
    source: "校方公告",
    type: "校級活動",
    message: "校慶園遊會開始啦！各系攤位都在第一教學大樓跟操場周邊，快來捧場！",
    sceneId: 'ntut_campus',
    quest: {
      title: "【限時】校慶園遊會",
      description: "在園遊會收攤前趕到第一教學大樓。"
    },
    detective_clue: "聽說 10月30日 的校慶園遊會有賣限量版紀念品，快回到那一天搶購吧！"
  },
  {
    id: "evt_0009",
    title: "僑生迎新聚餐",
    location: "光華館",
    x: 15.91,
    y: 7.56,
    timestamp: "2025-09-20T17:00:00",
    duration_minutes: 180,
    popularity_score: 40,
    source: "馬來西亞同學會",
    type: "社團活動",
    message: "大馬的新生們快過來集合！等下我們要一起去吃火鍋囉！"
  },
  {
    id: "evt_0010",
    title: "校園尋寶大賽",
    location: "校史館",
    x: 30.56,
    y: 51.02,
    timestamp: "2026-04-01T13:00:00",
    duration_minutes: 300,
    popularity_score: 70,
    source: "謎題社",
    type: "社團活動",
    message: "愚人節特別企劃：校史館藏著第一代校長的秘密手稿，快來解謎！"
  }
];

export const HISTORICAL_WEATHER = [
  {
    start: "2025-09-08T00:00:00",
    end: "2025-09-09T23:59:59",
    type: "rain_heavy",
    intensity: 1.0
  },
  {
    start: "2025-09-10T00:00:00",
    end: "2025-09-10T12:00:00",
    type: "wind_strong",
    intensity: 0.8
  },
  {
    start: "2025-11-03T00:00:00",
    end: "2025-11-03T23:59:59",
    type: "rain_light",
    intensity: 0.4
  },
  {
    start: "2025-12-24T18:00:00",
    end: "2025-12-24T23:59:59",
    type: "earthquake",
    intensity: 0.6
  }
];
