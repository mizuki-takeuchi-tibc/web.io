const MAX_WEEK = 12;
const MAX_AP = 4;
const MAX_ATTENDANCE = 99;

let week = 1;
let actionPoint = MAX_AP;
let schoolRep = 50;
let selectedStudentId = null;
let gameEnded = false;
let isAnimating = false;

let students = [];
let animationInterval = null;
let animationTimeout = null;
let currentActionPayload = null;

const actions = [
  {
    id: "presentation",
    title: "発表中心の授業",
    icon: "🗣️",
    desc: "人前で話す経験を通して、日本語と自信を育てます。緊張もあります。",
    images: [
      "assets/actions/presentation_1.png",
      "assets/actions/presentation_2.png"
    ],
    modalText: "発表の練習をしています。伝えたいことを日本語で表現しようとしています..."
  },
  {
    id: "practice",
    title: "課題制作・実習",
    icon: "💻",
    desc: "専門的な課題に取り組みます。力はつきますが、疲れやすい行動です。",
    images: [
      "assets/actions/practice_1.png",
      "assets/actions/practice_2.png"
    ],
    modalText: "課題制作に集中しています。分からないところを確認しながら進めています..."
  },
  {
    id: "exam",
    title: "資格・試験対策",
    icon: "📚",
    desc: "資格や試験に向けて集中します。短期的に伸びますが負担も大きめです。",
    images: [
      "assets/actions/exam_1.png",
      "assets/actions/exam_2.png"
    ],
    modalText: "資格試験に向けて取り組んでいます。集中力が必要な時間です..."
  },
  {
    id: "interview",
    title: "個別面談",
    icon: "🤝",
    desc: "悩みを聞き、信頼関係を深めます。学習よりも関係構築に効果があります。",
    images: [
      "assets/actions/interview_1.png",
      "assets/actions/interview_2.png"
    ],
    modalText: "一対一で話を聞いています。困っていることを少しずつ整理しています..."
  },
  {
    id: "life_support",
    title: "生活相談",
    icon: "🏠",
    desc: "生活リズムや手続きの不安を支援します。出席率低下の予防になります。",
    images: [
      "assets/actions/life_support_1.png",
      "assets/actions/life_support_2.png"
    ],
    modalText: "生活の不安について相談しています。学校生活を続けやすくするための支援です..."
  },
  {
    id: "career_event",
    title: "企業・進学イベント",
    icon: "💼",
    desc: "将来を考えるきっかけを作ります。刺激になりますが、緊張もあります。",
    images: [
      "assets/actions/career_event_1.png",
      "assets/actions/career_event_2.png"
    ],
    modalText: "企業・進学イベントに参加しています。将来のイメージを少しずつ広げています..."
  },
  {
    id: "rest",
    title: "休ませる",
    icon: "🌙",
    desc: "無理をさせず、疲労と気持ちを整えます。学習は進みません。",
    images: [
      "assets/actions/rest_1.png",
      "assets/actions/rest_2.png"
    ],
    modalText: "少し休む時間を作っています。無理をしすぎないことも大切です..."
  }
];

