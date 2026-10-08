const MAX_WEEK = 12;
const MAX_AP = 4;
const MAX_ATTENDANCE = 99;

let week = 1;
let actionPoint = MAX_AP;
let schoolRep = 50;

let selectedStudentId = 1;
let students = [];

let logs = [];
let pendingAction = null;
let animationTimer = null;
let autoFinishTimer = null;
let currentActionImageIndex = 0;

const topStatus = document.getElementById("topStatus");
const studentsGrid = document.getElementById("studentsGrid");
const actionButtons = document.getElementById("actionButtons");
const nextWeekBtn = document.getElementById("nextWeekBtn");
const logArea = document.getElementById("logArea");

const actionModal = document.getElementById("actionModal");
const modalTitle = document.getElementById("modalTitle");
const modalActionImage = document.getElementById("modalActionImage");
const modalText = document.getElementById("modalText");
const skipAnimationBtn = document.getElementById("skipAnimationBtn");

const toast = document.getElementById("toast");
const resultScreen = document.getElementById("resultScreen");

const actions = [
  {
    id: "presentation",
    title: "発表中心の授業",
    icon: "🗣️",
    desc: "日本語で話す機会を増やす。自信につながるが、少し疲れる。",
    images: [
      "assets/actions/presentation_1.png",
      "assets/actions/presentation_2.png"
    ],
    modalText: "教室で発表練習をしています。最初は緊張しているようですが、少しずつ声が出てきました。"
  },
  {
    id: "practice",
    title: "課題制作・実習",
    icon: "💻",
    desc: "専門力を伸ばす。集中力が必要で疲労もたまりやすい。",
    images: [
      "assets/actions/practice_1.png",
      "assets/actions/practice_2.png"
    ],
    modalText: "課題制作に取り組んでいます。試行錯誤しながら、専門的な力を身につけています。"
  },
  {
    id: "exam",
    title: "資格・試験対策",
    icon: "📚",
    desc: "実力は伸びやすいが、負担が大きい。続けすぎるとメンタルに響く。",
    images: [
      "assets/actions/exam_1.png",
      "assets/actions/exam_2.png"
    ],
    modalText: "資格試験に向けて集中学習中です。成果は出やすいですが、かなり負担もかかっています。"
  },
  {
    id: "interview",
    title: "個別面談",
    icon: "🤝",
    desc: "話を聞き、信頼関係を作る。学力は直接伸びないが、安定しやすくなる。",
    images: [
      "assets/actions/interview_1.png",
      "assets/actions/interview_2.png"
    ],
    modalText: "個別面談をしています。不安や悩みを聞くことで、少し心が軽くなったようです。"
  },
  {
    id: "life_support",
    title: "生活相談",
    icon: "🏠",
    desc: "生活面の不安を減らす。出席率低下のリスクを抑えやすい。",
    images: [
      "assets/actions/life_support_1.png",
      "assets/actions/life_support_2.png"
    ],
    modalText: "生活面の相談に乗っています。住まい、アルバイト、手続きなどを一緒に整理しました。"
  },
  {
    id: "career_event",
    title: "企業・進学イベント",
    icon: "💼",
    desc: "進路意識を高める。刺激になる一方で、少し疲れる。",
    images: [
      "assets/actions/career_event_1.png",
      "assets/actions/career_event_2.png"
    ],
    modalText: "企業・進学イベントに参加しています。将来のイメージが少し具体的になってきました。"
  },
  {
    id: "rest",
    title: "休ませる",
    icon: "🌙",
    desc: "疲労を下げ、メンタルを整える。学習の進みは止まりやすい。",
    images: [
      "assets/actions/rest_1.png",
      "assets/actions/rest_2.png"
    ],
    modalText: "今日は無理をさせず、少し休ませました。休むことも、長く通い続けるためには大切です。"
  }
];

function initStudents() {
  students = [
    {
      id: 1,
      name: "アン",
      country: "ベトナム",
      gender: "女性",
      imageKey: "vietnam_female",
      goal: "IT就職",
      japanese: 42,
      skill: 36,
      career: 32,
      attendance: 99,
      life: 62,
      mental: 66,
      fatigue: 24,
      friendship: 40,
      handledThisWeek: false,
      ignoredWeeks: 0
    },
    {
      id: 2,
      name: "リン",
      country: "中国",
      gender: "女性",
      imageKey: "china_female",
      goal: "大学編入・資格取得",
      japanese: 68,
      skill: 38,
      career: 34,
      attendance: 99,
      life: 72,
      mental: 61,
      fatigue: 26,
      friendship: 40,
      handledThisWeek: false,
      ignoredWeeks: 0
    },
    {
      id: 3,
      name: "ラメシュ",
      country: "ネパール",
      gender: "男性",
      imageKey: "nepal_male",
      goal: "ホテル・観光就職",
      japanese: 36,
      skill: 46,
      career: 44,
      attendance: 99,
      life: 50,
      mental: 58,
      fatigue: 35,
      friendship: 40,
      handledThisWeek: false,
      ignoredWeeks: 0
    },
    {
      id: 4,
      name: "ミン",
      country: "ミャンマー",
      gender: "男性",
      imageKey: "myanmar_male",
      goal: "専門スキルで日本就職",
      japanese: 40,
      skill: 42,
      career: 30,
      attendance: 99,
      life: 48,
      mental: 54,
      fatigue: 32,
      friendship: 40,
      handledThisWeek: false,
      ignoredWeeks: 0
    }
  ];
}

