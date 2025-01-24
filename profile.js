class Profile {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.initializeProfile();
        this.setupEventListeners();
    }

    initializeProfile() {
        if (!this.currentUser) return;

        const name = this.currentUser.name || 'User Name';
        const email = this.currentUser.email || 'user@email.com';

        // Update profile info with capitalized name
        document.getElementById('profileName').textContent = this.capitalizeWords(name);
        document.getElementById('profileEmail').textContent = email;
        
        // Set name initial in avatar
        const initial = name.charAt(0).toUpperCase();
        document.getElementById('nameInitial').textContent = initial;

        // Load profile picture if exists
        const profileImage = document.getElementById('profileImage');
        if (this.currentUser.profilePic && this.currentUser.profilePic !== 'assets/default-profile.png') {
            profileImage.src = this.currentUser.profilePic;
        }

        this.updateDisplay();
    }

    capitalizeWords(str) {
        return str.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    setupEventListeners() {
        // Profile picture upload
        const profileUpload = document.getElementById('profileUpload');
        const dropZone = document.querySelector('.profile-picture-container');

        if (profileUpload && dropZone) {
            // File input change
            profileUpload.addEventListener('change', (e) => this.handleProfilePicUpload(e.target.files[0]));

            // Drag and drop events
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file) this.handleProfilePicUpload(file);
            });

            // Click handler
            dropZone.addEventListener('click', () => {
                profileUpload.click();
            });
        }
    }

    handleProfilePicUpload(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Update profile image
            const profileImage = document.getElementById('profileImage');
            profileImage.src = e.target.result;
            
            // Update current user data
            this.currentUser.profilePic = e.target.result;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // Update users array
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === this.currentUser.email);
            if (userIndex !== -1) {
                users[userIndex].profilePic = e.target.result;
                localStorage.setItem('users', JSON.stringify(users));
            }

            this.showNotification('Profile picture updated successfully!', 'success');
        };

        reader.onerror = () => {
            this.showNotification('Error uploading image. Please try again.', 'error');
        };

        reader.readAsDataURL(file);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateDisplay() {
        if (!this.currentUser || !this.currentUser.stats) return;

        const stats = this.currentUser.stats;

        // Update stats cards
        document.getElementById('gamesPlayed').textContent = stats.totalGames || 0;
        document.getElementById('totalScore').textContent = stats.totalScore || 0;
        document.getElementById('totalWinnings').textContent = `₹${stats.totalWinnings || 0}`;
        
        // Calculate progress rate (games/100 * 100)
        const progressRate = Math.min(Math.round((stats.totalGames / 100) * 100), 100);
        document.getElementById('progressRate').textContent = `${progressRate}%`;

        // Update game history
        this.updateGameHistory();
    }

    updateGameHistory() {
        const recentGamesList = document.getElementById('recentGamesList');
        if (!recentGamesList || !this.currentUser.stats?.matchHistory) {
            recentGamesList.innerHTML = '<p class="no-games">No games played yet</p>';
            return;
        }

        const history = this.currentUser.stats.matchHistory;
        recentGamesList.innerHTML = history.map(game => `
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

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profile = new Profile();
}); 