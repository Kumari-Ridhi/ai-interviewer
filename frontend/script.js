const startButton = document.getElementById("start-btn");

startButton.addEventListener("click", function(){

  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;
  const difficulty = document.getElementById("difficulty").value;
  const questions = document.getElementById("questions").value;

  if(name === ""){
    alert("Please enter your name.");
    return;
  }
  const user = {
    name: name,
    role: role,
    difficulty: difficulty,
    questions: questions
  };
  localStorage.setItem("user",JSON.stringify(user));

 // alert("Interview Started!");
 window.location.href = "interview.html";
});