function render() {
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  topStatus.innerHTML = `
    <div class="status-card">
      <div class="status-label">現在の週</div>
      <div class="status-main week-main">
        <span>${week}</span>
        <small>/</small>
        <span>${MAX_WEEK}</span>
      </div>
    </div>

    <div class="status-card">
      <div class="status-label">行動ポイント</div>
      <div class="status-main">${actionPoint}</div>
    </div>

    <div class="status-card">
      <div class="status-label">学校評価</div>
      <div class="status-main">${schoolRep}</div>
    </div>

    <div class="status-card">
      <div class="status-label">選択中</div>
      <div class="status-main selected-name">
        ${selectedStudent ? selectedStudent.name : "未選択"}
      </div>
    </div>
  `;

  studentsGrid.innerHTML = students.map(student => {
    const selectedClass = student.id === selectedStudentId ? "selected" : "";
    const warningClass = isWarningStudent(student) ? "warning" : "";
    const attendanceClass = student.attendance < 90 ? "danger" : "";

    return `
      <article class="student-card ${selectedClass} ${warningClass}" onclick="selectStudent(${student.id})">
        <div class="student-visual">
          <img src="${getStudentImage(student)}" alt="${student.name}" />
          <div class="attendance-badge ${attendanceClass}">
            出席 ${student.attendance}%
          </div>
        </div>

        <div class="student-body">
          <div class="student-name-row">
            <h3>${student.name}</h3>
            <span class="country">${student.country}・${student.gender}</span>
          </div>

          <p class="goal">目標：${student.goal}</p>

          <div class="pill-row">
            ${conditionPill(student)}
            ${friendshipPill(student)}
          </div>

          <div class="week-care ${student.handledThisWeek ? "done" : "todo"}">
            ${student.handledThisWeek ? "今週対応済み" : "今週未対応"}
          </div>

          <div class="param-list">
            ${statBar("日本語", student.japanese, "blue", levelLabel(student.japanese))}
            ${statBar("専門", student.skill, "green", levelLabel(student.skill))}
            ${statBar("進路", student.career, "purple", levelLabel(student.career))}
            ${statBar("生活", student.life, "orange", stabilityLabel(student.life))}
            ${statBar("心", student.mental, "sky", mentalLabel(student.mental))}
            ${statBar("疲労", student.fatigue, "red", fatigueLabel(student.fatigue))}
            ${statBar("友好", student.friendship, "pink", friendshipLabel(student.friendship))}
          </div>
        </div>
      </article>
    `;
  }).join("");

  actionButtons.innerHTML = actions.map(action => `
    <button
      class="action-btn"
      onclick="startAction('${action.id}')"
      ${actionPoint <= 0 || week > MAX_WEEK ? "disabled" : ""}
    >
      <div class="action-title">
        <span>${action.icon}</span>
        <span>${action.title}</span>
      </div>
      <div class="action-desc">${action.desc}</div>
    </button>
  `).join("");

  renderLogs();
}

function statBar(label, value, colorClass, textLabel) {
  const safeValue = clamp(Math.round(value), 0, 100);

  return `
    <div class="stat-bar-row">
      <div class="stat-bar-head">
        <span>${label}</span>
        <strong>${textLabel}</strong>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill ${colorClass}" style="width:${safeValue}%"></div>
      </div>
    </div>
  `;
}

function selectStudent(id) {
  selectedStudentId = id;
  render();
}

window.selectStudent = selectStudent;

function startAction(actionId) {
  if (week > MAX_WEEK) return;

  if (actionPoint <= 0) {
    showToast("今週の行動ポイントがありません。次の週へ進みましょう。");
    return;
  }

  const student = students.find(s => s.id === selectedStudentId);
  const action = actions.find(a => a.id === actionId);

  if (!student || !action) return;

  pendingAction = {
    studentId: student.id,
    actionId: action.id
  };

  modalTitle.textContent = `${student.name}さん：${action.title}`;
  modalText.textContent = action.modalText;

  currentActionImageIndex = 0;
  modalActionImage.src = action.images[currentActionImageIndex];

  actionModal.classList.remove("hidden");

  clearInterval(animationTimer);
  clearTimeout(autoFinishTimer);

  animationTimer = setInterval(() => {
    currentActionImageIndex = currentActionImageIndex === 0 ? 1 : 0;
    modalActionImage.src = action.images[currentActionImageIndex];
  }, 450);

  autoFinishTimer = setTimeout(() => {
    finishActionAnimation();
  }, 2200);
}

window.startAction = startAction;