function initStudents() {
  students = [
    {
      id: 1,
      name: "アン",
      country: "ベトナム",
      gender: "女性",
      goal: "IT分野での就職を目指している",
      imageKey: "vietnam_female",
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
      goal: "大学編入と資格取得を目指している",
      imageKey: "china_female",
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
      goal: "ホテル・観光分野での就職を目指している",
      imageKey: "nepal_male",
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
      goal: "専門スキルを身につけて日本で働きたい",
      imageKey: "myanmar_male",
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

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampAttendance(value) {
  return Math.max(0, Math.min(MAX_ATTENDANCE, Math.round(value)));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(percent) {
  return Math.random() * 100 < percent;
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function applyTemplate(template, data) {
  return template
    .replace(/\{name\}/g, data.name)
    .replace(/\{field\}/g, data.field)
    .replace(/\{place\}/g, data.place)
    .replace(/\{role\}/g, data.role)
    .replace(/\{strength\}/g, data.strength)
    .replace(/\{future\}/g, data.future);
}

function getStudentImage(student) {
  let expression = "bored";

  if (student.friendship >= 75) {
    expression = "bigsmile";
  } else if (student.friendship >= 40) {
    expression = "smile";
  }

  return `assets/students/${student.imageKey}_${expression}.png`;
}

function getSelectedStudent() {
  return students.find(s => s.id === selectedStudentId);
}

function friendshipBonus(student) {
  if (student.friendship >= 80) return rand(3, 5);
  if (student.friendship >= 60) return rand(2, 4);
  if (student.friendship >= 40) return rand(1, 3);
  if (student.friendship >= 20) return rand(0, 2);
  return rand(0, 1);
}

function conditionPenalty(student) {
  let penalty = 0;

  if (student.fatigue >= 85) penalty += rand(4, 6);
  else if (student.fatigue >= 70) penalty += rand(2, 4);
  else if (student.fatigue >= 60) penalty += rand(1, 2);

  if (student.mental <= 25) penalty += rand(4, 6);
  else if (student.mental <= 40) penalty += rand(2, 4);
  else if (student.mental <= 50) penalty += rand(1, 2);

  return penalty;
}

function growth(student, min, max) {
  const base = rand(min, max);
  const bonus = friendshipBonus(student);
  const penalty = conditionPenalty(student);
  return Math.max(0, base + bonus - penalty);
}

function normalizeStudent(student) {
  student.japanese = clamp(student.japanese);
  student.skill = clamp(student.skill);
  student.career = clamp(student.career);
  student.life = clamp(student.life);
  student.mental = clamp(student.mental);
  student.fatigue = clamp(student.fatigue);
  student.friendship = clamp(student.friendship);
  student.attendance = clampAttendance(student.attendance);
}

function renderActions() {
  const area = document.getElementById("actionsArea");
  area.innerHTML = "";

  actions.forEach(action => {
    const button = document.createElement("button");
    button.className = `action-btn ${action.id}`;
    button.onclick = () => startAction(action.id);

    button.innerHTML = `
      <div class="action-icon">${action.icon}</div>
      <div>
        <div class="action-title">${action.title}</div>
        <div class="action-desc">${action.desc}</div>
      </div>
    `;

    area.appendChild(button);
  });
}

function render() {
  document.getElementById("weekText").textContent = week;
  document.getElementById("apText").textContent = actionPoint;
  document.getElementById("schoolRepText").textContent = schoolRep;

  const selected = getSelectedStudent();
  document.getElementById("selectedText").textContent = selected ? selected.name : "なし";

  const area = document.getElementById("studentsArea");
  area.innerHTML = "";

  students.forEach(student => {
    const card = document.createElement("article");
    card.className = "student-card";

    if (student.id === selectedStudentId) {
      card.classList.add("selected");
    }

    card.onclick = () => {
      if (gameEnded || isAnimating) return;

      selectedStudentId = student.id;
      addLog(`${student.name}さんを選択しました。`);
      showToast(`${student.name}さんを選択しました`);
      render();
    };

    card.innerHTML = `
      <div class="student-visual">
        <img src="${getStudentImage(student)}" alt="${student.name}">
        <div class="attendance-badge">出席率 ${student.attendance}%</div>
      </div>

      <div class="student-body">
        <div class="student-name-row">
          <div>
            <div class="student-name">${student.name}</div>
            <div class="student-meta">${student.country} / ${student.gender}</div>
          </div>
        </div>

        <div class="student-goal">目標：${student.goal}</div>

        <div class="condition-row">
          <div class="condition-pill ${getConditionClass(student)}">
            状態：${getConditionText(student)}
          </div>
          <div class="condition-pill ${getFriendshipClass(student)}">
            関係：${getFriendshipText(student)}
          </div>
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
    `;

    area.appendChild(card);
  });
}

function statBar(label, value, colorClass, textLabel) {
  return `
    <div class="stat-bar-row">
      <div class="stat-bar-head">
        <span>${label}</span>
        <strong>${textLabel}</strong>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill ${colorClass}" style="width:${value}%"></div>
      </div>
    </div>
  `;
}

function levelLabel(value) {
  if (value >= 80) return "かなり高い";
  if (value >= 65) return "高め";
  if (value >= 50) return "標準";
  if (value >= 35) return "伸び途中";
  return "基礎から";
}

function stabilityLabel(value) {
  if (value >= 75) return "安定";
  if (value >= 55) return "おおむね安定";
  if (value >= 40) return "少し不安";
  return "不安定";
}

function mentalLabel(value) {
  if (value >= 75) return "前向き";
  if (value >= 55) return "落ち着き";
  if (value >= 40) return "少し不安";
  if (value >= 25) return "かなり不安";
  return "限界近い";
}

function fatigueLabel(value) {
  if (value >= 85) return "限界気味";
  if (value >= 70) return "かなり高い";
  if (value >= 55) return "疲れ気味";
  if (value >= 35) return "普通";
  return "少ない";
}

function friendshipLabel(value) {
  if (value >= 75) return "とても良好";
  if (value >= 55) return "良好";
  if (value >= 40) return "普通";
  if (value >= 25) return "距離あり";
  return "遠い";
}

function getConditionText(student) {
  if (student.fatigue >= 85) return "限界気味";
  if (student.mental <= 30) return "不安定";
  if (student.life <= 35) return "生活不安";
  if (student.fatigue >= 65) return "疲れ気味";
  if (student.mental >= 75 && student.fatigue <= 35) return "好調";
  return "普通";
}

function getConditionClass(student) {
  if (student.fatigue >= 85 || student.mental <= 30 || student.life <= 30) return "bad";
  if (student.fatigue >= 65 || student.mental <= 45 || student.life <= 45) return "warn";
  if (student.mental >= 70 && student.fatigue <= 40 && student.life >= 60) return "good";
  return "normal";
}

function getFriendshipText(student) {
  if (student.friendship >= 75) return "信頼";
  if (student.friendship >= 55) return "良好";
  if (student.friendship >= 40) return "普通";
  return "これから";
}

function getFriendshipClass(student) {
  if (student.friendship >= 75) return "good";
  if (student.friendship >= 40) return "normal";
  if (student.friendship >= 25) return "warn";
  return "bad";
}

function startAction(actionId) {
  if (gameEnded || isAnimating) return;

  if (actionPoint <= 0) {
    addLog("今週の行動ポイントがありません。「週を進める」を押してください。");
    showToast("行動ポイントがありません");
    return;
  }

  const student = getSelectedStudent();

  if (!student) {
    addLog("先に学生を選択してください。");
    showToast("先に学生を選択してください");
    return;
  }

  const action = actions.find(a => a.id === actionId);

  if (!action) return;

  currentActionPayload = {
    studentId: student.id,
    actionId: action.id
  };

  showActionModal(student, action);
}

function showActionModal(student, action) {
  isAnimating = true;

  const modal = document.getElementById("actionModal");
  const image = document.getElementById("actionSceneImage");

  document.getElementById("modalStudent").textContent = `${student.name}さん`;
  document.getElementById("modalActionTitle").textContent = action.title;
  document.getElementById("modalActionText").textContent = action.modalText;

  let frame = 0;
  image.src = action.images[0];

  modal.classList.remove("hidden");

  clearInterval(animationInterval);
  clearTimeout(animationTimeout);

  animationInterval = setInterval(() => {
    frame = frame === 0 ? 1 : 0;
    image.src = action.images[frame];
  }, 450);

  animationTimeout = setTimeout(() => {
    finishActionAnimation();
  }, 2200);
}

function finishActionAnimation() {
  if (!isAnimating || !currentActionPayload) return;

  clearInterval(animationInterval);
  clearTimeout(animationTimeout);

  document.getElementById("actionModal").classList.add("hidden");

  const { studentId, actionId } = currentActionPayload;
  currentActionPayload = null;

  applyAction(studentId, actionId);

  isAnimating = false;
}

function applyAction(studentId, actionId) {
  const student = students.find(s => s.id === studentId);
  const action = actions.find(a => a.id === actionId);

  if (!student || !action) return;

  student.handledThisWeek = true;
  student.ignoredWeeks = 0;

  let resultMessages = [];

  if (actionId === "presentation") {
    student.japanese += growth(student, 5, 10);
    student.mental += growth(student, 0, 4);
    student.fatigue += rand(5, 10);
    student.friendship += rand(1, 3);

    if (student.japanese < 45 && chance(35)) {
      student.mental -= rand(3, 7);
      resultMessages.push("人前で話すことに少し緊張したようです。");
    } else {
      resultMessages.push("自分の考えを日本語で伝える経験になりました。");
    }
  }

  if (actionId === "practice") {
    student.skill += growth(student, 6, 12);
    student.career += growth(student, 1, 5);
    student.fatigue += rand(7, 12);
    student.life -= rand(0, 3);
    student.friendship += rand(0, 2);

    if (student.fatigue >= 70) {
      student.mental -= rand(2, 5);
      resultMessages.push("集中して取り組みましたが、疲れも見えます。");
    } else {
      resultMessages.push("専門分野への理解が深まったようです。");
    }
  }

  if (actionId === "exam") {
    student.japanese += growth(student, 2, 7);
    student.skill += growth(student, 3, 8);
    student.career += growth(student, 2, 6);
    student.fatigue += rand(9, 15);
    student.mental -= rand(1, 6);
    student.friendship += rand(0, 2);

    resultMessages.push("試験に向けて集中しました。負担は少し大きかったようです。");
  }

  if (actionId === "interview") {
    student.friendship += rand(5, 10);
    student.mental += growth(student, 5, 11);
    student.life += rand(1, 5);
    student.fatigue -= rand(1, 5);

    if (student.friendship < 40) {
      resultMessages.push("まだ少し遠慮はありますが、話すきっかけになりました。");
    } else {
      resultMessages.push("安心して相談できる雰囲気ができてきました。");
    }
  }

  if (actionId === "life_support") {
    student.life += growth(student, 6, 12);
    student.friendship += rand(3, 7);
    student.mental += rand(1, 5);
    student.fatigue += rand(0, 3);

    resultMessages.push("生活面の不安が少し整理され、学校生活を続けやすくなりました。");
  }

  if (actionId === "career_event") {
    student.career += growth(student, 6, 12);
    student.japanese += growth(student, 1, 5);
    student.fatigue += rand(5, 10);
    student.friendship += rand(1, 4);

    if (student.japanese < 45 && chance(35)) {
      student.mental -= rand(2, 6);
      resultMessages.push("刺激にはなりましたが、少し自信をなくした部分もあるようです。");
    } else {
      student.mental += rand(1, 5);
      resultMessages.push("将来のイメージが少し具体的になったようです。");
    }
  }

  if (actionId === "rest") {
    student.fatigue -= rand(14, 24);
    student.mental += rand(4, 9);
    student.friendship += rand(1, 4);

    student.japanese -= rand(0, 1);
    student.skill -= rand(0, 1);

    resultMessages.push("無理をしすぎない時間を作れました。少し表情が落ち着いたようです。");
  }

  normalizeStudent(student);

  actionPoint--;

  const fullMessage = `${student.name}さん：${action.title}。${resultMessages.join(" ")}`;
  addLog(fullMessage);
  showToast(action.title);

  render();
}

function weeklyRelationshipDecay() {
  students.forEach(student => {
    if (student.handledThisWeek) {
      student.ignoredWeeks = 0;
      normalizeStudent(student);
      return;
    }

    student.ignoredWeeks++;

    if (student.ignoredWeeks === 1) {
      addLog(`${student.name}さんには今週あまり関われませんでした。`);
    }

    if (student.ignoredWeeks >= 2) {
      const friendDrop = rand(2, 5);
      const mentalDrop = rand(0, 2);

      student.friendship -= friendDrop;
      student.mental -= mentalDrop;

      addLog(`${student.name}さんと関わらない週が続き、少し距離ができたようです。`);

      if (student.friendship < 40) {
        addLog(`${student.name}さんの表情が少し退屈そうになっています。`);
      }
    }

    if (student.ignoredWeeks >= 3) {
      student.mental -= rand(1, 3);

      if (chance(35)) {
        student.life -= rand(1, 3);
        addLog(`${student.name}さんは相談しにくい状態が続き、生活面の不安も出てきています。`);
      }
    }

    normalizeStudent(student);
  });
}

function weeklyAttendanceCheck() {
  students.forEach(student => {
    let risk = 0;
    let reasons = [];

    if (student.fatigue >= 90) {
      risk += 4;
      reasons.push("疲労が限界に近い");
    } else if (student.fatigue >= 75) {
      risk += 3;
      reasons.push("疲労が高い");
    } else if (student.fatigue >= 65) {
      risk += 1;
    }

    if (student.mental <= 25) {
      risk += 4;
      reasons.push("メンタルがかなり不安定");
    } else if (student.mental <= 40) {
      risk += 2;
      reasons.push("メンタルが不安定");
    }

    if (student.friendship <= 20) {
      risk += 3;
      reasons.push("相談しづらい状態");
    } else if (student.friendship <= 35) {
      risk += 1;
    }

    if (student.life <= 30) {
      risk += 4;
      reasons.push("生活が不安定");
    } else if (student.life <= 45) {
      risk += 2;
      reasons.push("生活面に不安がある");
    }

    if (risk <= 0) return;

    const probability = Math.min(85, 10 + risk * 10);

    if (chance(probability)) {
      let drop = 0;

      if (risk >= 10) drop = rand(3, 6);
      else if (risk >= 7) drop = rand(2, 4);
      else if (risk >= 4) drop = rand(1, 3);
      else drop = rand(0, 1);

      if (drop > 0) {
        student.attendance -= drop;
        addLog(`${student.name}さんの出席率が${drop}%下がりました。理由：${reasons.join("、")}。`);
      }
    }

    normalizeStudent(student);
  });
}

function weeklyConditionChange() {
  students.forEach(student => {
    if (student.fatigue >= 80) {
      student.mental -= rand(3, 7);
      student.life -= rand(1, 4);
    } else if (student.fatigue >= 65) {
      student.mental -= rand(1, 3);
    }

    if (student.life <= 40) {
      student.mental -= rand(1, 4);
      student.fatigue += rand(1, 4);
    }

    if (student.mental <= 35) {
      student.japanese -= rand(0, 2);
      student.skill -= rand(0, 2);
    }

    if (student.friendship >= 70 && student.mental < 85) {
      student.mental += rand(0, 2);
    }

    student.fatigue -= rand(3, 6);

    normalizeStudent(student);
  });
}

function randomEvent() {
  const student = students[Math.floor(Math.random() * students.length)];

  const events = [
    {
      text: `${student.name}さんがアルバイトでかなり疲れているようです。`,
      effect: () => {
        student.fatigue += rand(8, 15);
        student.mental -= rand(0, 4);

        if (student.fatigue >= 80 && chance(45)) {
          const drop = rand(1, 3);
          student.attendance -= drop;
          addLog(`${student.name}さんは疲労の影響で出席率が${drop}%下がりました。`);
        }
      }
    },
    {
      text: `${student.name}さんがホームシック気味です。`,
      effect: () => {
        student.mental -= rand(6, 12);
        student.friendship -= rand(0, 3);
      }
    },
    {
      text: `${student.name}さんがクラスメイトと話す機会を持ちました。`,
      effect: () => {
        student.mental += rand(3, 7);
        student.life += rand(1, 4);
        student.friendship += rand(1, 4);
      }
    },
    {
      text: `${student.name}さんが課題に前向きに取り組みました。`,
      effect: () => {
        student.skill += rand(3, 7);
        student.fatigue += rand(2, 5);
      }
    },
    {
      text: `${student.name}さんが日本語で質問することに挑戦しました。`,
      effect: () => {
        student.japanese += rand(2, 6);
        student.mental += rand(1, 4);
      }
    },
    {
      text: `クラス全体の雰囲気が明るくなっています。`,
      effect: () => {
        students.forEach(s => {
          s.mental += rand(1, 4);
          s.friendship += rand(1, 3);
          normalizeStudent(s);
        });
        schoolRep += rand(1, 3);
      }
    },
    {
      text: `学校行事の準備で少し忙しい週でした。`,
      effect: () => {
        students.forEach(s => {
          s.fatigue += rand(2, 5);
          normalizeStudent(s);
        });
      }
    }
  ];

  const event = events[Math.floor(Math.random() * events.length)];
  event.effect();

  students.forEach(normalizeStudent);
  schoolRep = clamp(schoolRep);

  addLog(`イベント：${event.text}`);
}

/* =========================
   Career Outcome System
   進路結果生成
========================= */

function getCareerOutcome(student, canGraduate, careerReady) {
  const randomLuck = rand(-14, 18);

  let score = 0;

  score += student.japanese * 0.18;
  score += student.skill * 0.24;
  score += student.career * 0.28;
  score += student.attendance * 0.16;
  score += student.mental * 0.08;
  score += student.life * 0.04;
  score += student.friendship * 0.06;
  score -= student.fatigue * 0.10;
  score += randomLuck;

  if (!canGraduate) {
    return buildCareerStory(student, "support", score);
  }

  if (student.attendance < 88) {
    return buildCareerStory(student, "challenge", score);
  }

  if (score >= 88 && careerReady) {
    return buildCareerStory(student, "excellent", score);
  }

  if (score >= 74) {
    return buildCareerStory(student, "good", score);
  }

  if (score >= 58) {
    return buildCareerStory(student, "normal", score);
  }

  return buildCareerStory(student, "challenge", score);
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

  const badgeMap = {
    excellent: "success",
    good: "success",
    normal: "info",
    challenge: "fail",
    support: "fail"
  };

  const place = pickRandom(profile.places[rank]);
  const role = pickRandom(profile.roles[rank]);
  const strength = pickRandom(profile.strengths);
  const future = pickRandom(profile.futures[rank]);
  const template = pickRandom(careerTemplates[rank]);

  return {
    rank,
    title: titleMap[rank],
    badgeClass: badgeMap[rank],
    score,
    text: applyTemplate(template, {
      name: student.name,
      field: profile.field,
      place,
      role,
      strength,
      future
    })
  };
}

function getCareerProfile(student) {
  const commonStrengths = [
    "最後まで諦めずに取り組んだ姿勢",
    "先生と相談しながら課題を整理したこと",
    "少しずつ日本語で伝える力を伸ばしたこと",
    "学校生活の中で積み重ねた努力",
    "クラスでの経験を通して成長したこと"
  ];

  const profiles = {
    vietnam_female: {
      field: "IT",
      places: {
        excellent: ["大手IT企業", "有名Webサービス企業", "外資系IT企業", "自社開発を行う優良企業", "成長中のシステム開発会社", "グローバル展開するIT企業"],
        good: ["Web制作会社", "システム開発会社", "ITサポート企業", "アプリ開発会社", "社内SEを募集する企業", "デジタルマーケティング企業"],
        normal: ["地域のIT企業", "中小の開発会社", "IT事務の現場", "システム運用の職場", "ヘルプデスク業務の職場", "専門分野に近い企業"],
        challenge: ["就職活動を継続しながらIT分野", "インターンや研修を通じてIT業界", "日本語と技術を伸ばしながら開発分野", "ポートフォリオを作り直してIT企業", "先生と相談しながら希望業界"],
        support: ["追加学習を受けながらIT分野", "生活リズムを整えながら専門分野", "日本語基礎を固めながら進路", "学校の支援を受けながら次の機会", "改めて学習計画を立てて就職活動"]
      },
      roles: {
        excellent: ["Web開発エンジニア", "フロントエンドエンジニア", "アプリ開発補助", "システム開発スタッフ", "ITプロジェクトメンバー", "グローバルITサポート"],
        good: ["Web制作スタッフ", "システムサポート", "テストエンジニア", "IT事務", "社内システム補助", "アプリ運用スタッフ"],
        normal: ["ITサポート", "ヘルプデスク", "データ入力とシステム補助", "Web更新スタッフ", "開発補助", "運用サポート"],
        challenge: ["開発補助", "ITサポート", "Web制作補助", "資格取得", "ポートフォリオ制作", "就職活動"],
        support: ["基礎学習", "日本語学習", "専門課題の再挑戦", "生活改善", "進路相談", "追加支援"]
      },
      strengths: [
        "まじめに課題へ取り組んだ姿勢",
        "少しずつ質問できるようになった成長",
        "授業で積み重ねた基礎力",
        "日本語で説明しようとする努力",
        ...commonStrengths
      ],
      futures: createFutureSet("IT人材", "開発チーム", "専門性")
    },

    china_female: {
      field: "進学・ビジネス",
      places: {
        excellent: ["有名大学の編入コース", "難関大学の関連学部", "大手商社系企業", "国際ビジネス企業", "語学力を活かせる優良企業", "グローバル人材を採用する企業"],
        good: ["大学編入先", "ビジネス系企業", "貿易関連企業", "事務職の企業", "国際交流に関わる職場", "資格を活かせる専門分野"],
        normal: ["ビジネス系の職場", "事務サポートの職場", "進学準備コース", "地域企業", "語学を活かせる職場", "関連分野の企業"],
        challenge: ["編入試験の再挑戦", "資格取得を目指した学習", "ビジネス分野への就職活動", "進路相談を続けながら次の学校", "日本語表現を強化しながら進学先"],
        support: ["追加学習を受けながら進学", "日本語と専門基礎を整えながら進路", "生活を安定させながら次の目標", "学校の支援を受けながら編入準備", "学習計画を見直して再挑戦"]
      },
      roles: {
        excellent: ["大学編入生", "国際ビジネススタッフ", "貿易事務", "企画サポート", "語学サポートスタッフ", "グローバル営業アシスタント"],
        good: ["大学編入生", "事務職", "ビジネスサポート", "貿易事務補助", "販売企画スタッフ", "資格を活かした専門職"],
        normal: ["事務サポート", "ビジネス補助", "進学準備", "販売・接客", "語学サポート", "一般職"],
        challenge: ["編入準備", "資格学習", "就職活動", "面接練習", "日本語強化", "進路再検討"],
        support: ["追加学習", "進路相談", "生活支援", "日本語基礎", "資格準備", "再挑戦"]
      },
      strengths: [
        "高い日本語理解力",
        "落ち着いて学習を続けた姿勢",
        "進学に向けた計画性",
        "資格学習への集中力",
        "丁寧に課題を仕上げる力",
        ...commonStrengths
      ],
      futures: createFutureSet("国際人材", "新しい環境", "専門知識")
    },

    nepal_male: {
      field: "ホテル・観光",
      places: {
        excellent: ["有名ホテルグループ", "外資系ホテル", "高級旅館", "大手観光サービス企業", "空港関連サービス企業", "国際的な宿泊施設"],
        good: ["ホテル業界", "観光サービス企業", "宿泊施設", "レストランサービス企業", "旅行関連企業", "接客を重視する企業"],
        normal: ["地域のホテル", "接客サービスの職場", "宿泊業界の現場", "観光関連の職場", "飲食サービスの職場", "サービス業の企業"],
        challenge: ["ホテル業界への就職活動", "接客日本語を強化しながら観光分野", "アルバイト経験を活かしてサービス業", "面接練習を続けながら宿泊業界", "先生と相談しながら希望企業"],
        support: ["生活リズムを整えながら就職活動", "日本語会話を強化しながらホテル分野", "追加支援を受けながら進路", "学校のサポートを受けながら次の面接", "基礎から整えてサービス業"]
      },
      roles: {
        excellent: ["ホテルフロントスタッフ", "ゲストサービス担当", "観光案内スタッフ", "レセプションスタッフ", "宿泊サービススタッフ", "国際接客スタッフ"],
        good: ["ホテルスタッフ", "接客スタッフ", "観光サービス担当", "フロント補助", "レストランサービス", "宿泊施設スタッフ"],
        normal: ["接客サービス", "宿泊施設スタッフ", "飲食サービス", "観光補助", "フロント補助", "サービス業スタッフ"],
        challenge: ["面接練習", "接客日本語", "ホテル就職活動", "サービス業経験", "資格取得", "進路相談"],
        support: ["生活改善", "日本語会話", "追加面談", "就職準備", "基礎学習", "出席安定"]
      },
      strengths: [
        "人と話す明るさ",
        "接客に向いたコミュニケーション力",
        "実習で見せた前向きな姿勢",
        "周囲と協力する力",
        "お客様を意識した丁寧な対応",
        ...commonStrengths
      ],
      futures: createFutureSet("国際接客人材", "ホテルの現場", "接客力")
    },

    myanmar_male: {
      field: "専門職・サービス",
      places: {
        excellent: ["専門技術を評価する優良企業", "大手サービス企業", "成長中の専門職企業", "地域で評価の高い企業", "人材育成に力を入れる企業", "国際人材を歓迎する企業"],
        good: ["専門分野の企業", "サービス業界", "技術サポート企業", "現場実習先の関連企業", "地域企業", "実務経験を積める職場"],
        normal: ["専門分野に近い職場", "サービス職の現場", "現場サポートの職場", "中小企業", "実務を学べる企業", "地域の職場"],
        challenge: ["専門分野への就職活動", "生活を整えながらサービス業", "日本語を伸ばしながら希望職種", "実習経験を活かして次の企業", "先生と相談しながら進路"],
        support: ["生活面の支援を受けながら進路", "追加学習を続けながら専門分野", "日本語基礎を整えながら就職活動", "学校の支援を受けながら次の機会", "体調と生活を整えて再挑戦"]
      },
      roles: {
        excellent: ["専門職スタッフ", "技術サポート", "現場リーダー候補", "サービス品質担当", "実務スタッフ", "国際人材スタッフ"],
        good: ["専門職補助", "サービススタッフ", "技術補助", "現場サポート", "実務スタッフ", "業務サポート"],
        normal: ["現場サポート", "サービス職", "専門補助", "実務補助", "業務スタッフ", "地域企業スタッフ"],
        challenge: ["就職活動", "日本語強化", "専門課題", "実習経験", "進路相談", "面接準備"],
        support: ["生活改善", "追加学習", "日本語基礎", "出席安定", "進路相談", "再挑戦"]
      },
      strengths: [
        "穏やかに努力を続ける姿勢",
        "実習で見せた丁寧さ",
        "少しずつ相談できるようになった成長",
        "専門分野への関心",
        "周囲の話をよく聞く姿勢",
        "粘り強く取り組む力",
        ...commonStrengths
      ],
      futures: createFutureSet("専門職人材", "現場", "実務力")
    }
  };

  return profiles[student.imageKey];
}

function createFutureSet(personType, placeWord, skillWord) {
  return {
    excellent: [
      `将来は${placeWord}の中心メンバーを目指しています`,
      `社内でも将来性を期待されています`,
      `日本と母国をつなぐ${personType}として期待されています`,
      `さらに高度な資格取得にも挑戦しています`,
      `${skillWord}をさらに伸ばし、次のステージを目指しています`
    ],
    good: [
      `${placeWord}で経験を積みながら成長しています`,
      `先輩のサポートを受けながら力を伸ばしています`,
      `次の目標に向けて前向きに働いています`,
      `${skillWord}を高めながらキャリアを作っています`,
      `新しい環境にも少しずつ慣れてきています`
    ],
    normal: [
      `まずは実務に慣れることを目標にしています`,
      `少しずつ自信をつけながら働いています`,
      `今後も日本語と${skillWord}を伸ばしていく予定です`,
      `次のステップに向けて経験を積んでいます`,
      `先生の助言を思い出しながら努力を続けています`
    ],
    challenge: [
      `次の面接に向けて準備を続けています`,
      `資格や作品を整えて再挑戦する予定です`,
      `先生と相談しながら進路を再確認しています`,
      `焦らず次のチャンスを狙っています`,
      `生活と学習を整えながら前に進んでいます`
    ],
    support: [
      `まずは学校生活の安定を優先しています`,
      `追加支援を受けながら次の目標を考えています`,
      `生活と学習のリズムを整え直しています`,
      `もう一度基礎から積み上げています`,
      `先生と一緒に計画を立て直しています`
    ]
  };
}

const careerTemplates = {
  excellent: [
    "{name}さんは{place}に進み、{role}として高く評価されています。{strength}が結果につながり、{future}。",
    "{name}さんは希望していた{field}分野で大きなチャンスをつかみ、{place}で{role}として働き始めました。{future}。",
    "{name}さんは学校での努力が認められ、{place}から内定を得ました。現在は{role}として活躍しています。",
    "{name}さんは{strength}を評価され、{place}で{role}として採用されました。{future}。",
    "{name}さんは難しい選考を乗り越え、{field}分野の{place}に進みました。{role}として順調なスタートを切っています。",
    "{name}さんは先生との面談を重ねながら準備を進め、{place}で{role}として採用されました。{future}。",
    "{name}さんは出席と学習を高い水準で維持し、{field}分野の{place}で評価される人材になりました。",
    "{name}さんは{strength}を武器に、{place}で{role}として新しい生活を始めています。"
  ],
  good: [
    "{name}さんは{place}に進み、{role}として学んだことを仕事に活かしています。{future}。",
    "{name}さんは希望に近い{field}分野へ進み、{role}として経験を積み始めました。",
    "{name}さんは{strength}が評価され、{place}で{role}として働くことになりました。",
    "{name}さんは安定した進路を決め、{field}分野で前向きに成長しています。{future}。",
    "{name}さんは学校での経験を活かし、{place}で{role}として一歩を踏み出しました。",
    "{name}さんは面接練習の成果を出し、{place}で{role}として採用されました。",
    "{name}さんは自分に合った進路を見つけ、{field}分野で少しずつ力を伸ばしています。",
    "{name}さんは{strength}を活かして、{place}で新しい挑戦を始めました。"
  ],
  normal: [
    "{name}さんはまず{place}で{role}からスタートし、実務経験を積んでいます。{future}。",
    "{name}さんは希望分野に近い進路へ進み、少しずつ自信をつけています。",
    "{name}さんは{field}分野への第一歩として、{role}に近い仕事を始めました。",
    "{name}さんは進路を決めましたが、今後も日本語力と専門力を伸ばす必要があります。",
    "{name}さんは先生の支援を受けながら、{place}で新しい生活を始めました。",
    "{name}さんは{strength}を活かし、まずは経験を積む道を選びました。",
    "{name}さんは{role}として働きながら、次の目標を探しています。",
    "{name}さんは卒業後、{field}分野に近い環境で少しずつ成長しています。"
  ],
  challenge: [
    "{name}さんは卒業後も{field}分野を目指し、{role}を続けながら次の機会を待っています。",
    "{name}さんはもう少し準備が必要ですが、{place}を目標に努力を続けています。{future}。",
    "{name}さんは進路決定まで時間がかかりましたが、先生と一緒に次の目標を整理しました。",
    "{name}さんは{strength}を活かしながら、次の面接に向けて準備を進めています。",
    "{name}さんは{field}分野への希望を持ち続け、{role}に取り組んでいます。",
    "{name}さんは生活や学習を整えながら、次のチャンスを狙っています。",
    "{name}さんは焦らず、{place}に近づくための準備を続けています。",
    "{name}さんは学校のサポートを受けながら、進路をもう一度見直しています。"
  ],
  support: [
    "{name}さんは卒業条件に届かず、{role}を中心に追加支援を受けることになりました。",
    "{name}さんは出席や生活面の課題が残り、まずは学校生活を安定させる必要があります。",
    "{name}さんは進路よりも先に、学習習慣と生活リズムを整えることになりました。",
    "{name}さんは先生と今後の計画を立て直し、次の機会を目指しています。",
    "{name}さんは{field}分野を目指しながら、基礎から学び直しています。",
    "{name}さんは{strength}を持っていますが、もう少し継続的な支援が必要です。",
    "{name}さんは学校のサポートを受け、生活と学習のバランスを整え直しています。",
    "{name}さんは焦らず、次の挑戦に向けて準備を続けています。"
  ]
};

function nextWeek() {
  if (gameEnded || isAnimating) return;

  weeklyConditionChange();
  randomEvent();
  weeklyRelationshipDecay();
  weeklyAttendanceCheck();

  if (week >= MAX_WEEK) {
    finishGame();
    return;
  }

  week++;
  actionPoint = MAX_AP;
  selectedStudentId = null;

  students.forEach(student => {
    student.handledThisWeek = false;
  });

  addLog(`第${week}週が始まりました。`);
  showToast(`第${week}週が始まりました`);

  render();
}

function finishGame() {
  gameEnded = true;

  const resultScreen = document.getElementById("resultScreen");
  const finalResult = document.getElementById("finalResult");

  let graduateCount = 0;
  let careerReadyCount = 0;
  let trustCount = 0;

  let html = `<div class="result-list">`;

  students.forEach(student => {
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
    const careerOutcome = getCareerOutcome(student, canGraduate, careerReady);

    if (canGraduate) graduateCount++;
    if (careerReady) careerReadyCount++;
    if (trusted) trustCount++;

    html += `
      <p>
        <strong>${student.name}さん</strong>
        ${canGraduate ? `<span class="badge success">卒業</span>` : `<span class="badge fail">卒業条件未達</span>`}
        ${careerReady ? `<span class="badge info">進路準備OK</span>` : `<span class="badge fail">進路準備不足</span>`}
        ${trusted ? `<span class="badge success">信頼関係あり</span>` : `<span class="badge fail">関係構築不足</span>`}
        <span class="badge ${careerOutcome.badgeClass}">${careerOutcome.title}</span>
        <br>
        出席率：${student.attendance}% /
        日本語：${levelLabel(student.japanese)} /
        専門：${levelLabel(student.skill)} /
        進路：${levelLabel(student.career)} /
        メンタル：${mentalLabel(student.mental)} /
        友好度：${friendshipLabel(student.friendship)}
        <br>
        <strong>最終進路：</strong>${careerOutcome.text}
      </p>
    `;
  });

  html += `</div>`;

  let message = "";

  if (graduateCount === students.length && careerReadyCount >= 3 && trustCount >= 3) {
    message = `
      <h3>最高のクラス運営です！</h3>
      <p>出席率を大きく崩さず、学生たちは進路に向けて大きく成長しました。</p>
    `;
    schoolRep += 12;
  } else if (graduateCount >= 3) {
    message = `
      <h3>良い結果です！</h3>
      <p>多くの学生が卒業条件を満たしました。次は進路支援と関係構築をさらに意識しましょう。</p>
    `;
    schoolRep += 6;
  } else {
    message = `
      <h3>もう少し支援が必要でした。</h3>
      <p>出席率は一度下がると戻りません。疲労、メンタル、生活、友好度を早めに整えることが重要です。</p>
    `;
    schoolRep -= 5;
  }

  schoolRep = clamp(schoolRep);

  finalResult.innerHTML = `
    ${message}
    <p><strong>卒業者数：</strong>${graduateCount} / ${students.length}</p>
    <p><strong>進路準備OK：</strong>${careerReadyCount} / ${students.length}</p>
    <p><strong>信頼関係あり：</strong>${trustCount} / ${students.length}</p>
    <p><strong>最終学校評価：</strong>${schoolRep}</p>
    ${html}
  `;

  resultScreen.style.display = "block";

  addLog("12週間が終了しました。卒業判定を行います。");
  showToast("卒業判定です");

  render();
}

function addLog(text) {
  const logArea = document.getElementById("logArea");
  const p = document.createElement("p");
  p.textContent = text;
  logArea.prepend(p);
}

function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1500);
}

function restartGame() {
  week = 1;
  actionPoint = MAX_AP;
  schoolRep = 50;
  selectedStudentId = null;
  gameEnded = false;
  isAnimating = false;
  currentActionPayload = null;

  clearInterval(animationInterval);
  clearTimeout(animationTimeout);

  document.getElementById("actionModal").classList.add("hidden");
  document.getElementById("logArea").innerHTML = "";
  document.getElementById("resultScreen").style.display = "none";

  initStudents();
  renderActions();
  render();

  addLog("ゲーム開始。4人の留学生を12週間で支援しましょう。");
  showToast("ゲーム開始");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("skipButton").addEventListener("click", finishActionAnimation);
});

window.restartGame = restartGame;
window.nextWeek = nextWeek;

restartGame();
