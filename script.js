// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDZMYWXxl-W6tKJvGF7aRrq8hcpg4TdE9I",
  authDomain: "chatwleo.firebaseapp.com",
  databaseURL: "https://chatwleo-default-rtdb.firebaseio.com",
  projectId: "chatwleo",
  storageBucket: "chatwleo.firebasestorage.app",
  messagingSenderId: "616988584387",
  appId: "1:616988584387:web:81b829019252d78cdd7576"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Load messages
db.ref("globalChat").limitToLast(100).on("child_added", snapshot => {
  const msg = snapshot.val();
  const div = document.createElement("div");
  div.className = "msg";

  const nameSpan = document.createElement("span");
  nameSpan.className = "name";
  nameSpan.textContent = msg.user + ": ";

  div.appendChild(nameSpan);
  div.appendChild(document.createTextNode(msg.text));

  const messages = document.getElementById("messages");
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

// Send message
function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;

  db.ref("globalChat").push({
    user: guestName,
    text: text,
    time: Date.now()
  });

  input.value = "";
}

// key
document.getElementById("messageInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
document.getElementById("messageInput").addEventListener("keydown", e => {
  if (e.key === "Delete" && e.shiftKey) {
    e.preventDefault();
    clearChat();
  }
});

// Clear chat
function clearChat() {
  if (!confirm("Clear all messages?")) return;
  db.ref("globalChat").remove();
  document.getElementById("messages").innerHTML = "";
}

// Check if username already exists on this device
let guestName = localStorage.getItem("chatww_username");

if (!guestName) {
  // Create a new one if not found
  guestName = "Guest_" + Math.floor(Math.random() * 10000);

  // Save it permanently on this device
  localStorage.setItem("chatww_username", guestName);
}

// Display username
document.getElementById("userName").innerText = "You are " + guestName;
