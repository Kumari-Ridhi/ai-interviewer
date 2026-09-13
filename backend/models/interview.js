const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  name: String,
  role: String,
  difficulty: String,
  score: Number,
  answers: [String],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Interview",interviewSchema);