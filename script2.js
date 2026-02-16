// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDZMYWXxl-W6tKvGF7aRrq8hcpg4TdE9I",
  authDomain: "chatwleo.firebaseapp.com",
  databaseURL: "https://chatwleo-default-rtdb.firebaseio.com",
  projectId: "chatwleo",
  storageBucket: "chatwleo.firebasestorage.app",
  messagingSenderId: "616988584387",
  appId: "1:616988584387:web:81b829019252d78cdd7576"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 👤 Username
let username = localStorage.getItem("chatww_username");
if (!username) {
  username = "Guest_" + Math.floor(Math.random() * 10000);
  localStorage.setItem("chatww_username", username);
}

// 📍 Detect page
const isRoomPage = window.location.pathname.includes("roomchat.html");

// =======================
// 🏠 LOBBY PAGE
// =======================
if (!isRoomPage) {

  const roomList = document.getElementById("roomList");

  // Create Room
  window.createRoom = () => {
    const name = roomName.value.trim();
    const pass = roomPass.value.trim();
    if (!name || !pass) return alert("Fill all");

    const id = name.toLowerCase().replace(/\s/g, "_");

    db.ref("rooms/" + id).once("value").then(snap => {
      if (snap.exists()) return alert("Room exists");

      db.ref("rooms/" + id).set({
        name,
        password: CryptoJS.SHA256(pass).toString()
      });

      alert("Created!");
    });
  };

  // Join Room
  window.joinRoom = () => {
    const name = joinRoomName.value.trim();
    const pass = joinRoomPass.value.trim();
    const id = name.toLowerCase().replace(/\s/g, "_");

    db.ref("rooms/" + id).once("value").then(snap => {
      const room = snap.val();
      if (!room) return alert("Not found");
      if (CryptoJS.SHA256(pass).toString() !== room.password)
        return alert("Wrong password");

      localStorage.setItem("chatww_room", id);
      window.location.href = "roomchat.html";
    });
  };

  // Load Rooms
  db.ref("rooms").on("child_added", snap => {
    const div = document.createElement("div");
    div.textContent = snap.val().name;

    div.onclick = () => {
      const pass = prompt("Password:");
      if (!pass) return;
      if (CryptoJS.SHA256(pass).toString() !== snap.val().password)
        return alert("Wrong password");

      localStorage.setItem("chatww_room", snap.key);
      window.location.href = "roomchat.html";
    };

    roomList.appendChild(div);
  });
}
