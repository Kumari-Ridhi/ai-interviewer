# 🤖 AI Interviewer

An AI-powered interview practice web application that helps candidates prepare for technical and HR interviews through dynamically generated questions, AI-based answer evaluation, scoring, and personalized feedback.

## 🚀 Features

- 👤 Candidate name and interview role selection
- 🎯 Difficulty selection: Easy, Medium, Hard
- 🔢 Custom number of interview questions
- 🤖 AI-generated interview questions using Gemini
- 🎤 Speech-to-text answer input
- 🔊 Text-to-speech for interview questions
- ⏱️ 60-second timer for each question
- 🧠 AI-based answer evaluation
- 📊 Score from 0–10 for each answer
- 💬 Question-wise AI feedback
- 🏆 Final interview score
- 💾 Interview data stored in MongoDB
- 🛡️ Error handling and API timeout protection
- 🔄 Dynamic follow-up questions

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- Web Speech API
- LocalStorage

### Backend
- Node.js
- Express.js
- REST API
- CORS

### AI
- Google Gemini API

### Database
- MongoDB
- Mongoose

## 📁 Project Structure

```text
AI-INTERVIEWER/
│
├── frontend/
│   ├── index.html
│   ├── interview.html
│   ├── result.html
│   ├── style.css
│   ├── script.js
│   ├── interview.js
│   └── result.js
│
├── backend/
│   ├── models/
│   │   └── Interview.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
