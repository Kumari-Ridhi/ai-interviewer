const user = JSON.parse(localStorage.getItem("user"));

const scores =
  JSON.parse(localStorage.getItem("scores")) || [];

const feedbacks =
  JSON.parse(localStorage.getItem("feedbacks")) || [];

document.getElementById("username").textContent =
  `Candidate: ${user.name}`;

if (scores.length === 0) {

  document.getElementById("score").textContent =
    "Score: Not available";

  document.getElementById("feedback").textContent =
    "No evaluation data found.";

} else {

  const totalScore =
    scores.reduce((sum, score) => sum + Number(score), 0);

  const finalScore =
    Math.round((totalScore / (scores.length * 10)) * 100);

  document.getElementById("score").textContent =
    `Score: ${finalScore}/100`;

  if (finalScore >= 80) {

    document.getElementById("feedback").textContent =
      "Excellent Performance!";

  } else if (finalScore >= 60) {

    document.getElementById("feedback").textContent =
      "Good Job! Keep improving.";

  } else {

    document.getElementById("feedback").textContent =
      "Needs Improvement. Keep practicing.";

  }
}
const questions =
  JSON.parse(localStorage.getItem("questionsAsked")) || [];

const answers =
  JSON.parse(localStorage.getItem("answersGiven")) || [];

const detailedFeedback =
  document.getElementById("detailed-feedback");

questions.forEach((question, index) => {

  const questionDiv = document.createElement("div");

  questionDiv.innerHTML = `
    <hr>

    <h3>Question ${index + 1}</h3>

    <p><strong>Question:</strong> ${question}</p>

    <p><strong>Your Answer:</strong>
      ${answers[index] || "No answer provided"}
    </p>

    <p><strong>Score:</strong>
      ${scores[index] || 0}/10
    </p>

    <p><strong>Feedback:</strong>
      ${feedbacks[index] || "No feedback available"}
    </p>
  `;

  detailedFeedback.appendChild(questionDiv);
});

document.getElementById("home-button").addEventListener("click",function(){
  window.location.href = "index.html";

});