function finishActionAnimation() {
  if (!pendingAction) return;

  clearInterval(animationTimer);
  clearTimeout(autoFinishTimer);

  actionModal.classList.add("hidden");

  const student = students.find(s => s.id === pendingAction.studentId);
  const action = actions.find(a => a.id === pendingAction.actionId);

  if (!student || !action) {
    pendingAction = null;
    return;
  }

  applyAction(student, action);
  pendingAction = null;

  render();
}

skipAnimationBtn.addEventListener("click", finishActionAnimation);

function applyAction(student, action) {
  actionPoint -= 1;

  student.handledThisWeek = true;
  student.ignoredWeeks = 0;

  const bonus = friendshipBonus(student);
  const penalty = conditionPenalty(student);

  let message = "";

  switch (action.id) {
    case "presentation": {
      change(student, "japanese", rand(5, 10) + bonus - penalty);
      change(student, "mental", rand(-2, 4) + Math.floor(student.friendship / 50));
      change(student, "fatigue", rand(5, 10));
      change(student, "friendship", rand(1, 4));
      message = `${student.name}さんは発表授業に参加しました。話す力に手応えが出てきました。`;
      break;
    }

    case "practice": {
      change(student, "skill", rand(6, 12) + bonus - penalty);
      change(student, "career", rand(1, 4));
      change(student, "fatigue", rand(6, 11));
      if (student.mental < 35) change(student, "mental", rand(-3, 0));
      message = `${student.name}さんは実習に取り組みました。専門的な作業に少し慣れてきました。`;
      break;
    }

    case "exam": {
      change(student, "japanese", rand(2, 6) + Math.floor(bonus / 2));
      change(student, "skill", rand(3, 8) + bonus - penalty);
      change(student, "career", rand(3, 7) + Math.floor(bonus / 2));
      change(student, "fatigue", rand(10, 17));
      change(student, "mental", rand(-7, -2));
      if (student.friendship < 35) change(student, "friendship", rand(-3, 0));
      message = `${student.name}さんは試験対策を頑張りました。成果はありますが、負担も大きかったようです。`;
      break;
    }

    case "interview": {
      change(student, "friendship", rand(5, 10));
      change(student, "mental", rand(5, 11));
      change(student, "life", rand(1, 4));
      change(student, "fatigue", rand(-6, -1));
      message = `${student.name}さんと面談しました。信頼関係が少し深まり、不安も整理できました。`;
      break;
    }

    case "life_support": {
      change(student, "life", rand(6, 12));
      change(student, "friendship", rand(3, 7));
      change(student, "mental", rand(1, 5));
      change(student, "fatigue", rand(-3, 2));
      message = `${student.name}さんの生活面をサポートしました。通学を続ける土台が安定してきました。`;
      break;
    }

    case "career_event": {
      change(student, "career", rand(6, 12) + bonus - penalty);
      change(student, "japanese", rand(1, 4));
      change(student, "mental", rand(-1, 5));
      change(student, "friendship", rand(1, 4));
      change(student, "fatigue", rand(5, 10));
      message = `${student.name}さんは企業・進学イベントに参加しました。将来のイメージが広がったようです。`;
      break;
    }

    case "rest": {
      change(student, "fatigue", rand(-24, -14));
      change(student, "mental", rand(4, 9));
      change(student, "friendship", rand(1, 4));

      if (Math.random() < 0.45) {
        change(student, "japanese", rand(-2, 0));
      }

      if (Math.random() < 0.45) {
        change(student, "skill", rand(-2, 0));
      }

      message = `${student.name}さんを休ませました。学習は進みませんが、体調と気持ちは少し整いました。`;
      break;
    }
  }

  normalizeStudent(student);
  addLog(message);
  showToast(message);
}

function change(student, key, amount) {
  student[key] += amount;
}

function friendshipBonus(student) {
  if (student.friendship >= 85) return rand(3, 5);
  if (student.friendship >= 70) return rand(2, 4);
  if (student.friendship >= 55) return rand(1, 3);
  if (student.friendship >= 40) return rand(0, 2);
  return rand(-2, 0);
}

function conditionPenalty(student) {
  let penalty = 0;

  if (student.fatigue >= 90) penalty += rand(3, 5);
  else if (student.fatigue >= 75) penalty += rand(1, 3);

  if (student.mental <= 25) penalty += rand(3, 5);
  else if (student.mental <= 40) penalty += rand(1, 3);

  if (student.life <= 30) penalty += rand(1, 3);

  return penalty;
}

function nextWeek() {
  if (week > MAX_WEEK) return;

  if (week === MAX_WEEK) {
    finishGame();
    return;
  }

  weeklyConditionChange();
  randomEvent();
  weeklyRelationshipDecay();
  weeklyAttendanceCheck();

  week += 1;
  actionPoint = MAX_AP;

  students.forEach(student => {
    student.handledThisWeek = false;
  });

  addLog(`第${week}週が始まりました。`);
  render();
}

nextWeekBtn.addEventListener("click", nextWeek);

function weeklyConditionChange() {
  students.forEach(student => {
    if (student.fatigue >= 80) {
      change(student, "mental", rand(-4, -1));
      change(student, "life", rand(-2, 0));
    }

    if (student.mental <= 35) {
      change(student, "japanese", rand(-2, 0));
      change(student, "skill", rand(-2, 0));
    }

    if (student.life <= 35) {
      change(student, "mental", rand(-3, 0));
    }

    change(student, "fatigue", rand(-6, -2));

    normalizeStudent(student);
  });
}

