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

wss.on("connection", (socket) => {
  sockets.push(socket);
  console.log(`Connected to Browser ✔`);
  socket.on("close", () => console.log(`Disconnected from the Browser ❌`));
  socket.on("message", (message) => {
    sockets.forEach((aSocket) => aSocket.send(message));
  });
});

server.listen(3000, handleListen);
