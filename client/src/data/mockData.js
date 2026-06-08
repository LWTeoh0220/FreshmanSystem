export const culturalMappings = [
  { term: "IC", processId: "arc_process" },
  { term: "身份證", processId: "arc_process" },
  { term: "居留證", processId: "arc_process" },
  { term: "ARC", processId: "arc_process" },
  
  { term: "Digi", processId: "sim_process" },
  { term: "Maxis", processId: "sim_process" },
  { term: "Celcom", processId: "sim_process" },
  { term: "電話卡", processId: "sim_process" },
  { term: "SIM卡", processId: "sim_process" },
  { term: "門號", processId: "sim_process" },
  
  { term: "戶口", processId: "bank_process" },
  { term: "Maybank", processId: "bank_process" },
  { term: "銀行", processId: "bank_process" },
  { term: "開戶", processId: "bank_process" },
  
  { term: "看醫生", processId: "health_process" },
  { term: "生病", processId: "health_process" },
  { term: "體檢", processId: "health_process" },
  { term: "Medical", processId: "health_process" },
  
  { term: "選課", processId: "course_process" },
  { term: "排課", processId: "course_process" },
  { term: "學分", processId: "course_process" }
];

export const processGraphsData = {
  pre_arrival_luggage: {
    id: 'pre_arrival_luggage',
    title: '赴台行李與物資準備清單',
    type: 'checklist',
    nodes: [
      { id: 'lug_1', title: '帶齊大馬護照與北科大錄取通知書正本', description: '最重要的通關文件，建議影印備份' },
      { id: 'lug_2', title: '準備個人日常習慣藥品與南洋家鄉醬料 (Milo/肉骨茶包)', description: '初來乍到可能會有水土不服，家鄉味能撫慰心靈' },
      { id: 'lug_3', title: '準備符合台灣電壓 (110V) 的轉換插頭', description: '大馬電壓是 240V，插頭形狀不同，務必準備轉接頭' }
    ]
  },
  pre_arrival_health: {
    id: 'pre_arrival_health',
    title: '海外預檢作業清單',
    type: 'checklist',
    nodes: [
      { id: 'hea_1', title: '在大馬當地醫院完成僑外生體檢並拿到 X 光片報告正本', description: '需確保體檢項目符合台灣衛福部規定' },
      { id: 'hea_2', title: '辦理麻疹及德國麻疹 (MMR) 疫苗接種證明', description: '若無證明則需在台灣重新施打' }
    ]
  },
  arc_process: {
    id: 'arc_process',
    title: '居留證申請 (ARC)',
    nodes: [
      { id: 'arc_1', title: '入學許可證與簽證', description: '確認已取得馬來西亞辦事處核發的居留簽證' },
      { id: 'arc_2', title: '辦理台灣手機門號', description: '攜帶雙證件(護照、入學許可)前往電信局' },
      { id: 'arc_3', title: '申請居留證 (ARC)', description: '至移民署網站填表，這是所有手續的核心', isMilestone: true, achievementIcon: 'id-card', achievementName: '合法居民' }
    ],
    edges: [
      { from: 'arc_1', to: 'arc_2' },
      { from: 'arc_2', to: 'arc_3' }
    ]
  },
  sim_process: {
    id: "sim_process",
    title: "申辦台灣手機門號",
    nodes: [
      { id: "sim_1", title: "攜帶雙證件正本", description: "護照與入台許可證 (或大學錄取通知書)。" },
      { id: "sim_2", title: "年滿 18 歲確認", description: "若未滿 18 歲需監護人同意書或學校代辦手續。" },
      { id: "sim_3", title: "前往電信門市", description: "尋找校園附近的中華電信、台灣大哥大或遠傳門市。" },
      { id: "sim_4", title: "選擇學生方案並開通", description: "辦理預付卡或月租型學生專案，現場開通網路。" }
    ],
    edges: [
      { from: "sim_1", to: "sim_3" },
      { from: "sim_2", to: "sim_3" },
      { from: "sim_3", to: "sim_4" }
    ]
  },
  bank_process: {
    id: 'bank_process',
    title: '銀行開戶',
    nodes: [
      { id: 'bank_1', title: '取得統一證號或 ARC', description: '必須有證號才能開戶' },
      { id: 'bank_2', title: '郵局/銀行開戶', description: '攜帶 ARC、印章與新台幣1000元開戶', isMilestone: true, achievementIcon: 'wallet', achievementName: '財富自由的第一步' }
    ],
    edges: [
      { from: "bank_1", to: "bank_2" }
    ]
  },
  health_process: {
    id: 'health_process',
    title: '新生體檢與保險',
    nodes: [
      { id: 'health_1', title: '線上預約體檢', description: '前往學校合作醫院網站預約' },
      { id: 'health_2', title: '完成體檢', description: '攜帶護照前往醫院抽血照X光', isMilestone: true, achievementIcon: 'activity', achievementName: '鋼鐵之軀' },
      { id: 'health_3', title: '辦理學生保險', description: '將體檢報告與保險費繳交給衛保組', isMilestone: true, achievementIcon: 'shield-check', achievementName: '安全保障' }
    ],
    edges: [
      { from: 'health_1', to: 'health_2' },
      { from: 'health_2', to: 'health_3' }
    ]
  },
  course_process: {
    id: 'course_process',
    title: '選課系統',
    nodes: [
      { id: 'course_1', title: '登入教務系統', description: '使用學號與預設密碼登入' },
      { id: 'course_2', title: '初選志願填報', description: '根據系所必修學分表填寫志願', isMilestone: true, achievementIcon: 'book-open', achievementName: '學霸誕生' }
    ],
    edges: [
      { from: 'course_1', to: 'course_2' }
    ]
  },
  main_quest: {
    id: 'main_quest',
    title: '大馬新生主線引導任務 (Main Quest)',
    nodes: [
      { id: 'mq_visa', title: '【階段一】行前準備', description: '確認簽證與機票，準備出發。', suggestedTime: '出發前 2 週', targetProcessId: null },
      { id: 'mq_phone', title: '【階段二】通訊辦理', description: '辦理台灣手機門號，確保能接收各種驗證碼。', suggestedTime: '抵台當日', targetProcessId: null },
      { id: 'mq_arc', title: '【階段三】合法居留', description: '點擊進入詳細流程：申請中華民國居留證 (ARC)。', suggestedTime: '抵台 15 日內', targetProcessId: 'arc_process' },
      { id: 'mq_bank', title: '【階段四】財務與開戶', description: '點擊進入詳細流程：辦理郵局或銀行開戶。', suggestedTime: '取得 ARC 後 3 日內', targetProcessId: 'bank_process' },
      { id: 'mq_health', title: '【階段五】體檢保險', description: '點擊進入詳細流程：新生體檢與保險辦理。', suggestedTime: '開學前 1 週', targetProcessId: 'health_process' },
      { id: 'mq_course', title: '【階段六】教務選課', description: '點擊進入詳細流程：登入系統與初選。', suggestedTime: '選課系統開放期間', targetProcessId: 'course_process' }
    ],
    edges: [
      { from: 'mq_visa', to: 'mq_phone' },
      { from: 'mq_phone', to: 'mq_arc' },
      { from: 'mq_arc', to: 'mq_bank' },
      { from: 'mq_bank', to: 'mq_health' },
      { from: 'mq_health', to: 'mq_course' }
    ]
  }
};