function randomEvent() {
  const target = pickRandom(students);

  const events = [
    () => {
      change(target, "mental", rand(3, 8));
      change(target, "friendship", rand(1, 4));
      return `${target.name}さんはクラスメイトと交流し、少し明るくなりました。`;
    },
    () => {
      change(target, "fatigue", rand(6, 12));
      change(target, "mental", rand(-4, -1));
      return `${target.name}さんはアルバイトが忙しく、少し疲れているようです。`;
    },
    () => {
      change(target, "japanese", rand(2, 6));
      change(target, "mental", rand(-2, 4));
      return `${target.name}さんは日本語でスピーチする機会がありました。`;
    },
    () => {
      change(target, "mental", rand(-8, -3));
      change(target, "friendship", rand(-3, 0));
      return `${target.name}さんは少しホームシック気味です。`;
    },
    () => {
      change(target, "career", rand(2, 7));
      change(target, "mental", rand(1, 5));
      return `${target.name}さんは将来について前向きな話を聞きました。`;
    },
    () => {
      change(target, "skill", rand(2, 6));
      change(target, "fatigue", rand(2, 7));
      return `${target.name}さんは課題をよく頑張りました。`;
    },
    () => {
      change(target, "life", rand(-5, -1));
      change(target, "mental", rand(-3, 0));
      schoolRep = clamp(schoolRep - 2, 0, 100);
      return `${target.name}さんの書類提出が少し遅れ、学校側の対応が必要になりました。`;
    }
  ];

  const message = pickRandom(events)();
  normalizeStudent(target);
  addLog(message);
}

function weeklyRelationshipDecay() {
  students.forEach(student => {
    if (student.handledThisWeek) return;

    student.ignoredWeeks += 1;

    if (student.ignoredWeeks === 1) {
      addLog(`${student.name}さんとは今週あまり話せませんでした。`);
    }

    if (student.ignoredWeeks >= 2) {
      const friendDown = rand(2, 5);
      change(student, "friendship", -friendDown);
      change(student, "mental", rand(-2, 0));

      addLog(`${student.name}さんは少し距離を感じているようです。友好度が下がりました。`);
    }

    if (student.ignoredWeeks >= 3) {
      change(student, "mental", rand(-3, -1));

      if (Math.random() < 0.35) {
        change(student, "life", rand(-3, -1));
      }

      addLog(`${student.name}さんは相談しにくい状態になっています。早めに声をかけた方がよさそうです。`);
    }

    normalizeStudent(student);
  });
}

function weeklyAttendanceCheck() {
  students.forEach(student => {
    const risk = attendanceRisk(student);

    if (risk <= 0) return;

    const probability = Math.min(85, 10 + risk * 10);

    if (Math.random() * 100 < probability) {
      let drop = 0;

      if (risk >= 10) drop = rand(3, 6);
      else if (risk >= 7) drop = rand(2, 4);
      else if (risk >= 4) drop = rand(1, 3);
      else drop = rand(0, 1);

      if (drop > 0) {
        student.attendance = clamp(student.attendance - drop, 0, MAX_ATTENDANCE);
        addLog(`${student.name}さんの出席率が${drop}%下がりました。状態管理が必要です。`);
      }
    }

    normalizeStudent(student);
  });
}

function attendanceRisk(student) {
  let risk = 0;

  if (student.fatigue >= 90) risk += 4;
  else if (student.fatigue >= 80) risk += 3;
  else if (student.fatigue >= 70) risk += 2;

  if (student.mental <= 25) risk += 4;
  else if (student.mental <= 35) risk += 3;
  else if (student.mental <= 45) risk += 1;

  if (student.life <= 30) risk += 3;
  else if (student.life <= 40) risk += 2;

  if (student.friendship <= 20) risk += 3;
  else if (student.friendship <= 35) risk += 1;

  return risk;
}

