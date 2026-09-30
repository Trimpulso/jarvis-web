 const chat = document.getElementById("chat");
const textInput = document.getElementById("textInput");
const sendButton = document.getElementById("sendButton");
const voiceButton = document.getElementById("voiceButton");
const clearButton = document.getElementById("clearButton");
const statusText = document.getElementById("status");

const storageKey = "jarvis-web-history-v1";

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

function createJarvisReply(userMessage) {
  const message = userMessage.toLowerCase();

  if (message.includes("hola")) {
    return "Hola. Soy Jarvis tu asistente virtual ... Dios te Bendiga... ¿Qué necesitas?";
  }

  if (message.includes("hora")) {
    const time = new Date().toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return `Son las ${time}.`;
  }

  if (message.includes("quién eres") || message.includes("quien eres")) {
    return "Soy Jarvis Web. Esta versión guarda el historial en tu navegador.";
  }

  return `Recibí tu mensaje: ${userMessage}. Aún soy una versión de prueba. El siguiente módulo será conectar una inteligencia artificial real.`;
}

function sendMessage(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  addMessage("TÚ", cleanText);
  textInput.value = "";
  statusText.textContent = "Jarvis está procesando...";

  window.setTimeout(() => {
    const reply = createJarvisReply(cleanText);
    addMessage("JARVIS", reply);
    speak(reply);
    statusText.textContent = "Sistema listo";
  }, 500);
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
    statusText.textContent = "Sistema listo";
  });

  recognition.addEventListener("error", () => {
    voiceButton.textContent = "Hablar con Jarvis";
    statusText.textContent = "No pude usar el micrófono. Revisa los permisos.";
  });
}

loadHistory();