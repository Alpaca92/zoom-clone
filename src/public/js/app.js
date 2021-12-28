const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };

  return JSON.stringify(msg);
};

socket.addEventListener("open", () => console.log(`Connected to Server ✔`));
socket.addEventListener("message", async (event) => {
  const li = document.createElement("li");

  li.innerText = await event.data.text();
  messageList.append(li);
});
socket.addEventListener("close", () =>
  console.log(`Disconnected to Server ❌`)
);

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
});

nickForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
});
