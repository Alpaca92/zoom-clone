import http from "http";
import express from "express";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app); // http server
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['"https://admin.socket.io"'],
    credentials: true,
  },
}); // socket.io server on top of http server

instrument(wsServer, {
  auth: false,
});

function getPublicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRooms = [];

  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) publicRooms.push(key);
  });

  return publicRooms;
}

function countRoom(roomName) {
  const {
    sockets: {
      adapter: { rooms },
    },
  } = wsServer;

  return rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  socket["nickname"] = `Anonymous_${Math.floor(Math.random() * 10000)}`;
  wsServer.sockets.emit("room_change", getPublicRooms());

  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`socket event: ${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket
      .to(roomName)
      .emit("welcome", socket["nickname"], countRoom(roomName));
    wsServer.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket["nickname"], countRoom(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", socket["nickname"], message);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

httpServer.listen(3000, () =>
  console.log(`Listening on http://localhost:3000`)
);

/*
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
*/
