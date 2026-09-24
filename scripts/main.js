document.addEventListener('DOMContentLoaded', () => {
    // Global State Variables
    let wordData = {};
    let wordList = [];
    let currentIndex = 0;
    let score = 0;
    let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
    let attemptsLeft = 3;

    // DOM Element References
    const scoreElement = document.getElementById('current-score');
    const highScoreElement = document.getElementById('high-score');
    const definitionElement = document.getElementById('word-definition');
    const clueStartElement = document.getElementById('clue-start');
    const clueLengthElement = document.getElementById('clue-length');
    const clueAttemptsElement = document.getElementById('clue-attempts');
    const feedbackElement = document.getElementById('game-feedback');

    const guessForm = document.getElementById('guess-form');
    const guessInput = document.getElementById('user-guess');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const restartBtn = document.getElementById('restart-btn');

    // Initialize Application
    init();

    async function init() {
        loadHighScore();
        await fetchWords();
        setupEventListeners();
    }

    // Fetch words asynchronously
    async function fetchWords() {
        try {
            const response = await fetch('../data/words.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            wordData = await response.json();
            wordList = shuffleArray(Object.keys(wordData));

            if (wordList.length === 0) {
                showFeedback('No words found in the dataset.', 'danger');
                return;
            }

            startNewGame();
        } catch (error) {
            console.error('Error fetching words JSON:', error);
            showFeedback('Failed to load game data. Please refresh the page.', 'danger');
        }
    }

    // Set up event listeners
    function setupEventListeners() {
        guessForm.addEventListener('submit', handleGuessSubmit);
        nextBtn.addEventListener('click', handleNextWord);
        restartBtn.addEventListener('click', restartGame);
    }

    // Fisher-Yates Shuffle Algorithm
    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Load word state by index
    function loadWord() {
        // attemptsLeft = 3;
        const currentWord = wordList[currentIndex];
        const definition = wordData[currentWord];

        // UI Updates
        definitionElement.textContent = definition;
        clueStartElement.textContent = `Starts with: ${currentWord.charAt(0).toUpperCase()}`;
        clueLengthElement.textContent = `Length: ${currentWord.length} letters`;
        clueAttemptsElement.textContent = `Attempts remaining: ${attemptsLeft}`;

        // Reset controls
        guessInput.value = '';
        guessInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove('d-none');
        nextBtn.classList.add('d-none');
        restartBtn.classList.add('d-none');

        // Hide feedback alert and clear text
        hideFeedback();

        // Focus input for keyboard navigation ease
        guessInput.focus();
    }

    // Handle player input submission
    function handleGuessSubmit(e) {
        e.preventDefault();
        const currentWord = wordList[currentIndex];
        const userGuess = guessInput.value.trim().toLowerCase();

        if (!userGuess) {
            showFeedback('Please enter a word before submitting.', 'warning');
            return;
        }

        if (userGuess === currentWord.toLowerCase()) {
            handleSuccess();
        } else {
            handleIncorrectGuess(currentWord);
        }
    }

    // Handle correct guess logic
    function handleSuccess() {
        score += 10;
        updateScore();
        showFeedback('Correct! Outstanding job.', 'success');

        guessInput.disabled = true;
        submitBtn.classList.add('d-none');

        // Check if game is completed
        if (currentIndex + 1 >= wordList.length) {
            showFeedback('You completed all words! Final score: ' + score, 'success');
            restartBtn.classList.remove('d-none');
            restartBtn.focus();
        } else {
            nextBtn.classList.remove('d-none');
            nextBtn.focus();
        }
    }

    // Handle incorrect guess logic
    function handleIncorrectGuess(currentWord) {
        attemptsLeft--;
        clueAttemptsElement.textContent = `Attempts remaining: ${attemptsLeft}`;
        guessInput.value = '';

        if (attemptsLeft > 0) {
            showFeedback(`Wrong guess! Tries remaining: ${attemptsLeft}`, 'danger');
            guessInput.focus();
        } else {
            handleGameOver(currentWord);
        }
    }

    // Handle Game Over state
    function handleGameOver(currentWord) {
        showFeedback(`Game Over! The correct word was: "${currentWord.toUpperCase()}"`, 'danger');
        guessInput.disabled = true;
        submitBtn.classList.add('d-none');
        restartBtn.classList.remove('d-none');
        restartBtn.focus();
    }

    // Handle loading next word
    function handleNextWord() {
        currentIndex++;
        if (currentIndex < wordList.length) {
            loadWord();
        }
    }

    // Start/Restart Game Logic
    function startNewGame() {

        score = 0;
        currentIndex = 0;
        attemptsLeft = 3;
        updateScore();
        wordList = shuffleArray(Object.keys(wordData));
        loadWord();
    }

    function restartGame() {
        startNewGame();
        showFeedback('Game restarted! Good luck.', 'info');
    }

    // LocalStorage High Score Management
    function loadHighScore() {
        const savedHighScore = localStorage.getItem('wordGameHighScore');
        highScore = savedHighScore ? parseInt(savedHighScore, 10) : 0;
        highScoreElement.textContent = highScore;
    }

    function updateScore() {
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('wordGameHighScore', highScore.toString());
        }
    }

    // Helper function to manage accessible feedback announcements
    function showFeedback(message, type) {
        feedbackElement.className = `alert alert-${type} mb-3`;
        feedbackElement.textContent = message;
        feedbackElement.classList.remove('d-none');
    }

    function hideFeedback() {
        feedbackElement.classList.add('d-none');
        feedbackElement.textContent = '';
    }

    // quit current game round
    document.getElementById('quit-btn').addEventListener('click', () => {
        window.location.href = `index.html?action=restart&score=${score}`;

    });




});