function finishGame() {
  let graduates = 0;
  let careerReadyCount = 0;
  let trustedCount = 0;

  const resultCards = students.map(student => {
    const canGraduate =
      student.attendance >= 90 &&
      student.japanese >= 55 &&
      student.skill >= 55 &&
      student.mental >= 35 &&
      student.life >= 35;

    const careerReady =
      student.career >= 60 &&
      student.japanese >= 60 &&
      student.skill >= 60 &&
      student.attendance >= 92;

    const trusted = student.friendship >= 60;

    if (canGraduate) graduates += 1;
    if (careerReady) careerReadyCount += 1;
    if (trusted) trustedCount += 1;

    const careerOutcome = getCareerOutcome(student, canGraduate, careerReady);

    return `
      <article class="result-card">
        <h3>${student.name}さん</h3>

        <div class="badges">
          <span class="badge ${canGraduate ? "ok" : "no"}">
            ${canGraduate ? "卒業条件クリア" : "卒業に追加支援"}
          </span>

          <span class="badge ${careerReady ? "ok" : "neutral"}">
            ${careerReady ? "進路準備OK" : "進路準備中"}
          </span>

          <span class="badge ${trusted ? "ok" : "neutral"}">
            ${trusted ? "信頼関係あり" : "関係づくり継続"}
          </span>

          <span class="badge career-${careerOutcome.rank}">
            ${careerOutcome.title}
          </span>
        </div>

        <p class="result-stats">
          出席率 ${student.attendance}% ／
          日本語 ${levelLabel(student.japanese)} ／
          専門 ${levelLabel(student.skill)} ／
          進路 ${levelLabel(student.career)} ／
          生活 ${stabilityLabel(student.life)} ／
          心 ${mentalLabel(student.mental)} ／
          友好 ${friendshipLabel(student.friendship)}
        </p>

        <div class="career-story">
          ${careerOutcome.text}
        </div>
      </article>
    `;
  }).join("");

  if (graduates === students.length && careerReadyCount >= 3 && trustedCount >= 3) {
    schoolRep = clamp(schoolRep + 12, 0, 100);
  } else if (graduates >= 3) {
    schoolRep = clamp(schoolRep + 6, 0, 100);
  } else {
    schoolRep = clamp(schoolRep - 5, 0, 100);
  }

  resultScreen.innerHTML = `
    <div class="result-inner">
      <h2>12週間の結果</h2>

      <p class="result-summary">
        卒業条件クリア：${graduates} / ${students.length}人<br>
        進路準備OK：${careerReadyCount} / ${students.length}人<br>
        信頼関係あり：${trustedCount} / ${students.length}人<br>
        最終学校評価：${schoolRep}
      </p>

      <div class="result-grid">
        ${resultCards}
      </div>

      <button class="restart-btn" onclick="restartGame()">もう一度プレイ</button>
    </div>
  `;

  resultScreen.classList.remove("hidden");
}

/* 進路結果生成 */
function getCareerOutcome(student, canGraduate, careerReady) {
  const randomLuck = rand(-14, 18);

  const score =
    student.japanese * 0.18 +
    student.skill * 0.24 +
    student.career * 0.28 +
    student.attendance * 0.16 +
    student.mental * 0.08 +
    student.life * 0.04 +
    student.friendship * 0.06 -
    student.fatigue * 0.10 +
    randomLuck;

  let rank = "normal";

  if (!canGraduate) {
    rank = "support";
  } else if (student.attendance < 88) {
    rank = "challenge";
  } else if (score >= 88 && careerReady) {
    rank = "excellent";
  } else if (score >= 74) {
    rank = "good";
  } else if (score >= 58) {
    rank = "normal";
  } else {
    rank = "challenge";
  }

  return buildCareerStory(student, rank, score);
}

function buildCareerStory(student, rank, score) {
  const profile = getCareerProfile(student);
  const titleMap = {
    excellent: "大成功",
    good: "良い進路",
    normal: "進路決定",
    challenge: "継続支援",
    support: "追加支援"
  };

  const data = {
    name: student.name,
    field: profile.field,
    place: pickRandom(profile[rank].places),
    role: pickRandom(profile[rank].roles),
    strength: pickRandom(profile.strengths),
    future: pickRandom(profile[rank].futures)
  };

  const template = pickRandom(careerTemplates[rank]);

  return {
    rank,
    title: titleMap[rank],
    text: applyTemplate(template, data),
    score
  };
}

