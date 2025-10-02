const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");

router.get("/", auth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

router.post("/", auth, async (req, res) => {
  const { sender, content } = req.body;
  try {
    const newMessage = new Message({ sender, content });
    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

module.exports = router;