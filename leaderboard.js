import { database } from './firebase-config.js';

class Leaderboard {
    constructor() {
        this.currentFilter = 'daily';
        this.leaderboardRef = database.ref('leaderboard');
        this.initializeEventListeners();
        this.setupRealtimeUpdates();
    }

    initializeEventListeners() {
        const filterButtons = document.querySelectorAll('.leaderboard-filters button');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.filterLeaderboard(button.dataset.filter);
            });
        });
    }

    setupRealtimeUpdates() {
        // Listen for changes in daily leaderboard
        this.leaderboardRef.child('daily').on('value', (snapshot) => {
            if (this.currentFilter === 'daily') {
                this.updateLeaderboardDisplay(snapshot.val() || {});
            }
        });

        // Listen for changes in weekly leaderboard
        this.leaderboardRef.child('weekly').on('value', (snapshot) => {
            if (this.currentFilter === 'weekly') {
                this.updateLeaderboardDisplay(snapshot.val() || {});
            }
        });

        // Listen for changes in all-time leaderboard
        this.leaderboardRef.child('allTime').on('value', (snapshot) => {
            if (this.currentFilter === 'allTime') {
                this.updateLeaderboardDisplay(snapshot.val() || {});
            }
        });
    }

    updateLeaderboardDisplay(data) {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;

        // Convert object to array and sort
        const entries = Object.values(data).sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.winnings - a.winnings;
        });

        if (entries.length === 0) {
            leaderboardList.innerHTML = `
                <div class="no-entries">
                    <p>No entries yet for ${this.currentFilter} leaderboard</p>
                </div>
            `;
            return;
        }

        leaderboardList.innerHTML = entries.map((entry, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-' + (index + 1) : ''} ${
                entry.userId === auth.currentUser?.uid ? 'current-user' : ''
            }">
                <span class="rank">${index + 1}</span>
                <span class="player">
                    <img src="${entry.profilePic}" alt="Profile">
                    ${entry.name}
                </span>
                <span class="level">Level ${entry.level}</span>
                <span class="score">${entry.score}</span>
                <span class="winnings">₹${entry.winnings}</span>
            </div>
        `).join('');
    }

    filterLeaderboard(filter) {
        this.currentFilter = filter;
        this.leaderboardRef.child(filter).once('value').then(snapshot => {
            this.updateLeaderboardDisplay(snapshot.val() || {});
        });
    }

    addEntry(userData) {
        const timestamp = new Date().getTime();
        const entry = {
            userId: auth.currentUser?.uid || 'anonymous',
            name: userData.name,
            profilePic: userData.profilePic,
            level: userData.level,
            score: userData.score,
            winnings: userData.winnings,
            timestamp
        };

        // Add to all time leaderboard
        this.leaderboardRef.child('allTime').push(entry);

        // Add to daily leaderboard
        if (this.isToday(timestamp)) {
            this.leaderboardRef.child('daily').push(entry);
        }

        // Add to weekly leaderboard
        if (this.isThisWeek(timestamp)) {
            this.leaderboardRef.child('weekly').push(entry);
        }

        // Clean old entries
        this.cleanOldEntries();
    }

    cleanOldEntries() {
        const now = new Date().getTime();

        // Clean daily entries
        this.leaderboardRef.child('daily').once('value', snapshot => {
            const entries = snapshot.val() || {};
            Object.entries(entries).forEach(([key, entry]) => {
                if (!this.isToday(entry.timestamp)) {
                    this.leaderboardRef.child(`daily/${key}`).remove();
                }
            });
        });

        // Clean weekly entries
        this.leaderboardRef.child('weekly').once('value', snapshot => {
            const entries = snapshot.val() || {};
            Object.entries(entries).forEach(([key, entry]) => {
                if (!this.isThisWeek(entry.timestamp)) {
                    this.leaderboardRef.child(`weekly/${key}`).remove();
                }
            });
        });
    }

    isToday(timestamp) {
        const today = new Date();
        const date = new Date(timestamp);
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    isThisWeek(timestamp) {
        const today = new Date();
        const date = new Date(timestamp);
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    }
}

// Initialize leaderboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.leaderboard = new Leaderboard();
}); 