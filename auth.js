class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.recoveryData = new Map(); // Store recovery codes
        this.initializeEventListeners();
        this.checkSession();
    }

    initializeEventListeners() {
        // Signup form submission
        const signupForm = document.getElementById('signupFormElement');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // Login form submission
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Auth toggle buttons
        document.querySelectorAll('.toggle-auth').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuth(e.target.dataset.form);
            });
        });

        // Password recovery form
        const recoveryForm = document.getElementById('passwordRecoveryForm');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordRecovery();
            });
        }

        // Code verification form
        const verifyCodeForm = document.getElementById('verifyCodeForm');
        if (verifyCodeForm) {
            verifyCodeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCodeVerification();
            });
        }

        // Resend code button
        const resendButton = document.getElementById('resendCode');
        if (resendButton) {
            resendButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.resendRecoveryCode();
            });
        }

        // Setup verification code inputs
        this.setupVerificationInputs();

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Add logout button listener
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-link';
        logoutBtn.textContent = 'Logout';
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        document.querySelector('.nav-links').appendChild(logoutBtn);
    }

    checkSession() {
        // Check if user is logged in
        if (this.currentUser) {
            this.showAppScreen();
        } else {
            // Show auth screen with signup form
            document.getElementById('authScreen').classList.add('active');
            document.getElementById('appScreen').classList.remove('active');
            
            // Show signup form by default
            this.toggleAuth('signup');
        }
    }

    handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
            // Validate password match
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match!');
            }

            // Check if email already exists
            const existingUser = this.users.find(user => user.email === email);
            if (existingUser) {
                throw new Error('Email already registered!');
            }

            // Check if name already exists
            const existingName = this.users.find(user => 
                user.name.toLowerCase() === name.toLowerCase()
            );
            if (existingName) {
                throw new Error('This name is already taken. Please choose a different name.');
            }

            // Validate name length
            if (name.length < 2 || name.length > 30) {
                throw new Error('Name must be between 2 and 30 characters.');
            }

            // Validate name format (letters, spaces, and common special characters only)
            const nameRegex = /^[A-Za-z\s\-'.]+$/;
            if (!nameRegex.test(name)) {
                throw new Error('Name can only contain letters, spaces, hyphens, apostrophes, and periods.');
            }

            // Create user data
            const userData = {
                name: name,
                email: email,
                password: this.hashPassword(password), // Remember to hash password in production
                profilePic: 'assets/default-profile.png',
                stats: {
                    totalGames: 0,
                    gamesWon: 0,
                    totalScore: 0,
                    highestLevel: 1,
                    totalWinnings: 0,
                    winStreak: 0,
                    currentStreak: 0,
                    achievements: [],
                    matchHistory: []
                },
                joinDate: new Date().getTime()
            };

            // Add user to users array
            this.users.push(userData);
            localStorage.setItem('users', JSON.stringify(this.users));

            // Set current user
            this.currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(userData));

            // Show success message
            this.showNotification('Signup successful!', 'success');
            
            // Update players list
            if (window.players) {
                window.players.refreshPlayers();
            }

            // Show app screen
            this.showAppScreen();

        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showAppScreen();
        } else {
            this.showError('Invalid email or password');
        }
    }

    showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        const activeForm = document.querySelector('.auth-form.active');
        activeForm.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 3000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const activeForm = document.querySelector('.auth-form.active');
        activeForm.appendChild(successDiv);

        setTimeout(() => successDiv.remove(), 3000);
    }

    toggleAuth(form) {
        const loginContainer = document.getElementById('loginForm');
        const signupContainer = document.getElementById('signupForm');

        if (form === 'login') {
            loginContainer.classList.add('active');
            signupContainer.classList.remove('active');
        } else {
            loginContainer.classList.remove('active');
            signupContainer.classList.add('active');
        }

        // Clear any error messages
        const errors = document.querySelectorAll('.error-message');
        errors.forEach(error => error.remove());

        // Clear form inputs
        const inputs = document.querySelectorAll('.auth-form input');
        inputs.forEach(input => input.value = '');
    }

    showAppScreen() {
        document.getElementById('authScreen').classList.remove('active');
        document.getElementById('appScreen').classList.add('active');
        
        // Update profile information
        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        
        // Update stats
        this.updateStats();
    }

    updateStats() {
        const stats = this.currentUser.stats;
        document.getElementById('gamesPlayed').textContent = stats.gamesPlayed;
        document.getElementById('correctAnswers').textContent = stats.correctAnswers;
        const winRate = stats.totalQuestions > 0 
            ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) 
            : 0;
        document.getElementById('winRate').textContent = `${winRate}%`;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('authScreen').classList.add('active');
        document.getElementById('appScreen').classList.remove('active');
        this.toggleAuth('signup');
    }

    handlePasswordRecovery() {
        const email = document.getElementById('recoveryEmail').value;
        const user = this.users.find(u => u.email === email);

        if (!user) {
            this.showError('No account found with this email');
            return;
        }

        // Generate recovery code
        const recoveryCode = this.generateRecoveryCode();
        
        // Store recovery data
        this.recoveryData.set(email, {
            code: recoveryCode,
            timestamp: Date.now(),
            attempts: 0
        });

        // Send recovery email (simulated)
        this.sendRecoveryEmail(email, recoveryCode);

        // Show verification form
        this.showVerificationForm(email);
    }

    generateRecoveryCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    sendRecoveryEmail(email, code) {
        // In a real application, you would use a backend service to send emails
        console.log(`Recovery code ${code} sent to ${email}`);
        // For demo purposes, show the code in an alert
        alert(`Your recovery code is: ${code}\n(In a real app, this would be sent to your email)`);
    }

    showVerificationForm(email) {
        document.getElementById('recoveryForm').classList.remove('active');
        const verificationForm = document.getElementById('codeVerificationForm');
        verificationForm.classList.add('active');
        verificationForm.dataset.email = email;

        // Clear and focus first input
        const inputs = verificationForm.querySelectorAll('.code-input');
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
    }

    setupVerificationInputs() {
        const inputs = document.querySelectorAll('.code-input');
        inputs.forEach((input, index) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= 0 && e.key <= 9) {
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                    if (this.isCodeComplete(inputs)) {
                        this.showNewPasswordInputs();
                    }
                } else if (e.key === 'Backspace') {
                    if (index > 0) {
                        inputs[index - 1].focus();
                    }
                }
            });
        });
    }

    isCodeComplete(inputs) {
        return Array.from(inputs).every(input => input.value.length === 1);
    }

    showNewPasswordInputs() {
        document.querySelector('.new-password-inputs').classList.remove('hidden');
    }

    handleCodeVerification() {
        const form = document.getElementById('codeVerificationForm');
        const email = form.dataset.email;
        const recoveryData = this.recoveryData.get(email);

        if (!recoveryData) {
            this.showError('Recovery session expired. Please try again.');
            return;
        }

        // Get entered code
        const inputs = form.querySelectorAll('.code-input');
        const enteredCode = Array.from(inputs).map(input => input.value).join('');

        // Verify code
        if (enteredCode !== recoveryData.code) {
            recoveryData.attempts++;
            if (recoveryData.attempts >= 3) {
                this.recoveryData.delete(email);
                this.showError('Too many attempts. Please try again.');
                this.toggleAuth('recovery');
                return;
            }
            this.showError('Invalid code. Please try again.');
            return;
        }

        // Get new password
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword.length < 8) {
            this.showError('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        // Update user's password
        const user = this.users.find(u => u.email === email);
        user.password = newPassword;
        localStorage.setItem('users', JSON.stringify(this.users));

        // Clean up recovery data
        this.recoveryData.delete(email);

        this.showSuccess('Password updated successfully!');
        this.toggleAuth('login');
    }

    resendRecoveryCode() {
        const form = document.getElementById('codeVerificationForm');
        const email = form.dataset.email;
        
        if (!email) {
            this.showError('Please start the recovery process again');
            this.toggleAuth('recovery');
            return;
        }

        const newCode = this.generateRecoveryCode();
        this.recoveryData.set(email, {
            code: newCode,
            timestamp: Date.now(),
            attempts: 0
        });

        this.sendRecoveryEmail(email, newCode);
    }

    showSection(sectionName) {
        // Remove active class from all sections and nav links
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to selected section and nav link
        const selectedSection = document.getElementById(`${sectionName}Section`);
        const selectedLink = document.querySelector(`.nav-link[data-section="${sectionName}"]`);
        
        if (selectedSection) {
            selectedSection.classList.add('active');
        }
        if (selectedLink) {
            selectedLink.classList.add('active');
        }
    }

    updateUserStats(gameData) {
        if (!this.currentUser) return;

        // Initialize stats if they don't exist
        if (!this.currentUser.stats) {
            this.currentUser.stats = {
                totalGames: 0,
                gamesWon: 0,
                totalScore: 0,
                highestLevel: 1,
                totalWinnings: 0,
                matchHistory: []
            };
        }

        const stats = this.currentUser.stats;
        stats.totalGames++;
        stats.totalScore += gameData.score;
        stats.totalWinnings += gameData.winnings;

        // Add to match history
        stats.matchHistory.unshift({
            level: gameData.level,
            score: gameData.score,
            winnings: gameData.winnings,
            timeLeft: gameData.timeLeft,
            date: new Date().getTime(),
            isCorrect: gameData.score > 0
        });

        // Keep only last 50 matches
        stats.matchHistory = stats.matchHistory.slice(0, 50);

        // Update user in users array
        const userIndex = this.users.findIndex(u => u.email === this.currentUser.email);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
        }

        // Update current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // Update profile display
        this.updateProfileDisplay();
    }

    updateProfileDisplay() {
        if (!this.currentUser || !this.currentUser.stats) return;

        const stats = this.currentUser.stats;
        const recentGamesList = document.getElementById('recentGamesList');

        // Update stats cards
        document.getElementById('gamesPlayed').textContent = stats.totalGames;
        document.getElementById('totalScore').textContent = stats.totalScore;
        document.getElementById('totalWinnings').textContent = `₹${stats.totalWinnings}`;
        document.getElementById('progressRate').textContent = 
            `${Math.round((stats.totalGames / 100) * 100)}%`;

        // Update recent games list
        if (recentGamesList && stats.matchHistory) {
            recentGamesList.innerHTML = stats.matchHistory.map(game => `
                <div class="game-history-item ${game.isCorrect ? 'won' : 'lost'}">
                    <div class="game-info">
                        <span class="game-level">Level ${game.level}</span>
                        <span class="game-score">Score: ${game.score}</span>
                        <span class="game-winnings">₹${game.winnings}</span>
                        ${game.timeLeft ? `<span class="time-left">Time: ${game.timeLeft}s</span>` : ''}
                    </div>
                    <div class="game-result">
                        ${game.isCorrect ? '🎯 Correct' : '❌ Wrong'}
                    </div>
                    <div class="game-date">
                        ${new Date(game.date).toLocaleDateString()} 
                        ${new Date(game.date).toLocaleTimeString()}
                    </div>
                </div>
            `).join('');
        }
    }

    showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new Auth();
}); 