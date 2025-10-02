const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("userOnline", (username) => {
    onlineUsers[socket.id] = username;
    io.emit("onlineUsers", Object.values(onlineUsers));
  });

  socket.on("sendMessage", async ({ sender, content }) => {
    const newMessage = new Message({ sender, content });
    await newMessage.save();
    io.emit("receiveMessage", newMessage);
  });

  socket.on("disconnect", () => {
    delete onlineUsers[socket.id];
    io.emit("onlineUsers", Object.values(onlineUsers));
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));