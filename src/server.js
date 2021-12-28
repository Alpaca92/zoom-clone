import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => {
  console.log(`Listening on http://localhost:3000`);
};

const server = http.createServer(app); // http server
const wss = new WebSocketServer({ server }); // ws server on top of http server

// fake db
const sockets = [];

// this code is always executed whenever someone accesses
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = `Anonymous${Math.floor(Math.random() * 100)}`;

  console.log(`Connected to Browser ✔`);
  socket.on("close", () => console.log(`Disconnected from the Browser ❌`));
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);

    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) => {
          if (aSocket !== socket)
            aSocket.send(`${socket["nickname"]}: ${message.payload}`);
        });
        break;
      case "nickname":
        socket["nickname"] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);
