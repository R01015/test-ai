import * as webllm from "https://esm.run/@mlc-ai/web-llm";
const selectedModel = "gemma-2b-it-q4f32_1-MLC";

let engine;

// 会話履歴
let chatHistory = [
  { role: "system", content: "Your name is RikuAI. You speak in friendly, simple English. \
You always answer clearly and concisely. If the user asks something unclear, ask a short question to clarify." }
];

const statusDiv = document.getElementById("status");
const input = document.getElementById("user-input");
const sendbtn = document.getElementById("send-btn");
const clearbtn = document.getElementById("clear-btn");
const history = document.getElementById("chat-history");
const inputbox = document.getElementById("input-box");
const title = document.getElementById("title");
const warning = document.getElementById("warning");

async function init() {
  engine = await webllm.CreateMLCEngine(selectedModel, {
    initProgressCallback: (progress) => {
      statusDiv.innerText = `ロード中: ${Math.floor(progress.progress * 100)}% - ${progress.text}`;
    }
  });

  statusDiv.innerText = "準備完了！オフラインでも動きます。";
  input.disabled = false;
  sendbtn.disabled = false;
  clearbtn.disabled = false;
}

// メッセージ送信処理
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  history.classList.remove("hidden");
  title.classList.add("hidden");
  warning.classList.remove("hidden");
  inputbox.style.top = "90%";

  // ユーザー表示
  const userDiv = document.createElement("div");
  userDiv.className = "user";
  userDiv.appendChild(document.createTextNode(text));
  history.appendChild(userDiv);

  input.value = "";

  // 会話履歴にユーザー発言を追加
  chatHistory.push({ role: "user", content: text });

  // AI表示
  const aiDiv = document.createElement("div");
  aiDiv.className = "ai"
  aiDiv.innerHTML = "<b>AI:</b> ";
  history.appendChild(aiDiv);

  const aiContentDiv = document.createElement("div");
  aiDiv.appendChild(aiContentDiv);

  sendbtn.disabled = true;
  clearbtn.disabled = true;
  input.disabled = true;

  try {
    const chunks = await engine.chat.completions.create({
      messages: chatHistory,   // ← 会話履歴をそのまま送る
      stream: true,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.9
    });

    let aiFullText = "";

    for await (const chunk of chunks) {
      const content = chunk.choices[0]?.delta?.content || "";
      aiFullText += content;
      aiContentDiv.textContent = aiFullText;
      history.scrollTop = history.scrollHeight;
    }
    aiContentDiv.innerHTML = marked.parse(aiFullText);
    chatHistory.push({ role: "assistant", content: aiFullText });

    //履歴が長くなりすぎたら古い履歴を削除
    if (chatHistory.length > 30) {
      chatHistory.splice(1, 2);
    }

  } catch (err) {
    aiTextNode.textContent = "エラーが発生しました";
    console.error(err);
  } finally {
    sendbtn.disabled = false;
    clearbtn.disabled = false;
    input.disabled = false;
  }
}

async function clearMsg() {
  history.innerHTML = "";
  chatHistory = [
    { role: "system", content: "Your name is RikuAI. You speak in friendly, simple English. \
You always answer clearly and concisely. If the user asks something unclear, ask a short question to clarify." }
  ];
  return;
}

sendbtn.onclick = sendMessage;
clearbtn.onclick = clearMsg;

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});
init();