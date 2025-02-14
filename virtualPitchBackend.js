const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

let votes = { A: 0, B: 0, C: 0 };
let comments = [];

// Serve static files (optional)
app.use(express.static("public"));

// Voting API
app.post("/vote", (req, res) => {
  const { startup } = req.body;
  if (votes[startup] !== undefined) {
    votes[startup]++;
    io.emit("updateVotes", votes);
    res.json({ success: true, votes });
  } else {
    res.status(400).json({ success: false, message: "Invalid startup" });
  }
});

// Get Votes API
app.get("/votes", (req, res) => {
  res.json(votes);
});

// Comments API
app.post("/comment", (req, res) => {
  const { text } = req.body;
  if (text.trim() !== "") {
    comments.push(text);
    io.emit("newComment", text);
    res.json({ success: true, comments });
  } else {
    res.status(400).json({ success: false, message: "Empty comment" });
  }
});

// Get Comments API
app.get("/comments", (req, res) => {
  res.json(comments);
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.emit("updateVotes", votes);
  socket.emit("loadComments", comments);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});