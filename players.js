class Players {
    constructor() {
        this.players = this.getPlayers();
        this.initializePlayers();
        this.setupEventListeners();
    }

    getPlayers() {
        // Get all users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        return users.map(user => {
            // Get user's personal game stats
            const userStats = JSON.parse(localStorage.getItem(`gameStats_${user.email}`)) || {
                totalGames: 0,
                correctAnswers: 0,
                lastCompletedLevel: 0
            };
            
            // Calculate win rate based on games played
            const winRate = userStats.totalGames > 0 ? 
                Math.round((userStats.totalGames / 100) * 100) : 0;
            
            return {
                name: user.name,
                profilePic: user.profilePic,
                stats: {
                    totalGames: userStats.totalGames || 0,
                    lastCompletedLevel: userStats.lastCompletedLevel || 0,
                    winRate: winRate // Win rate is now based on games played
                }
            };
        });
    }

    initializePlayers() {
        const playersGrid = document.querySelector('.players-grid');
        if (!playersGrid) return;

        // Sort players by total games played (most active players first)
        const sortedPlayers = this.players.sort((a, b) => 
            b.stats.totalGames - a.stats.totalGames
        );

        playersGrid.innerHTML = sortedPlayers.map(player => {
            const levelText = player.stats.totalGames === 0 ? 
                'No games played yet' : 
                `Level ${player.stats.lastCompletedLevel}`;

            // Calculate progress percentage
            const progressText = player.stats.totalGames > 0 ?
                `Progress: ${player.stats.winRate}%` :
                '';

            return `
                <div class="player-card" data-name="${player.name}">
                    <img src="${player.profilePic || 'assets/default-profile.png'}" 
                         alt="${player.name}" 
                         class="player-avatar">
                    <div class="player-info">
                        <h3>${player.name}</h3>
                        <div class="player-stats">
                            <span class="games-played">Games: ${player.stats.totalGames}</span>
                            ${player.stats.totalGames > 0 ? 
                                `<span class="progress-rate">${progressText}</span>` : 
                                ''}
                        </div>
                        <div class="level-info">
                            ${levelText}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupEventListeners() {
        // Add click listeners to player cards
        document.querySelector('.players-grid')?.addEventListener('click', (e) => {
            const playerCard = e.target.closest('.player-card');
            if (playerCard) {
                this.showPlayerDetails(playerCard.dataset.name);
            }
        });

        // Close popup button
        document.querySelector('.close-popup-btn')?.addEventListener('click', () => {
            this.hidePlayerDetails();
        });

        // Close on outside click
        document.querySelector('.player-details-popup')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('result-popup')) {
                this.hidePlayerDetails();
            }
        });
    }

    showPlayerDetails(name) {
        const player = this.players.find(p => p.name === name);
        if (!player) return;

        const popup = document.querySelector('.player-details-popup');
        if (!popup) return;

        // Update popup content
        popup.querySelector('.player-popup-img').src = player.profilePic || 'assets/default-profile.png';
        popup.querySelector('.player-name').textContent = player.name;
        popup.querySelector('.player-email').style.display = 'none';
        popup.querySelector('.games-played').textContent = player.stats.totalGames;
        
        // Only show stats if player has played games
        if (player.stats.totalGames > 0) {
            popup.querySelector('.win-rate').textContent = `${player.stats.winRate}%`;
            popup.querySelector('.highest-level').textContent = player.stats.lastCompletedLevel;
        } else {
            popup.querySelector('.win-rate').textContent = '0%';
            popup.querySelector('.highest-level').textContent = 'N/A';
        }

        popup.classList.remove('hidden');
        setTimeout(() => popup.classList.add('show'), 10);
    }

    hidePlayerDetails() {
        const popup = document.querySelector('.player-details-popup');
        if (!popup) return;

        popup.classList.remove('show');
        setTimeout(() => popup.classList.add('hidden'), 300);
    }

    refreshPlayers() {
        this.players = this.getPlayers();
        this.initializePlayers();
    }
}

// Initialize players when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.players = new Players();
}); 