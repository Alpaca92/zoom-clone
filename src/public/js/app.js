const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };

  return JSON.stringify(msg);
};

socket.addEventListener("open", () => console.log(`Connected to Server ✔`));
socket.addEventListener("message", (event) => {
  const li = document.createElement("li");

  li.innerText = event.data;
  messageList.append(li);
});
socket.addEventListener("close", () =>
  console.log(`Disconnected to Server ❌`)
);

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));

  const li = document.createElement("li");

  li.innerText = `You: ${input.value}`;
  messageList.append(li);

  console.log(event);

  input.value = "";
});

nickForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
});
