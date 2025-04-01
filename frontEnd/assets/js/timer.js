const timerText = document.querySelector(".timer");
let timervalue = parseInt(localStorage.getItem("timervalue")) || 0;
let timerInterval = null;
let timerRunning = localStorage.getItem("timerRunning") === "true";
let startButton = document.querySelector(".start");

if (timerText) {
    timerText.textContent = formatTime(timervalue);
}

if (timerRunning) {
    startTimer();
}

if (startButton) {
    startButton.addEventListener("click", () => {
        if (!timerRunning) {
            resetTimer();
            startTimer();
        }
    });
}

function startTimer() {
    timerRunning = true;
    localStorage.setItem("timerRunning", "true");

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        timervalue++;
        if (timerText) {
            timerText.textContent = formatTime(timervalue);
        }
        localStorage.setItem("timervalue", timervalue.toString());
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerRunning = false;
    localStorage.setItem("timerRunning", "false");
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

window.addEventListener("beforeunload", () => {
    localStorage.setItem("timervalue", timervalue.toString());
    localStorage.setItem("timerRunning", timerRunning.toString());
});

function resetTimer() {
    timervalue = 0;
    localStorage.setItem("timervalue", "0");
    if (timerText) {
        timerText.textContent = formatTime(timervalue);
    }
}