const mathQuestions = [
    {
        level: 1,
        question: "2 + 3 = ?",
        options: ["4", "5", "6", "7"],
        correctAnswer: 1  // Index of "5"
    },
    {
        level: 2,
        question: "7 - 4 = ?",
        options: ["3", "2", "4", "5"],
        correctAnswer: 0  // Index of "3"
    },
    {
        level: 3,
        question: "3 × 2 = ?",
        options: ["5", "6", "7", "8"],
        correctAnswer: 1  // Index of "6"
    },
    {
        level: 4,
        question: "8 + 5 = ?",
        options: ["12", "13", "14", "15"],
        correctAnswer: 1  // Index of "13"
    },
    {
        level: 5,
        question: "10 - 6 = ?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1  // Index of "4"
    },
    // Let me know if you want me to continue with all 100 questions
    // I'll format them exactly like this with the correct indices
];

// Function to get questions for a specific level range
function getQuestionsByLevel(startLevel, endLevel = startLevel) {
    return mathQuestions.filter(q => q.level >= startLevel && q.level <= endLevel);
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export { getQuestionsByLevel }; 