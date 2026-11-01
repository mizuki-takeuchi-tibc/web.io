const defaultPrompt = `あなたは企業向け生成AI活用研修の企画担当者であり、DX推進を支援するコンサルタントです。

これから、会社に対して生成AI研修会の実施を提案するために、以下の作業を一気通貫で実行してください。

目的：
生成AIの必要性を調査し、会社に対して「社員向け生成AI研修会を実施すべき理由」を説明する提案書を作成し、完成した資料をGoogle Driveに保存したうえで、Gmailを使って自分宛てに完成報告メールを送信してください。

会社名：
{{companyName}}

自分の役割：
{{userRole}}

提案先：
{{proposalTarget}}

会社の課題：
{{companyIssue}}

Google Drive保存先：
{{driveFolder}}

メール送信先：
{{emailAddress}}

実行してほしい作業：
1. 企業が生成AIを学ぶ必要性を調査してください。
2. 生成AIを学ばない場合のリスクを整理してください。
3. 生成AI研修を実施するメリットを、経営層・管理職・一般社員の視点で整理してください。
4. 会社向けの「生成AI研修会 実施提案書」を作成してください。
5. 提案書はGoogleドキュメントとして作成し、Google Driveの指定フォルダに保存してください。
6. 保存した資料のタイトルと保存先を教えてください。
7. Gmailで、自分宛てに完成報告メールを作成してください。
8. メールには、完成した提案書を添付、またはGoogle Driveのリンクとして本文に記載してください。
9. 可能であれば、そのメールを自分宛てに送信してください。
10. 送信前に確認が必要な場合は、確認画面を表示し、私がOKしたら送信してください。

提案書に含める内容：
- タイトル
- 提案の背景
- 生成AIを学ぶ必要性
- 現在の課題
- 研修の目的
- 研修対象者
- 研修内容案
- 期待できる効果
- 実施スケジュール案
- リスクと対策
- まとめ
- 次のアクション

メールに含める内容：
- 件名
- 宛名
- 完成した資料の概要
- 提案書の確認依頼
- Google Driveリンクまたは添付資料
- 確認してほしいポイント
- 締めの文章

作業の進め方：
1. まず調査内容の要点を整理してください。
2. 次に提案書の構成案を作ってください。
3. その後、提案書本文を完成させてください。
4. 完成した提案書をGoogle Driveに保存してください。
5. 保存した資料のタイトル、保存先、リンクを提示してください。
6. Gmailで完成報告メールを作成してください。
7. 可能であれば、完成資料を添付またはリンクとして付けて、自分宛てに送信してください。

条件：
- 専門用語はできるだけ分かりやすく説明してください。
- 経営者や管理職が読んでも分かりやすい文章にしてください。
- 箇条書きや表を使って見やすくしてください。
- 実在の顧客情報、個人情報、社内機密情報は使わないでください。
- メール送信先は自分自身のメールアドレスだけにしてください。
- 送信前に確認が求められる場合は、確認を求めてください。
- 途中で権限や連携が不足している場合は、何が不足しているかを分かりやすく教えてください。`;

function getElement(id) {
  return document.getElementById(id);
}

function getValue(id, fallback) {
  const element = getElement(id);
  if (!element) return fallback;
  const value = element.value.trim();
  return value || fallback;
}

function setCodeBlockText(targetId, text) {
  const target = getElement(targetId);
  if (!target) return;

  const code = target.querySelector("code");
  if (code) {
    code.textContent = text;
  } else {
    target.textContent = text;
  }
}

function getCodeBlockText(targetId) {
  const target = getElement(targetId);
  if (!target) return "";

  const code = target.querySelector("code");
  if (code) {
    return code.textContent;
  }

  return target.textContent;
}

function generatePrompt() {
  const values = {
    companyName: getValue("companyName", "株式会社サンプル"),
    userRole: getValue("userRole", "DX推進担当者"),
    emailAddress: getValue("emailAddress", "your-name@example.com"),
    proposalTarget: getValue("proposalTarget", "経営者・管理職"),
    driveFolder: getValue("driveFolder", "マイドライブ/研修資料"),
    companyIssue: getValue(
      "companyIssue",
      "生成AIに関心はあるが、社員ごとに理解度が異なり、業務活用が進んでいない。"
    )
  };

  let prompt = defaultPrompt;

  Object.keys(values).forEach((key) => {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    prompt = prompt.replace(placeholder, values[key]);
  });

  setCodeBlockText("generatedPrompt", prompt);
}

function resetPromptInputs() {
  const fields = [
    "companyName",
    "userRole",
    "emailAddress",
    "proposalTarget",
    "driveFolder",
    "companyIssue"
  ];

  fields.forEach((id) => {
    const element = getElement(id);
    if (element) {
      element.value = "";
    }
  });

  generatePrompt();
}

async function copyText(text) {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn("Clipboard API failed. Fallback will be used.", error);
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  let success = false;

  try {
    success = document.execCommand("copy");
  } catch (error) {
    console.warn("execCommand copy failed.", error);
    success = false;
  }

  document.body.removeChild(textarea);
  return success;
}

function setupCopyButtons() {
  const copyButtons = document.querySelectorAll("[data-copy-target]");

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const targetId = button.getAttribute("data-copy-target");
      const text = getCodeBlockText(targetId);
      const originalText = button.textContent;

      const success = await copyText(text);

      button.textContent = success ? "コピー済み" : "コピー失敗";
      button.classList.add(success ? "is-copied" : "is-error");

      window.setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("is-copied", "is-error");
      }, 1600);
    });
  });
}

function setupPromptBuilder() {
  const generateButton = getElement("generatePromptButton");
  const resetButton = getElement("resetPromptButton");

  if (generateButton) {
    generateButton.addEventListener("click", generatePrompt);
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetPromptInputs);
  }

  const inputIds = [
    "companyName",
    "userRole",
    "emailAddress",
    "proposalTarget",
    "driveFolder",
    "companyIssue"
  ];

  inputIds.forEach((id) => {
    const element = getElement(id);
    if (!element) return;

    element.addEventListener("input", generatePrompt);
  });

  generatePrompt();
}

function setupChecklist() {
  const checkboxes = document.querySelectorAll(".checklist-card input[type='checkbox'][data-id]");

  checkboxes.forEach((checkbox) => {
    const id = checkbox.getAttribute("data-id");
    const storageKey = `training-check-${id}`;
    const savedValue = localStorage.getItem(storageKey);

    checkbox.checked = savedValue === "true";

    checkbox.addEventListener("change", () => {
      localStorage.setItem(storageKey, checkbox.checked ? "true" : "false");
    });
  });

  const clearButton = getElement("clearChecklistButton");

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      checkboxes.forEach((checkbox) => {
        const id = checkbox.getAttribute("data-id");
        const storageKey = `training-check-${id}`;

        checkbox.checked = false;
        localStorage.removeItem(storageKey);
      });
    });
  }
}

function setupExternalLinks() {
  const links = document.querySelectorAll("a[href^='http']");

  links.forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });
}

function setupSmoothScrollOffset() {
  const anchorLinks = document.querySelectorAll("a[href^='#']");

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const headerOffset = 90;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupPromptBuilder();
  setupCopyButtons();
  setupChecklist();
  setupExternalLinks();
  setupSmoothScrollOffset();
});
