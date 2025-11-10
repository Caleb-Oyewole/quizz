const questions = [
    {
        question: "What is the capital of Nigeria?",
        answers: [
            { text: "Lagos", correct: false },
            { text: "Abuja", correct: true },
            { text: "Kano", correct: false },
            { text: "Port Harcourt", correct: false },
        ]
    },
    {
        question: "Which country is home to the world's largest university by enrollment?",
        answers: [
            { text: "India", correct: true },
            { text: "USA", correct: false },
            { text: "China", correct: false },
            { text: "Russia", correct: false },
        ]
    },
    {
        question: "What does 'GPA' stand for?",
        answers: [
            { text: "Great Personal Achievement", correct: false },
            { text: "Grade Point Average", correct: true },
            { text: "General Proficiency Assessment", correct: false },
            { text: "Graduate Placement Aspiration", correct: false },
        ]
    }
];

// Get elements from the HTML
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;

// Function to start the quiz
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}

// Function to display the question and answers
function showQuestion() {
    // Reset state for new question
    resetState();
    
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    // Create buttons for each answer
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

// Function to remove previous answers
function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

// Function to handle the user's answer
function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }

    // Disable all other buttons after an answer is selected
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    
    nextButton.style.display = "block";
}

// Function to show the final score
function showScore() {
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block";
}

// Function to handle the "Next" button click
function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        startQuiz();
    }
});

// Start the quiz when the page loads
startQuiz();