function getCareerProfile(student) {
  const commonStrengths = [
    "まじめに積み重ねる姿勢",
    "授業で身につけた基礎力",
    "周囲と協力する力",
    "日本語で相談できる力",
    "最後まで諦めない姿勢",
    "現場で学ぼうとする意欲",
    "丁寧に確認する習慣",
    "異文化の中で努力してきた経験"
  ];

  const profiles = {
    vietnam_female: {
      field: "IT分野",
      strengths: [
        ...commonStrengths,
        "課題制作で鍛えた問題解決力",
        "Web制作への関心",
        "細かい作業を続ける集中力"
      ],
      excellent: {
        places: ["大手IT企業", "成長中のWebサービス企業", "外資系ITサポート企業", "有名アプリ開発会社"],
        roles: ["Webエンジニア候補", "システムサポート職", "アプリ開発アシスタント", "IT事務スペシャリスト候補"],
        futures: ["将来は開発チームの中心メンバーとして期待されています。", "入社後も資格取得を続け、専門職として成長していきそうです。", "母国語と日本語を活かした橋渡し役としても注目されています。"]
      },
      good: {
        places: ["地域のIT企業", "システム運用会社", "Web制作会社", "ITサポート企業"],
        roles: ["システム運用スタッフ", "Web制作アシスタント", "ヘルプデスク担当", "ITサポート職"],
        futures: ["実務経験を積みながら、開発職へのステップアップを目指します。", "着実にスキルを伸ばし、現場で信頼を得ていきそうです。"]
      },
      normal: {
        places: ["中小IT企業", "学校紹介の実習先", "事務系IT部門", "サポート系企業"],
        roles: ["IT事務", "サポートスタッフ", "開発補助", "データ入力・管理担当"],
        futures: ["まずは基礎業務から始め、少しずつ専門分野を広げていきます。", "現場で日本語と専門力を磨いていくことになりました。"]
      },
      challenge: {
        places: ["就職支援先", "追加研修プログラム", "インターン先", "学校のキャリア支援室"],
        roles: ["研修生", "インターン候補", "就職準備生", "補助スタッフ候補"],
        futures: ["もう少し準備を重ねれば、IT分野での可能性が広がりそうです。", "出席とポートフォリオを整えながら、再挑戦します。"]
      },
      support: {
        places: ["学校の追加支援プログラム", "日本語補習クラス", "キャリア面談", "生活サポート窓口"],
        roles: ["追加支援対象", "補習参加者", "進路再設計中", "学習継続中"],
        futures: ["まずは生活と学習リズムを整えるところから再スタートします。", "先生との面談を続け、次の進路を一緒に考えます。"]
      }
    },

    china_female: {
      field: "進学・ビジネス分野",
      strengths: [
        ...commonStrengths,
        "高い日本語理解力",
        "資格学習への意欲",
        "計画的に学ぶ力"
      ],
      excellent: {
        places: ["有名大学の編入枠", "大手商社系企業", "国際ビジネス企業", "資格を活かせる専門職企業"],
        roles: ["大学編入生", "国際業務スタッフ", "ビジネスアシスタント", "資格職候補"],
        futures: ["さらに上の学びを目指し、将来の選択肢を大きく広げました。", "語学力と専門知識を活かして国際的な仕事に挑戦します。"]
      },
      good: {
        places: ["私立大学の編入先", "貿易関連企業", "事務系企業", "資格支援のある会社"],
        roles: ["編入学生", "貿易事務", "一般事務", "営業アシスタント"],
        futures: ["学び続ける姿勢を評価され、次のステージに進みます。", "ビジネス日本語を磨きながら実務経験を積んでいきます。"]
      },
      normal: {
        places: ["専門分野に近い企業", "学校推薦先", "地域企業", "進学準備コース"],
        roles: ["事務スタッフ", "進学準備生", "受付・事務担当", "業務補助"],
        futures: ["まずは安定した環境で、日本語と実務力を伸ばしていきます。", "資格取得を続けながら、次のチャンスを狙います。"]
      },
      challenge: {
        places: ["進路相談室", "追加資格講座", "編入準備クラス", "企業インターン"],
        roles: ["進路準備生", "資格勉強中", "インターン候補", "補助スタッフ候補"],
        futures: ["あと一歩の準備を重ね、希望進路に再挑戦します。", "面接練習と資格対策を続けることになりました。"]
      },
      support: {
        places: ["学校の補習制度", "日本語支援クラス", "生活相談窓口", "個別進路面談"],
        roles: ["追加支援対象", "学習継続中", "進路再設計中", "補習参加者"],
        futures: ["焦らず基礎を固め、次の進路を一緒に探していきます。", "生活面の安定から立て直すことになりました。"]
      }
    },

    nepal_male: {
      field: "ホテル・観光分野",
      strengths: [
        ...commonStrengths,
        "人と接する明るさ",
        "接客への関心",
        "現場で動きながら学ぶ力"
      ],
      excellent: {
        places: ["有名ホテルグループ", "外資系ホテル", "高級旅館", "観光サービス大手"],
        roles: ["ホテルフロント候補", "ゲストサービススタッフ", "観光案内スタッフ", "宿泊部門スタッフ"],
        futures: ["多言語対応ができる人材として、現場で大きく期待されています。", "接客力を磨き、将来はリーダー職も目指せそうです。"]
      },
      good: {
        places: ["地域のホテル", "観光案内所", "旅館", "宿泊サービス会社"],
        roles: ["フロントスタッフ", "接客スタッフ", "宿泊業務スタッフ", "予約対応スタッフ"],
        futures: ["現場経験を積みながら、日本語での接客力を高めていきます。", "明るい対応を評価され、接客の仕事に進みました。"]
      },
      normal: {
        places: ["ビジネスホテル", "飲食・観光関連企業", "学校紹介先", "サービス業の現場"],
        roles: ["接客補助", "フロント補助", "サービススタッフ", "店舗スタッフ"],
        futures: ["まずは現場に慣れ、安定して働く力をつけていきます。", "日本語と接客マナーを磨きながら成長していきます。"]
      },
      challenge: {
        places: ["ホテル実習先", "接客研修", "キャリア支援室", "アルバイト先からの紹介"],
        roles: ["研修生", "実習生", "接客補助候補", "就職準備生"],
        futures: ["出席と日本語接客を改善すれば、ホテル業界への道が見えてきます。", "もう少し面接練習を重ねて、希望業界に再挑戦します。"]
      },
      support: {
        places: ["学校の生活支援", "日本語補習", "個別面談", "就職準備講座"],
        roles: ["追加支援対象", "補習参加者", "進路再設計中", "学習継続中"],
        futures: ["生活リズムを整え、無理なく通える状態を作るところから始めます。", "先生と相談しながら、現実的な進路を探していきます。"]
      }
    },

    myanmar_male: {
      field: "専門職・サービス分野",
      strengths: [
        ...commonStrengths,
        "落ち着いて作業する力",
        "専門技術を学ぶ意欲",
        "困難な状況でも続ける粘り強さ"
      ],
      excellent: {
        places: ["専門技術を扱う優良企業", "大手サービス企業", "技術系サポート会社", "成長中の専門職企業"],
        roles: ["技術職候補", "現場サポートスタッフ", "専門サービス担当", "オペレーションスタッフ"],
        futures: ["専門力と誠実な姿勢が評価され、長く活躍できる職場に進みました。", "将来は現場の中心を任される人材として期待されています。"]
      },
      good: {
        places: ["地域の専門職企業", "サービス関連企業", "技術サポート会社", "学校推薦先"],
        roles: ["現場スタッフ", "技術補助", "サービススタッフ", "業務サポート担当"],
        futures: ["実務を通じて専門性を高め、安定したキャリアを築いていきます。", "まじめな姿勢を評価され、現場で成長していけそうです。"]
      },
      normal: {
        places: ["中小企業", "実習先企業", "サービス業の現場", "専門補助の職場"],
        roles: ["現場補助", "業務スタッフ", "専門補助スタッフ", "サービス補助"],
        futures: ["まずはできる仕事から始め、少しずつ専門性を高めていきます。", "日本語と実務経験を積みながら、次の目標を探します。"]
      },
      challenge: {
        places: ["追加研修先", "インターン先", "キャリア支援室", "実習プログラム"],
        roles: ["研修生", "実習生", "就職準備生", "補助スタッフ候補"],
        futures: ["もう少し専門力と出席の安定が必要ですが、可能性は残っています。", "支援を受けながら、改めて就職活動に挑戦します。"]
      },
      support: {
        places: ["学校の追加支援", "生活相談窓口", "日本語補習", "個別面談"],
        roles: ["追加支援対象", "進路再設計中", "学習継続中", "補習参加者"],
        futures: ["生活と心の安定を優先し、次の挑戦に備えます。", "焦らず基礎を固め、支援を受けながら進路を考えます。"]
      }
    }
  };

  return profiles[student.imageKey];
}