export const initialDeadlines = [
  // 4 Pre-departure Events (Active during May-July)
  { id: "dl_pre_1", title: "赴台行李與物資採購", startDate: "2026-05-01T00:00:00+08:00", endDate: "2026-08-20T23:59:59+08:00", priority: "high", processId: "arc_process" },
  { id: "dl_pre_2", title: "入學與居留簽證申辦", startDate: "2026-05-15T00:00:00+08:00", endDate: "2026-08-10T23:59:59+08:00", priority: "high", processId: "arc_process" },
  { id: "dl_pre_3", title: "海外預先體檢作業", startDate: "2026-05-20T00:00:00+08:00", endDate: "2026-08-15T23:59:59+08:00", priority: "medium", processId: "health_process" },
  { id: "dl_pre_4", title: "開學分級測驗先修準備", startDate: "2026-05-25T00:00:00+08:00", endDate: "2026-08-30T23:59:59+08:00", priority: "low", processId: "course_process" },

  // 9 Official Arrival Events (August - September)
  { id: "dl_1", title: "網路預選課", startDate: "2026-08-19T09:00:00+08:00", endDate: "2026-09-01T17:00:00+08:00", priority: "high", processId: "course_process" },
  { id: "dl_2", title: "第一學期學費繳費", startDate: "2026-08-21T09:00:00+08:00", endDate: "2026-09-04T15:30:00+08:00", priority: "high", processId: "bank_process" },
  { id: "dl_3", title: "學期住宿開放", startDate: "2026-08-29T08:00:00+08:00", endDate: "2026-09-01T12:00:00+08:00", priority: "high", processId: "arc_process" },
  { id: "dl_4", title: "馬來西亞新生聚餐", startDate: "2026-08-30T18:00:00+08:00", endDate: "2026-08-30T21:00:00+08:00", priority: "low", processId: "health_process" },
  { id: "dl_5", title: "新生入學檢查", startDate: "2026-08-31T08:30:00+08:00", endDate: "2026-08-31T16:30:00+08:00", priority: "medium", processId: "health_process" },
  { id: "dl_6", title: "新生分級測驗", startDate: "2026-09-01T09:00:00+08:00", endDate: "2026-09-01T12:00:00+08:00", priority: "medium", processId: "course_process" },
  { id: "dl_7", title: "大學入門新生營", startDate: "2026-09-02T08:00:00+08:00", endDate: "2026-09-03T17:00:00+08:00", priority: "high", processId: "arc_process" },
  { id: "dl_8", title: "僑外生新生座談會", startDate: "2026-09-04T13:30:00+08:00", endDate: "2026-09-04T16:30:00+08:00", priority: "high", processId: "arc_process" },
  { id: "dl_9", title: "大學部開學典禮", startDate: "2026-09-07T09:00:00+08:00", endDate: "2026-09-07T12:00:00+08:00", priority: "medium", processId: "arc_process" }
];

