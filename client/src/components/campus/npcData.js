export const NPC_DATA = [
  {
    id: "npc_01",
    name: "迷路的學長",
    type: 1, // 閒聊漫步
    sheet: "s01",
    startX: 47.49,
    startY: 33.96,
    radius: 10,
    messages: [
      "哎呀，我又在校園裡迷路了...",
      "你知道第六教學大樓在哪裡嗎？我都找不到。",
      "聽說北科大的地下道可以通往另一個次元呢！"
    ]
  },
  {
    id: "npc_02",
    name: "通識小精靈",
    type: 2, // 知識問答
    sheet: "s02",
    startX: 31.02,
    startY: 33.66,
    radius: 5,
    messages: [
      "你好啊！身為北科新生，必須要了解畢業門檻喔！",
      "來考考你吧！"
    ],
    question: {
      text: "請問北科大的「英文畢業門檻」多益需要考幾分？",
      options: ["450分", "550分", "750分"],
      correctIndex: 1,
      correctResponse: "答對了！是 550 分！記得早點去考喔！",
      wrongResponse: "不對喔，正確答案是 550 分。要多加把勁！"
    }
  },
  {
    id: "npc_03",
    name: "吉他社幹部",
    type: 4, // 追蹤
    sheet: "s03",
    startX: 75.95,
    startY: 27.61,
    radius: 15,
    messages: [
      "同學！同學等一下！",
      "我看你骨骼精奇，是不是很想學吉他啊？",
      "晚上 7 點來中正館看我們的迎新表演吧！"
    ]
  },
  {
    id: "npc_04",
    name: "系辦公室主任",
    type: 3, // 任務發布
    sheet: "f01",
    startX: 52.0,
    startY: 31.0,
    radius: 0, // 固定不動
    messages: [
      "這位同學，記得按時繳交選課單喔。",
      "順便幫我一個忙好嗎？"
    ],
    quest: {
      id: "quest_faculty_01",
      title: "系辦的請託",
      description: "主任請你幫忙整理新生名單。",
      dueDateOffset: 24 * 60 * 60 * 1000 // 1 day
    }
  },
  {
    id: "npc_05",
    name: "熱舞社學姊",
    type: 4, // 追蹤
    sheet: "s04",
    startX: 19.12,
    startY: 70.08,
    radius: 20,
    messages: [
      "學弟！學妹！要不要來熱舞社看看啊！",
      "不用基礎也能學喔！"
    ]
  },
  {
    id: "npc_06",
    name: "趕早八的同學",
    type: 1, // 閒聊漫步
    sheet: "s05",
    startX: 14.68,
    startY: 34.73,
    radius: 15,
    messages: [
      "借過借過！微積分要遲到了！",
      "電梯怎麼等那麼久啦！"
    ]
  },
  {
    id: "npc_07",
    name: "資工系學長",
    type: 1, // 閒聊漫步
    sheet: "s06",
    startX: 25.92,
    startY: 65.4,
    radius: 8,
    messages: [
      "你的 Code 寫完了嗎？",
      "我昨晚 Debug 到天亮..."
    ]
  },
  {
    id: "npc_08",
    name: "校園導覽員",
    type: 2, // 知識問答
    sheet: "s07",
    startX: 48.1,
    startY: 50.98,
    radius: 6,
    messages: [
      "歡迎來到北科大！",
      "你知道離學校最近的捷運站是哪一站嗎？"
    ],
    question: {
      text: "離北科大最近的捷運站是哪一站？",
      options: ["忠孝復興站", "忠孝新生站", "善導寺站"],
      correctIndex: 1,
      correctResponse: "完全正確！忠孝新生站 4 號出口出來就是學校喔！",
      wrongResponse: "哎呀，是忠孝新生站喔！要記起來免得搭錯車。"
    }
  },
  {
    id: "npc_09",
    name: "系圖管理員",
    type: 1, // 閒聊漫步
    sheet: "f02",
    startX: 62.26,
    startY: 33.64,
    radius: 5,
    messages: [
      "圖書館內請保持安靜。",
      "借書記得要在期限內歸還喔。"
    ]
  },
  {
    id: "npc_10",
    name: "教授",
    type: 1, // 閒聊漫步
    sheet: "f03",
    startX: 14.56,
    startY: 64.34,
    radius: 10,
    messages: [
      "同學，那份期中專題的 Proposal 寫好了嗎？",
      "記得要用 LaTeX 排版啊。"
    ]
  },
  {
    id: "npc_11",
    name: "排球社社長",
    type: 4, // 追蹤
    sheet: "s08",
    startX: 64.24,
    startY: 27.16,
    radius: 18,
    messages: [
      "嘿！有興趣打排球嗎！",
      "我們新生盃需要你這樣的人才！"
    ]
  },
  {
    id: "npc_12",
    name: "美食通學姊",
    type: 1, // 閒聊漫步
    sheet: "s09",
    startX: 33.0,
    startY: 35.0,
    radius: 12,
    messages: [
      "中午要喫什麼好呢？光華商場附近的便當好像不錯。",
      "還是去喫新生南路對面的麪攤？"
    ]
  },
  {
    id: "npc_13",
    name: "宿舍幹部",
    type: 2, // 知識問答
    sheet: "s10",
    startX: 70.0,
    startY: 27.0,
    radius: 5,
    messages: [
      "同學好！我是學生宿舍的幹部。",
      "來測驗一下你的住宿常識吧！"
    ],
    question: {
      text: "學生宿舍的門禁時間通常是幾點？",
      options: ["晚上 10 點", "凌晨 12 點", "沒有門禁"],
      correctIndex: 2,
      correctResponse: "沒錯！北科大宿舍現在採取門禁刷卡制，只要帶卡就能自由進出！",
      wrongResponse: "錯囉，現在只要憑學生證刷卡，24小時都能進出的！"
    }
  },
  {
    id: "npc_14",
    name: "教務處職員",
    type: 3, // 任務發布
    sheet: "f04",
    startX: 49.0,
    startY: 32.0,
    radius: 0, // 固定不動
    messages: [
      "同學，麻煩幫我送一份公文到校長室。",
      "很急喔！"
    ],
    quest: {
      id: "quest_faculty_02",
      title: "緊急公文遞送",
      description: "將公文送達校長室完成手續。",
      dueDateOffset: 2 * 60 * 60 * 1000 // 2 hours
    }
  },
  {
    id: "npc_15",
    name: "工友叔叔",
    type: 1, // 閒聊漫步
    sheet: "f05",
    startX: 22.0,
    startY: 68.0,
    radius: 8,
    messages: [
      "同學，腳踏車不要亂停喔！",
      "這區的垃圾桶已經滿了，我待會來清。"
    ]
  }
];