const careerTemplates = {
  excellent: [
    "{name}さんは{field}での努力が実り、{place}に{role}として進むことになりました。{strength}が高く評価され、{future}",
    "{name}さんは最終面接で自分の成長をしっかり伝え、{place}から内定を得ました。配属予定は{role}です。{future}",
    "{name}さんは学校生活で培った{strength}を武器に、{field}の{place}へ進みます。{future}",
    "{name}さんは出席・学習・進路準備を高い水準で整え、{place}の{role}に選ばれました。{future}",
    "{name}さんは先生との信頼関係を活かして面接準備を重ね、{place}への道をつかみました。{future}",
    "{name}さんは{field}への強い関心を持ち続け、{place}で{role}として新しい一歩を踏み出します。{future}",
    "{name}さんは学内でも目立つ成長を見せ、{place}から高い評価を受けました。{strength}が決め手になりました。",
    "{name}さんは{field}で大きなチャンスをつかみました。{place}の{role}として、これからの活躍が期待されています。"
  ],
  good: [
    "{name}さんは{place}に{role}として進むことになりました。{strength}が評価され、良い形で次のステージに進みます。",
    "{name}さんは{field}への関心を深め、{place}で働くチャンスを得ました。{future}",
    "{name}さんは面接練習の成果を出し、{place}の{role}として進路を決めました。",
    "{name}さんは安定した出席と努力を評価され、{place}に進みます。{future}",
    "{name}さんは{strength}を活かし、{field}に近い仕事へ進むことができました。",
    "{name}さんは先生の助言を受けながら準備を重ね、{place}への進路を決定しました。",
    "{name}さんは{role}としての第一歩を踏み出します。{future}",
    "{name}さんは大きな不安を乗り越え、{place}で新しい挑戦を始めることになりました。"
  ],
  normal: [
    "{name}さんは{place}で{role}としてスタートします。{future}",
    "{name}さんは希望に近い分野で進路を決めました。まずは{role}として経験を積みます。",
    "{name}さんは{strength}を活かし、{place}で次の一歩を踏み出します。",
    "{name}さんはまだ課題を残しつつも、{field}に関わる進路へ進むことができました。",
    "{name}さんは学校の支援を受けながら、{place}で働く準備を整えました。",
    "{name}さんは無理のない進路を選び、{role}として実務を学んでいきます。",
    "{name}さんは{future}",
    "{name}さんは大きな成功ではないものの、確かな一歩として{place}へ進みます。"
  ],
  challenge: [
    "{name}さんは進路決定まであと一歩でした。今後は{place}で{role}として準備を続けます。{future}",
    "{name}さんは{field}への希望を持っていますが、もう少し準備が必要です。{future}",
    "{name}さんは出席や状態面に課題が残り、{place}で再挑戦することになりました。",
    "{name}さんは{strength}を持っています。今後の支援次第で進路の可能性は広がります。",
    "{name}さんはすぐの内定には届きませんでしたが、{role}として経験を積む道を探します。",
    "{name}さんは学校と相談しながら、{place}で次のチャンスを待ちます。",
    "{name}さんは準備不足の部分がありましたが、{future}",
    "{name}さんはもう一度生活と学習のリズムを整え、{field}への挑戦を続けます。"
  ],
  support: [
    "{name}さんは卒業・進路に向けて追加支援が必要です。まずは{place}で{role}として立て直します。{future}",
    "{name}さんはまだ不安定な部分が多く、学校のサポートを受けながら進路を再設計します。",
    "{name}さんは{field}への可能性を残しています。今後は{place}で基礎を整えていきます。",
    "{name}さんは生活・学習・メンタルの安定を優先し、{role}として再スタートします。",
    "{name}さんは今すぐの進路決定ではなく、支援を受けながら次の機会を探します。",
    "{name}さんは先生との面談を継続し、{place}を中心に今後の道を考えます。",
    "{name}さんは{strength}を持っています。焦らず整えれば、次のチャンスにつながります。",
    "{name}さんは今回の結果をもとに、{future}"
  ]
};