export const sideQuests = [
  {
    id: "sq_1",
    title: "【解鎖數位錢包】",
    description: "在新手村（台灣）生存，無現金支付是必備技能。將銀行帳戶綁定至 LINE Pay 或街口支付，從此出門只需帶手機。",
    status: "locked",
    requirements: [
      { text: "已開通台灣銀行帳戶" },
      { 
        text: "持有台灣手機門號", 
        itemTooltip: {
          title: "【道具：台灣手機門號卡】",
          purpose: "解鎖台灣各式行動支付、網銀帳戶的關鍵道具。",
          guide: "攜帶護照與居留證/入台證，前往學校附近的各大電信辦理。新生推薦辦理預付卡或學生專案。"
        }
      }
    ],
    rewards: ["日常結帳速度 +50%", "解鎖現金回饋技能"],
    icon: "smartphone"
  },
  {
    id: "sq_2",
    title: "【環保勇者：雲端發票】",
    description: "台灣的發票是可以中獎的！申請手機條碼載具，結帳時出示條碼，發票自動存入雲端，甚至有專屬獎項。",
    status: "available",
    requirements: [
      { text: "下載統一發票兌獎 APP" },
      { text: "完成信箱驗證" }
    ],
    rewards: ["自動對獎功能", "環保值 +100", "額外中獎機率提升"],
    icon: "leaf"
  },
  {
    id: "sq_3",
    title: "【成為新手村長】",
    description: "學校宿舍正在招募區長 (Dorm Manager)。這是累積人脈與賺取外快的絕佳機會。",
    status: "locked",
    requirements: [
      { text: "居住於校內宿舍" },
      { text: "完成所有主線任務" }
    ],
    rewards: ["每月金幣 (薪水) 獎勵", "解鎖領導力技能", "宿舍期末保障名額"],
    icon: "crown"
  }
];
