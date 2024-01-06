const express = require("express");
const mongoose = require("mongoose");
const socketIO = require("socket.io");
const cors = require("cors");

const Msg = require("./models/Msg");

// App - express & socketIO
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://miniproject:miniproject@cluster0.7rtoqyt.mongodb.net/Ascent?retryWrites=true&w=majority"
);

const httpServer = app.listen(3001, () => {
  console.log(`Server listening on port 3001`);
});

const io = new socketIO.Server(httpServer, {
  cors: {
    origin: "*",
  }
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("newMsg", async (msg) => {
    const { text, type, stream } = msg;
    const newMsg = new Msg({
      text: text,
      type: type,
      stream: stream,
    });
    await newMsg.save();
    console.log(msg,"msg");
    socket.broadcast.emit("newMsgRec", msg);
  });
  
  socket.on("newImg", (img) => {
    console.log(img,"img");
    socket.broadcast.emit("newImgRec", img);
  });

  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
  });
});

app.post("/newAccount", async (req, res) => {
  try {
    const data = await Msg.find().sort({ createdAt: 1 });
    return res.send(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/hi", async (req, res) => {
  const newMsg = new Msg({
    text: "endhi bro",
    type: "text",
    stream: "valo",
  });
  res.send(await newMsg.save());
});
