const chat = document.getElementById("chat");
const textInput = document.getElementById("textInput");
const sendButton = document.getElementById("sendButton");
const voiceButton = document.getElementById("voiceButton");
const clearButton = document.getElementById("clearButton");
const statusText = document.getElementById("status");

const storageKey = "jarvis-web-history-v2";
const apiUrl = "https://jarvis-api-775940061074.us-central1.run.app/chat";

function saveHistory() {
  localStorage.setItem(storageKey, chat.innerHTML);
}

function addMessage(sender, text) {
  const message = document.createElement("p");
  message.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
  saveHistory();
}

function loadHistory() {
  const savedChat = localStorage.getItem(storageKey);

  if (savedChat) {
    chat.innerHTML = savedChat;
    chat.scrollTop = chat.scrollHeight;
  }
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "es-CL";
  speech.rate = 1;
  speech.pitch = 0.9;

  window.speechSynthesis.speak(speech);
}

async function getJarvisReply(userMessage) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: userMessage
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "No pude obtener una respuesta de Jarvis.");
  }

  return data.reply;
}

async function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  addMessage("TÚ", cleanText);
  textInput.value = "";
  sendButton.disabled = true;
  voiceButton.disabled = true;
  statusText.textContent = "Jarvis está pensando...";

  try {
    const reply = await getJarvisReply(cleanText);
    addMessage("JARVIS", reply);
    speak(reply);
    statusText.textContent = "Sistema listo";
  } catch (error) {
    addMessage(
      "JARVIS",
      `No pude conectar con Gemini: ${error.message}`
    );
    statusText.textContent = "Error de conexión";
  } finally {
    sendButton.disabled = false;
    voiceButton.disabled = false;
  }
}

sendButton.addEventListener("click", () => {
  sendMessage(textInput.value);
});

textInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage(textInput.value);
  }
});

clearButton.addEventListener("click", () => {
  const accepted = window.confirm("¿Quieres borrar todo el historial de Jarvis?");

  if (!accepted) {
    return;
  }

  chat.innerHTML = "";
  localStorage.removeItem(storageKey);
  addMessage("JARVIS", "Historial eliminado. Sistemas listos.");
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  voiceButton.disabled = true;
  voiceButton.textContent = "Voz no disponible en este navegador";
} else {
  const recognition = new SpeechRecognition();

  recognition.lang = "es-CL";
  recognition.interimResults = false;
  recognition.continuous = false;

  voiceButton.addEventListener("click", () => {
    recognition.start();
  });

  recognition.addEventListener("start", () => {
    voiceButton.textContent = "Escuchando... habla ahora";
    statusText.textContent = "Micrófono activo";
  });

  recognition.addEventListener("result", (event) => {
    const userVoiceText = event.results[0][0].transcript;
    sendMessage(userVoiceText);
  });

  recognition.addEventListener("end", () => {
    voiceButton.textContent = "Hablar con Jarvis";

    if (!window.speechSynthesis.speaking) {
      statusText.textContent = "Sistema listo";
    }
  });

  recognition.addEventListener("error", () => {
    voiceButton.textContent = "Hablar con Jarvis";
    statusText.textContent = "No pude usar el micrófono. Revisa los permisos.";
  });
}

loadHistory();