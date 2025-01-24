let currentCategory = null;

function selectCategory(category) {
    currentCategory = category;
    document.querySelector('.quiz-categories').classList.add('hidden');
    document.getElementById('difficultySelect').classList.remove('hidden');
}

function showCategories() {
    currentCategory = null;
    document.querySelector('.quiz-categories').classList.remove('hidden');
    document.getElementById('difficultySelect').classList.add('hidden');
    document.getElementById('quizArea').classList.add('hidden');
}

function startQuiz(difficulty) {
    // Initialize quiz based on category and difficulty
    const quizConfig = {
        category: currentCategory,
        difficulty: difficulty,
        questionCount: 10
    };
    
    // Hide difficulty selection and show quiz area
    document.getElementById('difficultySelect').classList.add('hidden');
    document.getElementById('quizArea').classList.remove('hidden');
    
    // Initialize quiz with selected configuration
    initializeQuiz(quizConfig);
}

function initializeQuiz(config) {
    // Load questions based on category and difficulty
    if (config.category === 'math') {
        loadMathQuestions(config);
    } else {
        loadGKQuestions(config);
    }
} 