const socket = io();

const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;
let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

welcomeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  roomName = input.value;

  input.value = "";

  socket.emit("enter_room", roomName, () => {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerText = `Room name is : ${roomName}`;

    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = msgForm.querySelector("#msg input");
      const text = input.value;

      socket.emit("new_message", text, roomName, () => {
        addMessage(`You: ${text}`);
      });
      input.value = "";
    });

    const nameForm = room.querySelector("#name");
    nameForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = nameForm.querySelector("#name input");
      const name = input.value;

      socket.emit("nickname", name);

      input.value = "";
    });
  });
});

socket.on("welcome", (nickname) => {
  addMessage(`${nickname} joined.`);
});

socket.on("new_message", (nickname, msg) => {
  addMessage(`${nickname}: ${msg}`);
});

socket.on("bye", (nickname) => {
  addMessage(`${nickname} left.`);
});
