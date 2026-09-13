const user = JSON.parse(localStorage.getItem("user"));

document.getElementById("welcome").textContent =
  `Welcome, ${user.name}!`;

document.getElementById("role").textContent =
  `Role: ${user.role}`;

document.getElementById("difficulty").textContent =
  `Difficulty: ${user.difficulty}`;

document.getElementById("question-count").textContent =
  `Questions: ${user.questions}`;

const questionElement = document.getElementById("question");
const nextButton = document.getElementById("next-button");

const questionCounter = document.getElementById("question-counter");
const progressBar = document.getElementById("progress-bar");

const answer = document.getElementById("answer");
const speakButton = document.getElementById("mic-btn");
const timerElement = document.getElementById("timer");

let currentQuestion = 0;
let questionsAsked = [];
let answersGiven = [];
let scores = [];
let feedbacks = [];
let totalQuestions = Number(user.questions);

let currentQuestionText = "";

let timeLeft = 60;
let timer;


const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;

if (SpeechRecognition) {

  recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function () {
    speakButton.textContent = "Listening...";
  };

  recognition.onresult = function (event) {

    const transcript =
      event.results[0][0].transcript;

    answer.value = transcript;

    speakButton.textContent = "Start Speaking";
  };

  recognition.onerror = function (event) {

    console.error("Speech recognition error:", event.error);

    speakButton.textContent = "Start Speaking";
  };

  recognition.onend = function () {

    speakButton.textContent = "Start Speaking";
  };

  speakButton.addEventListener("click", function () {

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
    }

  });

} else {

  speakButton.disabled = true;
  speakButton.textContent = "Speech Not Supported";
}

async function generateFirstQuestion() {

  questionElement.textContent = "Generating question...";
  nextButton.disabled = true;

  try {

    const response = await fetch(
      "http://localhost:3000/api/generate-question",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          role: user.role,
          difficulty: user.difficulty
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.details || "Failed to generate question"
      );
    }

    currentQuestionText = data.question;
    questionCounter.textContent = `Question 1 of ${totalQuestions}`;
    progressBar.value = 1;
    progressBar.max = totalQuestions;

    questionElement.textContent = data.question;
    questionsAsked.push(data.question);
    speakQuestion(data.question);

    nextButton.disabled = false;

  } catch (error) {

    console.error("Error:", error);
    questionElement.textContent =
      `Error: ${error.message}`;
    nextButton.disabled = false;
  }
}

async function generateNextQuestion(previousAnswer) {

  if (nextButton.disabled) return;

  questionElement.textContent ="Analyzing your answer...";

  nextButton.disabled = true;
  nextButton.textContent = "Loading...";

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {

    const response = await fetch(
      "http://localhost:3000/api/next-question",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          role: user.role,
          difficulty: user.difficulty,
          previousQuestion: currentQuestionText,
          previousAnswer: previousAnswer
        }),

        signal: controller.signal
      }
    );

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.details || "Failed to generate next question"
      );
    }

    currentQuestionText = data.question;
    questionCounter.textContent = `Question ${currentQuestion} of ${totalQuestions}`;
    progressBar.value=currentQuestion;
    progressBar.max = totalQuestions;

    questionsAsked.push(data.question);
    
    questionElement.textContent = data.question;
    
    speakQuestion(data.question);

  } catch (error) {

    console.error("Error:", error);
    if (error.name === "AbortError") {
      questionElement.textContent =
        "Request timed out. Please try again.";
    } else {
      questionElement.textContent =
        `Error: ${error.message}`;
    }
  } finally {

    clearTimeout(timeout);
    nextButton.disabled = false;
    nextButton.textContent = "Next Question";
  }
}

function speakQuestion(question) {
  window.speechSynthesis.cancel();
  const speech =
    new SpeechSynthesisUtterance(question);

  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}


function startTimer() {
  clearInterval(timer);
  timeLeft = 60;
  timerElement.textContent =`Time Left: ${timeLeft}s`;

  timer = setInterval(() => {

    timeLeft--;

    timerElement.textContent =`Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      if(answer.value.trim() !== ""){
        nextButton.click();
      }else {
        alert("Time's up! Please provide an answer.");
      }
    }
  }, 1000);
}


let isEvaluating = false;

async function evaluateAnswer(question, candidateAnswer) {
  if (isEvaluating) return;
  isEvaluating = true;

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 15000);

    const response = await fetch(
      "http://localhost:3000/api/evaluate-answer",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          role: user.role,
          difficulty: user.difficulty,
          question: question,
          answer: candidateAnswer
        }),

        signal: controller.signal
      }
    );

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.details || "Evaluation failed"
      );
    }

    return data;
  } catch (error) {

    console.error("Evaluation Error:", error);

    if (error.name === "AbortError") {
      return {
        score: 0,
        feedback: "Evaluation timed out. Please try again."
      };
    }

    return {
      score: 0,
      feedback: "Answer could not be evaluated."
    };
  } finally {
    isEvaluating = false;
  }
}

nextButton.addEventListener("click", async () => {
  if (currentQuestion === 0) {
    currentQuestion++;
    nextButton.textContent = "Next Question";
    startTimer();
    await generateFirstQuestion();
    return;
  }
  const currentAnswer = answer.value.trim();

  if (currentAnswer == "") {
    alert("Please provide an answer before continuing.");
    return;
  }
  answersGiven.push(currentAnswer);

  const currentQuestionText =
    questionsAsked[questionsAsked.length - 1];

  questionElement.textContent = "Evaluating your answer...";

  nextButton.disabled = true;
  nextButton.textContent = "Evaluating...";

  const evaluation = await evaluateAnswer(
    currentQuestionText,
    currentAnswer
  );

  scores.push(evaluation.score);
  feedbacks.push(evaluation.feedback);

  console.log("Score:", evaluation.score);
  console.log("Feedback:", evaluation.feedback);

  nextButton.disabled = false;
  nextButton.textContent = "Next Question";

  if (currentQuestion >= totalQuestions) {

    clearInterval(timer);

    window.speechSynthesis.cancel();

    localStorage.setItem(
      "questionsAsked",
      JSON.stringify(questionsAsked)
    );

    localStorage.setItem(
      "answersGiven",
      JSON.stringify(answersGiven)
    );

    localStorage.setItem(
      "scores",
      JSON.stringify(scores)
    );

    localStorage.setItem(
      "feedbacks",
      JSON.stringify(feedbacks)
    );

    const totalScore =
      scores.reduce((sum, score) => sum + Number(score), 0);

    const finalScore =
      Math.round((totalScore / (scores.length * 10)) * 100);

    try {

      await fetch("http://localhost:3000/api/save-interview", {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: user.name,
          role: user.role,
          difficulty: user.difficulty,
          score: finalScore,
          answers: answersGiven
        })
      });

    } catch (error) {
      console.error("Could not save interview:", error);
    }
    window.location.href = "result.html";
    return;
  }

  currentQuestion++;
  answer.value = "";
  startTimer();
  await generateNextQuestion();

});