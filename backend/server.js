const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const Interview = require("./models/interview");

const app = express();

const PORT = 3000;

app.use(cors());
// Middleware
app.use(express.json());

// Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.log("MongoDB Connection Error:", error);
  });

// Home route
app.get("/", (req, res) => {
  res.send("AI Interviewer Backend is Running!");
});

// Generate interview question
app.post("/api/generate-question", async (req, res) => {

  try {

    const { role, difficulty } = req.body;

    const prompt = `
You are an AI interviewer.

Generate ONE interview question for a candidate.

Role: ${role}
Difficulty: ${difficulty}

Rules:
- Ask only one question.
- Do not give the answer.
- Keep it suitable for an interview.
- Return only the question.
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt
    });

    res.json({
      question: interaction.output_text
    });

  } catch (error) {

    console.error("Gemini Error:", error);

    res.status(500).json({
      error: "AI request failed",
      details: error.message
    });
  }
});

app.post("/api/evaluate-answer", async (req, res) => {
  try {
    const { role, difficulty, question, answer } = req.body;

    const prompt = `
You are an interview evaluator.

Role: ${role}
Difficulty: ${difficulty}

Question:
${question}

Candidate's Answer:
${answer}

Evaluate the answer.

Give a score from 0 to 10 based on:
- Correctness
- Relevance
- Clarity
- Technical understanding

Return ONLY this JSON:
{
  "score": 0,
  "feedback": "short feedback"
}
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt
    });

    const result = JSON.parse(interaction.output_text);

    res.json(result);

  } catch (error) {
    console.error("Evaluation Error:", error);

    res.status(500).json({
      error: "Answer evaluation failed",
      details: error.message
    });
  }
});

app.post("/api/save-interview", async (req, res) => {
  try {

    const {
      name,
      role,
      difficulty,
      score,
      answers
    } = req.body;

    const interview = new Interview({
      name: name,
      role: role,
      difficulty: difficulty,
      score: score,
      answers: answers
    });

    await interview.save();

    res.json({
      message: "Interview saved successfully",
      interviewId: interview._id
    });

  } catch (error) {

    console.error("MongoDB Save Error:", error);

    res.status(500).json({
      error: "Failed to save interview",
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post("/api/next-question", async (req, res) => {
  try {
    const { role, difficulty, previousQuestion, previousAnswer } = req.body;

    const prompt = `
You are an adaptive AI interviewer.

Candidate role: ${role}
Difficulty: ${difficulty}

Previous question:
${previousQuestion}

Candidate's answer:
${previousAnswer}

Based on the candidate's answer, generate ONE relevant follow-up interview question.

Rules:
- The question must relate to the candidate's previous answer.
- Adjust the difficulty according to the candidate's answer.
- Do not give the answer.
- Return ONLY the next interview question.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });

    res.json({
      question: response.text
    });

  } catch (error) {
    console.error("Adaptive question error:", error);
    res.status(500).json({
      error: "Failed to generate next question",
      details: error.message
    });
  }
});