const mongoose = require("mongoose");

const MsgSchema = new mongoose.Schema(
  {
    type: String, // text (or) ping
    text: String,
    stream: String,
  },
  { timestamps: true }
);

const Msg = mongoose.model("Chat", MsgSchema);
module.exports = Msg;
