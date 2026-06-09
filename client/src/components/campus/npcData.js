export const NPC_DATA = [
  {
    id: "npc_01",
    name: "迷路的學長",
    type: 1, // 閒聊漫步
    sheet: "students",
    startX: 53.0,
    startY: 30.5,
    radius: 10,
    spriteX: 0,
    spriteY: 0,
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
    sheet: "students",
    startX: 51.5,
    startY: 33.5,
    radius: 5,
    spriteX: 1,
    spriteY: 0,
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
    sheet: "students",
    startX: 54.0,
    startY: 34.0,
    radius: 15,
    spriteX: 2,
    spriteY: 0,
    messages: [
      "同學！同學等一下！",
      "我看你骨骼精奇，是不是很想學吉他啊？",
      "晚上 7 點來中正館看我們的迎新表演吧！"
    ]
  },
  {
    id: "npc_04",
    name: "系辦公室主任", // changed from librarian to use faculty sprite
    type: 3, // 任務發布
    sheet: "faculty",
    startX: 52.0,
    startY: 31.0,
    radius: 0, // 固定不動
    spriteX: 0,
    spriteY: 0,
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
  }
];
