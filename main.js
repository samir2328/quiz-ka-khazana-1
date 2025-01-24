// Main app functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game buttons
    const mathQuizBtn = document.getElementById('startMathQuiz');
    const gkQuizBtn = document.getElementById('startGKQuiz');

    if (mathQuizBtn) {
        mathQuizBtn.addEventListener('click', () => {
            // Hide home section
            document.getElementById('homeSection').classList.remove('active');
            
            // Show level select
            document.getElementById('levelSelect').classList.remove('hidden');
            document.getElementById('quizArea').classList.add('hidden');
            
            // Initialize new quiz if not already initialized
            if (!window.mathQuiz) {
                window.mathQuiz = new MathQuiz();
            }
        });
    }

    if (gkQuizBtn) {
        gkQuizBtn.addEventListener('click', () => {
            // Show coming soon popup
            const popup = document.getElementById('comingSoonPopup');
            popup.classList.remove('hidden');
            setTimeout(() => popup.classList.add('show'), 10);

            // Add close handler
            const closeBtn = document.getElementById('closePopupBtn');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    popup.classList.remove('show');
                    setTimeout(() => popup.classList.add('hidden'), 300);
                };
            }
        });
    }

    // Handle navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            
            // Don't show popup for Home section, Profile, or Logout
            if (section !== 'home' && section !== 'profile' && !e.target.classList.contains('logout-btn')) {
                // Show coming soon popup with same message for all sections
                const popup = document.getElementById('comingSoonPopup');
                
                // Use same message for all sections
                document.getElementById('comingSoonTitle').textContent = 'Feature Coming Soon!';
                document.getElementById('comingSoonMessage').innerHTML = 
                    'This feature is under development. Check back soon!<br><br>' +
                    'Meanwhile, try our Math Quiz - it\'s available now!';
                
                // Update popup buttons
                document.querySelector('.popup-buttons').innerHTML = `
                    <button class="try-math-btn" onclick="startMathQuiz()">Try Math Quiz</button>
                    <button id="closePopupBtn" class="back-btn">Close</button>
                `;
                
                popup.style.display = 'flex';
                popup.classList.remove('hidden');
                popup.classList.add('show');

                return;
            }
            
            // Handle section switching for Home and Profile
            if (section === 'home' || section === 'profile') {
                // Hide all sections
                document.querySelectorAll('.section').forEach(s => {
                    s.classList.remove('active');
                });
                
                // Show selected section
                document.getElementById(`${section}Section`).classList.add('active');
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => {
                    l.classList.remove('active');
                });
                e.target.classList.add('active');
            } else if (e.target.classList.contains('logout-btn')) {
                // Handle logout
                if (window.auth) {
                    window.auth.logout();
                }
            }
        });
    });

    // Close popup when clicking outside
    document.getElementById('comingSoonPopup').addEventListener('click', (e) => {
        if (e.target === document.getElementById('comingSoonPopup')) {
            e.target.classList.remove('show');
            setTimeout(() => {
                e.target.classList.add('hidden');
                e.target.style.display = 'none';
            }, 300);
        }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const popup = document.getElementById('comingSoonPopup');
            if (!popup.classList.contains('hidden')) {
                popup.classList.remove('show');
                setTimeout(() => {
                    popup.classList.add('hidden');
                    popup.style.display = 'none';
                }, 300);
            }
        }
    });
});

// Function to start Math Quiz
function startMathQuiz() {
    // Hide popup
    const popup = document.getElementById('comingSoonPopup');
    popup.classList.remove('show');
    popup.classList.add('hidden');

    // Hide home section
    document.getElementById('homeSection').classList.remove('active');
    
    // Show level select
    document.getElementById('levelSelect').classList.remove('hidden');
    document.getElementById('quizArea').classList.add('hidden');
    
    // Initialize new quiz if not already initialized
    if (!window.mathQuiz) {
        window.mathQuiz = new MathQuiz();
    }
} 