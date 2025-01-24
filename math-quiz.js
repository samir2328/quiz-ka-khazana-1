import { getQuestionsByLevel } from './math-questions.js';

class MathQuiz {
    constructor() {
        this.initializeLevelGrid();
        this.currentLevel = 1;
        this.maxUnlockedLevel = parseInt(localStorage.getItem('maxUnlockedLevel')) || 1;
        this.currentQuestion = null;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 30;
        
        // Bind event handlers
        this.handleOptionClick = this.handleOptionClick.bind(this);
        this.hidePopup = this.hidePopup.bind(this);
        this.hideSuccessPopup = this.hideSuccessPopup.bind(this);
        this.hideUnlockPopup = this.hideUnlockPopup.bind(this);
    }

    initializeLevelGrid() {
        const levelGrid = document.querySelector('.level-grid');
        
        // Create level groups (1-100, 101-200, etc.)
        for (let group = 0; group < 10; group++) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'level-group';
            
            const groupTitle = document.createElement('h4');
            groupTitle.className = 'group-title';
            groupTitle.textContent = `Levels ${group * 100 + 1} - ${(group + 1) * 100}`;
            groupDiv.appendChild(groupTitle);

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'level-buttons';

            // Create buttons for each group of 100 levels
            for (let i = 1; i <= 100; i++) {
                const level = group * 100 + i; // Calculate actual level number
                const levelBtn = document.createElement('button');
                levelBtn.className = 'level-btn';
                levelBtn.textContent = level;
                
                // Set button states
                if (level > this.maxUnlockedLevel) {
                    levelBtn.classList.add('locked');
                    levelBtn.disabled = true; // Disable locked levels
                } else {
                    // Add click handler for unlocked levels
                    levelBtn.addEventListener('click', () => this.startLevel(level));
                }
                
                if (level < this.currentLevel) {
                    levelBtn.classList.add('completed');
                }
                if (level === this.currentLevel) {
                    levelBtn.classList.add('current');
                }
                
                buttonsDiv.appendChild(levelBtn);
            }

            groupDiv.appendChild(buttonsDiv);
            levelGrid.appendChild(groupDiv);
        }
    }

    getMaxUnlockedLevel() {
        return parseInt(localStorage.getItem('maxUnlockedLevel') || '1');
    }

    startLevel(level) {
        if (level > this.maxUnlockedLevel) {
            // Show unlock popup
            const popup = document.getElementById('unlockLevelPopup');
            document.getElementById('wantedLevel').textContent = level;
            document.getElementById('currentRequiredLevel').textContent = this.maxUnlockedLevel;
            document.getElementById('playCurrentLevel').textContent = this.maxUnlockedLevel;
            
            // Add event listeners
            const playButton = document.getElementById('playCurrentButton');
            const closeButton = document.getElementById('closeUnlockPopup');
            
            // Remove any existing listeners
            const newPlayButton = playButton.cloneNode(true);
            const newCloseButton = closeButton.cloneNode(true);
            playButton.parentNode.replaceChild(newPlayButton, playButton);
            closeButton.parentNode.replaceChild(newCloseButton, closeButton);
            
            // Add new listeners
            newPlayButton.onclick = () => {
                this.hideUnlockPopup();
                this.startLevel(this.maxUnlockedLevel);
            };
            
            newCloseButton.onclick = () => {
                this.hideUnlockPopup();
            };
            
            popup.classList.remove('hidden');
            setTimeout(() => popup.classList.add('show'), 10);
            return;
        }

        this.currentLevel = level;
        const question = this.generateQuestion(level);
        
        // Hide level select and show quiz area
        const levelSelect = document.getElementById('levelSelect');
        const quizArea = document.getElementById('quizArea');
        
        levelSelect.classList.add('hidden');
        quizArea.classList.remove('hidden');
        
        this.showQuestion(question);
        this.startTimer();
    }

    generateQuestion(level) {
        let num1, num2, operator, answer, question;
        
        // Adjust difficulty based on level ranges
        const range = Math.floor((level - 1) / 100); // 0-9 for 1000 levels
        const max = Math.min(level * 10, 10000); // Increased maximum
        const min = Math.max(1, level * 2);
        
        // Adjust numbers based on operator
        const getNumbers = (operator) => {
            if (operator === '×') {
                // For multiplication, keep second number smaller to avoid very large results
                num1 = Math.floor(Math.random() * (Math.min(max, 20) - min + 1)) + min;
                num2 = Math.floor(Math.random() * 12) + 1; // Keep second number between 1-12
            } else {
                num1 = Math.floor(Math.random() * (max - min + 1)) + min;
                num2 = Math.floor(Math.random() * (max - min + 1)) + min;
            }
            
            // For subtraction, ensure num1 is larger
            if (operator === '-' && num1 < num2) {
                [num1, num2] = [num2, num1];
            }
        };

        // Choose operator based on level
        let operators;
        if (level <= 20) {
            operators = ['+', '-']; // Basic operations for early levels
        } else if (level <= 50) {
            operators = ['+', '-', '×']; // Include multiplication
        } else {
            // More multiplication for higher levels
            operators = ['+', '-', '×', '×'];
        }
        
        operator = operators[Math.floor(Math.random() * operators.length)];
        getNumbers(operator);
        
        // Calculate answer
        switch(operator) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                answer = num1 - num2;
                break;
            case '×':
                answer = num1 * num2;
                break;
        }
        
        question = `${num1} ${operator} ${num2} = ?`;
        
        // Generate wrong options
        const options = this.generateOptions(answer, operator);
        
        return {
            question,
            options,
            correctAnswer: options.indexOf(answer.toString()),
            level
        };
    }

    generateOptions(correctAnswer, operator) {
        const options = [correctAnswer.toString()];
        
        while (options.length < 4) {
            let wrongAnswer;
            
            if (operator === '×') {
                // For multiplication, generate more realistic wrong answers
                const errorTypes = [
                    () => correctAnswer + Math.floor(Math.random() * 5) + 1, // Small addition error
                    () => correctAnswer - Math.floor(Math.random() * 5) - 1, // Small subtraction error
                    () => correctAnswer + 10, // Common mistake: adding 10
                    () => Math.floor(correctAnswer * 1.5), // Multiplication error
                ];
                wrongAnswer = errorTypes[Math.floor(Math.random() * errorTypes.length)]();
            } else {
                // For addition and subtraction
                const range = Math.max(5, Math.floor(correctAnswer * 0.2));
                wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1) * 
                             Math.floor(Math.random() * range);
            }
            
            // Ensure positive and unique
            wrongAnswer = Math.abs(wrongAnswer);
            if (!options.includes(wrongAnswer.toString())) {
                options.push(wrongAnswer.toString());
            }
        }
        
        // Shuffle options
        return this.shuffleArray(options);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    showQuestion(question) {
        this.currentQuestion = question;
        
        document.getElementById('questionNumber').textContent = `Level ${question.level}`;
        document.getElementById('question').textContent = question.question;
        
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.dataset.index = index;
            button.addEventListener('click', this.handleOptionClick);
            optionsContainer.appendChild(button);
        });
    }

    handleOptionClick(event) {
        const selectedIndex = parseInt(event.target.dataset.index);
        const buttons = document.querySelectorAll('.option-button');
        
        // Disable all buttons
        buttons.forEach(button => button.disabled = true);
        
        if (selectedIndex === this.currentQuestion.correctAnswer) {
            // Correct answer
            event.target.classList.add('correct');
            this.handleCorrectAnswer();
            setTimeout(() => this.proceedToNext(), 1000);
        } else {
            // Wrong answer
            event.target.classList.add('wrong');
            buttons[this.currentQuestion.correctAnswer].classList.add('correct');
            this.handleWrongAnswer();
        }
    }

    handleCorrectAnswer() {
        clearInterval(this.timer);
        this.score++;
        
        // Create game result data
        const gameData = {
            level: this.currentLevel,
            score: this.score,
            timeLeft: this.timeLeft,
            winnings: this.calculateWinnings(),
            timestamp: new Date().getTime()
        };

        // Save game stats to user's profile
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            if (!currentUser.stats) {
                currentUser.stats = {
                    totalGames: 0,
                    totalScore: 0,
                    totalWinnings: 0,
                    matchHistory: []
                };
            }

            // Update stats
            currentUser.stats.totalGames++;
            currentUser.stats.totalScore += gameData.score;
            currentUser.stats.totalWinnings += gameData.winnings;

            // Add to match history
            currentUser.stats.matchHistory.unshift({
                level: gameData.level,
                score: gameData.score,
                winnings: gameData.winnings,
                timeLeft: gameData.timeLeft,
                date: gameData.timestamp,
                isCorrect: true
            });

            // Keep only last 50 matches
            currentUser.stats.matchHistory = currentUser.stats.matchHistory.slice(0, 50);

            // Update user in users array
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === currentUser.email);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
            }

            // Update current user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // Update profile display if profile exists
            if (window.profile) {
                window.profile.updateDisplay();
            }
        }

        // Unlock next level when current level is completed
        if (this.currentLevel >= this.maxUnlockedLevel) {
            this.maxUnlockedLevel = this.currentLevel + 1;
            localStorage.setItem('maxUnlockedLevel', this.maxUnlockedLevel.toString());
        }

        // Update user stats
        if (window.auth) {
            window.auth.updateUserStats(gameData);
        }

        // Update leaderboard
        if (window.leaderboard) {
            const userData = {
                name: window.auth?.currentUser?.name || 'Anonymous',
                profilePic: window.auth?.currentUser?.profilePic || 'assets/default-profile.png',
                ...gameData
            };
            window.leaderboard.addEntry(userData);
        }
        
        // Show success popup
        const popup = document.getElementById('successPopup');
        document.getElementById('completedLevel').textContent = this.currentLevel;
        
        popup.classList.remove('hidden');
        setTimeout(() => popup.classList.add('show'), 10);

        // Add event listeners to popup buttons
        document.getElementById('nextLevelButton').onclick = () => {
            if (this.currentLevel < 1000) { // Check if not at max level
                this.hideSuccessPopup();
                this.currentLevel++; // Increment current level
                this.startLevel(this.currentLevel);
            }
        };

        document.getElementById('backToLevelsButton').onclick = () => {
            this.hideSuccessPopup();
            this.proceedToNext();
        };
    }

    hideSuccessPopup() {
        const popup = document.getElementById('successPopup');
        popup.classList.remove('show');
        setTimeout(() => popup.classList.add('hidden'), 300);
    }

    handleWrongAnswer() {
        clearInterval(this.timer);
        
        // Update profile with failed attempt
        if (window.profile) {
            window.profile.updateGameStats({
                level: this.currentLevel,
                score: 0,
                timeLeft: 0,
                winnings: 0,
                timestamp: new Date().getTime()
            });
        }

        // Show popup with correct answer
        const popup = document.getElementById('resultPopup');
        const correctAnswer = this.currentQuestion.options[this.currentQuestion.correctAnswer];
        document.getElementById('correctAnswer').textContent = correctAnswer;
        
        popup.classList.remove('hidden');
        setTimeout(() => popup.classList.add('show'), 10);

        // Add event listeners to popup buttons
        document.getElementById('retryButton').onclick = () => {
            this.hidePopup();
            this.startLevel(this.currentLevel);
        };

        document.getElementById('backToLevels').onclick = () => {
            this.hidePopup();
            this.proceedToNext();
        };
    }

    hidePopup() {
        const popup = document.getElementById('resultPopup');
        popup.classList.remove('show');
        setTimeout(() => popup.classList.add('hidden'), 300);
    }

    proceedToNext() {
        document.getElementById('quizArea').classList.add('hidden');
        document.getElementById('levelSelect').classList.remove('hidden');
        
        // Update level button states
        const levelButtons = document.querySelectorAll('.level-btn');
        levelButtons.forEach(btn => {
            const level = parseInt(btn.textContent);
            
            // Remove all state classes first
            btn.classList.remove('locked', 'completed', 'current');
            btn.disabled = false; // Enable all buttons first
            
            // Add appropriate classes and handlers
            if (level > this.maxUnlockedLevel) {
                btn.classList.add('locked');
                btn.disabled = true; // Disable locked levels
            } else {
                // Clear existing event listeners
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add new click handler
                newBtn.addEventListener('click', () => this.startLevel(level));
                
                if (level < this.currentLevel) {
                    newBtn.classList.add('completed');
                }
                if (level === this.currentLevel) {
                    newBtn.classList.add('current');
                }
            }
        });
    }

    startTimer() {
        this.timeLeft = 30;
        document.getElementById('timer').textContent = `${this.timeLeft}s`;
        
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = `${this.timeLeft}s`;
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.handleWrongAnswer();
                this.proceedToNext();
            }
        }, 1000);
    }

    calculateWinnings() {
        // Base winnings calculation
        let baseWinnings = this.currentLevel * 10; // ₹10 per level
        let scoreBonus = this.score * 5;    // ₹5 per point
        let timeBonus = this.timeLeft * 2;  // ₹2 per second left
        
        // Bonus for higher levels
        if (this.currentLevel > 50) baseWinnings *= 1.5;
        if (this.currentLevel > 100) baseWinnings *= 2;
        
        return Math.round(baseWinnings + scoreBonus + timeBonus);
    }

    saveGameStats(gameData) {
        try {
            // Get existing stats
            const stats = JSON.parse(localStorage.getItem('gameStats')) || {
                gamesPlayed: 0,
                correctAnswers: 0,
                totalWinnings: 0,
                recentGames: []
            };

            // Update stats
            stats.gamesPlayed++;
            stats.correctAnswers += this.score;
            stats.totalWinnings += gameData.winnings;

            // Add to recent games
            stats.recentGames.unshift({
                level: gameData.level,
                score: gameData.score,
                winnings: gameData.winnings,
                timestamp: gameData.timestamp
            });

            // Keep only last 10 games
            stats.recentGames = stats.recentGames.slice(0, 10);

            // Save updated stats
            localStorage.setItem('gameStats', JSON.stringify(stats));
            console.log('Game stats saved:', stats);
        } catch (error) {
            console.error('Error saving game stats:', error);
        }
    }

    hideUnlockPopup() {
        const popup = document.getElementById('unlockLevelPopup');
        popup.classList.remove('show');
        setTimeout(() => popup.classList.add('hidden'), 300);
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mathQuiz = new MathQuiz();
}); 