/* 表示系 */
function getStudentImage(student) {
  let expression = "bored";

  if (student.friendship >= 75) {
    expression = "bigsmile";
  } else if (student.friendship >= 40) {
    expression = "smile";
  }

  return `assets/students/${student.imageKey}_${expression}.png`;
}

function conditionPill(student) {
  if (student.fatigue >= 80 || student.mental <= 30 || student.life <= 30) {
    return `<span class="pill bad">要注意</span>`;
  }

  if (student.fatigue >= 65 || student.mental <= 45 || student.life <= 45) {
    return `<span class="pill caution">少し不安定</span>`;
  }

  return `<span class="pill good">安定</span>`;
}

function friendshipPill(student) {
  if (student.friendship >= 75) {
    return `<span class="pill good">強い信頼</span>`;
  }

  if (student.friendship >= 40) {
    return `<span class="pill">普通の関係</span>`;
  }

  return `<span class="pill bad">距離あり</span>`;
}

function isWarningStudent(student) {
  return (
    student.fatigue >= 80 ||
    student.mental <= 35 ||
    student.life <= 35 ||
    student.friendship <= 30 ||
    student.attendance < 90
  );
}

function levelLabel(value) {
  if (value >= 85) return "非常に高い";
  if (value >= 70) return "高め";
  if (value >= 55) return "標準";
  if (value >= 40) return "伸び途中";
  return "低め";
}

function stabilityLabel(value) {
  if (value >= 80) return "とても安定";
  if (value >= 60) return "安定";
  if (value >= 45) return "やや不安";
  if (value >= 30) return "不安定";
  return "要支援";
}

function mentalLabel(value) {
  if (value >= 80) return "前向き";
  if (value >= 60) return "落ち着き";
  if (value >= 45) return "普通";
  if (value >= 30) return "不安気味";
  return "かなり心配";
}

function fatigueLabel(value) {
  if (value >= 85) return "限界近い";
  if (value >= 70) return "疲れ気味";
  if (value >= 50) return "やや疲れ";
  if (value >= 30) return "普通";
  return "元気";
}

function friendshipLabel(value) {
  if (value >= 85) return "とても親密";
  if (value >= 75) return "かなり良い";
  if (value >= 55) return "良い";
  if (value >= 40) return "普通";
  if (value >= 25) return "薄い";
  return "かなり遠い";
}

/* ユーティリティ */
function normalizeStudent(student) {
  const keys = [
    "japanese",
    "skill",
    "career",
    "life",
    "mental",
    "fatigue",
    "friendship"
  ];

  keys.forEach(key => {
    student[key] = clamp(Math.round(student[key]), 0, 100);
  });

  student.attendance = clamp(Math.round(student.attendance), 0, MAX_ATTENDANCE);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function applyTemplate(template, data) {
  return template
    .replaceAll("{name}", data.name)
    .replaceAll("{field}", data.field)
    .replaceAll("{place}", data.place)
    .replaceAll("{role}", data.role)
    .replaceAll("{strength}", data.strength)
    .replaceAll("{future}", data.future);
}

function addLog(message) {
  logs.unshift({
    week,
    message
  });

  logs = logs.slice(0, 80);
  renderLogs();
}

function renderLogs() {
  logArea.innerHTML = logs.map(log => `
    <div class="log-item">
      <span class="log-week">第${log.week}週</span>
      ${log.message}
    </div>
  `).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 1500);
}

function restartGame() {
  week = 1;
  actionPoint = MAX_AP;
  schoolRep = 50;
  selectedStudentId = 1;
  logs = [];
  pendingAction = null;

  clearInterval(animationTimer);
  clearTimeout(autoFinishTimer);

  actionModal.classList.add("hidden");
  resultScreen.classList.add("hidden");

  initStudents();
  addLog("新しい12週間が始まりました。");
  render();
}

window.restartGame = restartGame;

/* 初期化 */
initStudents();
addLog("第1週が始まりました。学生を選び、育成メニューから行動を選んでください。");
render();
