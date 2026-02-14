document.addEventListener("DOMContentLoaded", () => {

  // 🔥 Firebase config
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

  // 🧑 Username system
  let guestName = localStorage.getItem("chatww_username");
  if (!guestName) {
    guestName = "Guest_" + Math.floor(Math.random() * 10000);
    localStorage.setItem("chatww_username", guestName);
  }

  let currentRoom = null;
  let messageListener = null; // for removing old message listeners

  const roomList = document.getElementById("roomList");
  const messagesDiv = document.getElementById("messages");

  // 🏠 CREATE ROOM
  window.createRoom = () => {
    const name = document.getElementById("roomName").value.trim();
    const pass = document.getElementById("roomPass").value.trim();
    if (!name || !pass) return alert("Fill all fields");

    const roomId = name.toLowerCase().replace(/\s/g, "_");

    db.ref("rooms/" + roomId).once("value").then(snapshot => {
      if (snapshot.exists()) return alert("Room already exists!");

      db.ref("rooms/" + roomId).set({
        name: name,
        password: btoa(pass)
      });
      alert("Room created!");
      document.getElementById("roomName").value = "";
      document.getElementById("roomPass").value = "";
    });
  };

  // 📋 LOAD ROOMS
  function renderRoom(id, room) {
    const div = document.createElement("div");
    div.className = "room";
    div.textContent = room.name;
    div.onclick = () => joinRoomById(id);
    roomList.appendChild(div);
  }

  db.ref("rooms").on("child_added", snapshot => {
    renderRoom(snapshot.key, snapshot.val());
  });

  // 🔐 JOIN ROOM FROM LIST
  window.joinRoomById = (roomId) => {
    const userPass = prompt("Enter room password:");
    if (!userPass) return;

    db.ref("rooms/" + roomId).once("value").then(snapshot => {
      const room = snapshot.val();
      if (!room) return alert("Room not found!");
      if (btoa(userPass) !== room.password) return alert("Wrong password!");

      enterRoom(roomId);
    });
  };

  // 🔐 JOIN ROOM BY NAME/PASSWORD
  window.joinExistingRoom = () => {
    const name = document.getElementById("joinRoomName").value.trim();
    const pass = document.getElementById("joinRoomPass").value.trim();
    if (!name || !pass) return alert("Fill all fields");

    const roomId = name.toLowerCase().replace(/\s/g, "_");

    db.ref("rooms/" + roomId).once("value").then(snapshot => {
      const room = snapshot.val();
      if (!room) return alert("Room not found!");
      if (btoa(pass) !== room.password) return alert("Wrong password!");

      enterRoom(roomId);
      document.getElementById("joinRoomName").value = "";
      document.getElementById("joinRoomPass").value = "";
    });
  };

  // ✅ ENTER ROOM HELPER
  function enterRoom(roomId) {
    currentRoom = roomId;

    // hide all boxes
    document.getElementById("chatPage").style.display = "block";
    document.getElementById("roomList").style.display = "none";
    document.getElementById("createRoomBox").style.display = "none";
    const joinBox = document.getElementById("joinRoomBox");
    if (joinBox) joinBox.style.display = "none";

    loadMessages();
  }

  // 💬 LOAD MESSAGES
  function loadMessages() {
    messagesDiv.innerHTML = "";

    // remove old listener
    if (messageListener) messageListener.off();

    const roomRef = db.ref("rooms/" + currentRoom + "/messages");
    messageListener = roomRef.limitToLast(100);
    messageListener.on("child_added", snapshot => {
      const msg = snapshot.val();
      const div = document.createElement("div");
      const time = new Date(msg.time).toLocaleTimeString();
      div.textContent = `${msg.user}: ${msg.text} (${time})`;
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  }

  // 📤 SEND MESSAGE
  window.sendMessage = () => {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text || !currentRoom) return;

    db.ref("rooms/" + currentRoom + "/messages").push({
      user: guestName,
      text: text,
      time: Date.now()
    });
    input.value = "";
  };

  // 🚪 LEAVE ROOM
  window.leaveRoom = () => {
    currentRoom = null;

    if (messageListener) messageListener.off();

    document.getElementById("chatPage").style.display = "none";
    document.getElementById("roomList").style.display = "block";
    document.getElementById("createRoomBox").style.display = "block";
    const joinBox = document.getElementById("joinRoomBox");
    if (joinBox) joinBox.style.display = "block";

    messagesDiv.innerHTML = "";
  };

  // ⌨️ ENTER KEY SEND
  const input = document.getElementById("messageInput");
  if (input) {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    });
  }

});
