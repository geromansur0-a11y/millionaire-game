/**
 * UI-MANAGER.JS
 * Manager untuk UI dan animasi game
 */

class UIManager {
    constructor() {
        this.gameEngine = window.gameEngine;
        this.config = window.gameConfig;
        this.initialize();
    }

    // Initialize UI
    initialize() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Apply configuration
        this.applyConfig();
        
        // Show loading screen
        this.showLoading(true);
        
        // Initialize after a delay
        setTimeout(() => {
            this.showLoading(false);
            this.showStartScreen();
        }, 2000);
    }

    // Set up event listeners
    setupEventListeners() {
        // Option selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.option')) {
                const option = e.target.closest('.option');
                const index = parseInt(option.dataset.index);
                this.selectOption(index);
            }
        });

        // Submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitAnswer();
            });
        }

        // Quit button
        const quitBtn = document.querySelector('.btn-quit');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                this.quitGame();
            });
        }

        // Lifeline buttons
        ['5050', 'phone', 'audience'].forEach(type => {
            const btn = document.getElementById(`lifeline${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.useLifeline(type);
                });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.gameEngine.gameState.gameActive) return;

            switch(e.key) {
                case '1':
                case 'a':
                    this.selectOption(0);
                    break;
                case '2':
                case 'b':
                    this.selectOption(1);
                    break;
                case '3':
                case 'c':
                    this.selectOption(2);
                    break;
                case '4':
                case 'd':
                    this.selectOption(3);
                    break;
                case 'Enter':
                    this.submitAnswer();
                    break;
                case 'Escape':
                    this.quitGame();
                    break;
            }
        });
    }

    // Apply configuration
    applyConfig() {
        // Apply theme
        const theme = this.config.get('theme');
        if (theme !== 'dark') {
            document.documentElement.setAttribute('data-theme', theme);
        }

        // Apply font size
        const fontSize = this.config.getFontSizeValue();
        document.documentElement.style.fontSize = fontSize;

        // Toggle sounds
        if (!this.config.get('enableSounds')) {
            document.body.classList.add('no-sounds');
        }

        // Toggle animations
        if (!this.config.get('enableAnimations')) {
            document.body.classList.add('no-animations');
        }
    }

    // Show/hide loading screen
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    // Show start screen
    showStartScreen() {
        // Create start screen if it doesn't exist
        let startScreen = document.getElementById('startScreen');
        
        if (!startScreen) {
            startScreen = document.createElement('div');
            startScreen.id = 'startScreen';
            startScreen.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div class="logo" style="font-size: 3.5rem; margin-bottom: 20px;">MILLIONAIRE</div>
                    <div style="font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9;">
                        Jawab 11 pertanyaan untuk memenangkan 1 MILYAR!
                    </div>
                    
                    <div style="display: grid; gap: 20px; max-width: 400px; margin: 0 auto;">
                        <button class="btn btn-start" id="startGameBtn" style="background: linear-gradient(135deg, var(--accent), var(--accent-dark));">
                            <i class="fas fa-play"></i> MULAI GAME
                        </button>
                        
                        <button class="btn btn-start" id="continueGameBtn" style="background: linear-gradient(135deg, var(--safe-zone), #0097e6); display: none;">
                            <i class="fas fa-redo"></i> LANJUTKAN
                        </button>
                        
                        <button class="btn btn-start" onclick="window.gameEngine.ui.showStatistics()" 
                                style="background: linear-gradient(135deg, #8c7ae6, #9c88ff);">
                            <i class="fas fa-chart-bar"></i> STATISTIK
                        </button>
                        
                        <button class="btn btn-start" onclick="window.gameEngine.ui.showSettings()" 
                                style="background: linear-gradient(135deg, #4cd137, #44bd32);">
                            <i class="fas fa-cog"></i> PENGATURAN
                        </button>
                    </div>
                    
                    <div style="margin-top: 40px; font-size: 0.9rem; opacity: 0.7;">
                        <p>Gunakan lifeline dengan bijak!</p>
                        <p>Zona Aman: Level 5 (Rp 10 Juta) & Level 10 (Rp 500 Juta)</p>
                    </div>
                </div>
            `;
            
            const container = document.querySelector('.container');
            if (container) {
                container.prepend(startScreen);
            }
            
            // Add event listeners
            document.getElementById('startGameBtn').addEventListener('click', () => {
                this.startNewGame();
            });
            
            document.getElementById('continueGameBtn').addEventListener('click', () => {
                this.continueGame();
            });
        }
        
        // Show/hide continue button based on saved game
        const continueBtn = document.getElementById('continueGameBtn');
        if (continueBtn) {
            const hasSavedGame = localStorage.getItem('saved_game');
            continueBtn.style.display = hasSavedGame ? 'block' : 'none';
        }
        
        startScreen.style.display = 'block';
    }

    // Start new game
    startNewGame() {
        document.getElementById('startScreen').style.display = 'none';
        this.gameEngine.startGame();
    }

    // Continue saved game
    continueGame() {
        // Implement save/load functionality
        this.showLoading(true);
        
        setTimeout(() => {
            this.showLoading(false);
            // Load game state and continue
            this.startNewGame();
        }, 1000);
    }

    // Update game information display
    updateGameInfo(gameState) {
        const prizeLevels = window.gameDatabase.getPrizeLevels();
        const currentPrize = prizeLevels[Math.min(gameState.currentLevel - 1, prizeLevels.length - 1)];
        
        // Update displays
        this.updateElement('currentPrize', this.formatRupiah(currentPrize));
        this.updateElement('guaranteedPrize', this.formatRupiah(gameState.guaranteedPrize));
        this.updateElement('questionCount', `${gameState.currentLevel}/${prizeLevels.length}`);
        this.updateElement('questionNum', gameState.currentLevel);
        
        // Update safe zone indicator
        this.updateSafeZoneIndicator(gameState);
    }

    // Update timer display
    updateTimer(seconds) {
        const timerText = document.getElementById('timerText');
        const timerDisplay = document.getElementById('timerDisplay');
        
        if (timerText) timerText.textContent = seconds;
        if (timerDisplay) timerDisplay.textContent = `${seconds}s`;
        
        // Update timer color based on remaining time
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            if (seconds <= 10) {
                timerElement.style.background = 'rgba(232, 65, 24, 0.3)';
                timerElement.style.animation = 'pulse 0.5s infinite';
            } else if (seconds <= 20) {
                timerElement.style.background = 'rgba(241, 196, 15, 0.3)';
                timerElement.style.animation = 'pulse 1s infinite';
            } else {
                timerElement.style.background = 'rgba(76, 209, 55, 0.2)';
                timerElement.style.animation = 'pulse 2s infinite';
            }
        }
    }

    // Display question
    displayQuestion(question, level) {
        // Update question text
        this.updateElement('questionText', question.question);
        
        // Display options
        const optionsContainer = document.getElementById('optionsContainer');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
            const labels = ['A', 'B', 'C', 'D'];
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.index = index;
                optionElement.innerHTML = `
                    <div class="option-label">${labels[index]}</div>
                    <div class="option-text">${option}</div>
                `;
                optionsContainer.appendChild(optionElement);
            });
        }
        
        // Reset selection
        this.gameEngine.gameState.selectedOption = null;
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.disabled = true;
        
        // Clear any previous answer highlighting
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'wrong');
            opt.style.opacity = '1';
            opt.style.pointerEvents = 'auto';
            opt.style.transform = 'scale(1)';
        });
    }

    // Select option
    selectOption(index) {
        if (!this.gameEngine.gameState.gameActive) return;
        
        // Deselect all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select clicked option
        const selectedElement = document.querySelector(`.option[data-index="${index}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
            this.gameEngine.gameState.selectedOption = index;
            
            // Enable submit button
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) submitBtn.disabled = false;
        }
    }

    // Submit answer
    submitAnswer() {
        if (this.gameEngine.gameState.selectedOption !== null) {
            this.gameEngine.submitAnswer(this.gameEngine.gameState.selectedOption);
        }
    }

    // Show answer result
    showAnswerResult(selectedIndex, isCorrect, correctIndex) {
        const options = document.querySelectorAll('.option');
        
        options.forEach((opt, index) => {
            if (index === correctIndex) {
                opt.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                opt.classList.add('wrong');
            }
        });
        
        // Disable all options
        options.forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
    }

    // Show correct answer
    showCorrectAnswer(correctIndex) {
        const options = document.querySelectorAll('.option');
        options.forEach((opt, index) => {
            if (index === correctIndex) {
                opt.classList.add('correct');
            }
        });
    }

    // Update prize ladder
    updatePrizeLadder(currentLevel) {
        const prizeLadder = document.getElementById('prizeLadder');
        if (!prizeLadder) return;
        
        const prizeLevels = window.gameDatabase.getPrizeLevels();
        const safeZones = window.gameDatabase.getSafeZoneLevels();
        
        prizeLadder.innerHTML = '';
        
        // Display in reverse order (highest prize first)
        [...prizeLevels].reverse().forEach((prize, index) => {
            const level = prizeLevels.length - index;
            const isSafeZone = safeZones.includes(level);
            const isCurrent = level === currentLevel;
            const isPassed = level < currentLevel;
            
            const prizeItem = document.createElement('div');
            prizeItem.className = 'prize-item';
            
            if (isCurrent) prizeItem.classList.add('current');
            if (isPassed) prizeItem.classList.add('passed');
            if (isSafeZone) {
                prizeItem.style.borderLeft = '4px solid var(--safe-zone)';
            }
            
            prizeItem.innerHTML = `
                <div class="prize-level">
                    <i class="fas ${isPassed ? 'fa-check-circle' : isCurrent ? 'fa-arrow-right' : 'fa-circle'}"></i>
                    <span>Level ${level}</span>
                </div>
                <div class="prize-amount">${this.formatRupiah(prize)}</div>
            `;
            
            prizeLadder.appendChild(prizeItem);
        });
        
        // Scroll to current prize
        setTimeout(() => {
            const currentPrize = document.querySelector('.prize-item.current');
            if (currentPrize) {
                currentPrize.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    // Update lifelines display
    updateLifelines(lifelines) {
        Object.keys(lifelines).forEach(type => {
            const lifeline = lifelines[type];
            const btn = document.getElementById(`lifeline${type.charAt(0).toUpperCase() + type.slice(1)}`);
            
            if (btn) {
                btn.disabled = lifeline.used;
                btn.innerHTML = `
                    <i class="fas ${lifeline.icon}"></i>
                    ${lifeline.name} ${lifeline.used ? '(Digunakan)' : ''}
                `;
            }
        });
    }

    // Use lifeline
    useLifeline(type) {
        const result = this.gameEngine.useLifeline(type);
        
        if (result) {
            switch(result.type) {
                case '5050':
                    this.applyFiftyFifty(result);
                    break;
                case 'phone':
                    this.showPhoneFriendResult(result);
                    break;
                case 'audience':
                    this.showAudiencePoll(result);
                    break;
            }
        }
    }

    // Apply 50:50 lifeline
    applyFiftyFifty(result) {
        result.removedOptions.forEach(index => {
            const option = document.querySelector(`.option[data-index="${index}"]`);
            if (option) {
                option.style.opacity = '0.3';
                option.style.pointerEvents = 'none';
                option.style.transform = 'scale(0.95)';
            }
        });
        
        this.showLifelineMessage('50:50', 'Dua jawaban salah telah dihilangkan!');
    }

    // Show phone friend result
    showPhoneFriendResult(result) {
        const labels = ['A', 'B', 'C', 'D'];
        const message = `Teman Anda berkata: "Saya ${result.confidence} jawabannya adalah ${labels[result.suggestion]}"`;
        this.showLifelineMessage('Telepon Teman', message);
    }

    // Show audience poll
    showAudiencePoll(result) {
        const question = this.gameEngine.gameState.currentQuestion;
        const labels = ['A', 'B', 'C', 'D'];
        
        let pollHTML = '<div style="text-align: left; margin-top: 20px;">';
        result.pollResults.forEach((percent, index) => {
            pollHTML += `
                <div style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${labels[index]}: ${question.options[index]}</span>
                        <span>${percent}%</span>
                    </div>
                    <div style="height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
                        <div style="height: 100%; width: ${percent}%; background: var(--accent); border-radius: 10px; transition: width 1s;"></div>
                    </div>
                </div>
            `;
        });
        pollHTML += '</div>';
        
        this.showLifelineMessage('Tanya Penonton', 'Hasil polling penonton:', pollHTML);
    }

    // Show lifeline message
    showLifelineMessage(title, message, extraContent = '') {
        // Create or update modal
        let modal = document.getElementById('lifelineModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'lifelineModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-icon">🎯</div>
                    <h2 class="modal-title">${title}</h2>
                    <div class="modal-message">${message}</div>
                    <div id="lifelineExtra"></div>
                    <button class="btn btn-submit" onclick="window.gameEngine.ui.closeLifelineModal()" 
                            style="width: 100%; margin-top: 20px;">
                        <i class="fas fa-check"></i> TUTUP
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // Update content
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-message').textContent = message;
        
        const extraDiv = document.getElementById('lifelineExtra');
        if (extraDiv) {
            extraDiv.innerHTML = extraContent;
        }
        
        // Show modal
        modal.style.display = 'flex';
    }

    // Close lifeline modal
    closeLifelineModal() {
        const modal = document.getElementById('lifelineModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Show safe zone message
    showSafeZoneMessage(prize) {
        const safeZone = document.getElementById('safeZone');
        if (safeZone) {
            safeZone.style.display = 'flex';
            document.getElementById('safeZoneAmount').textContent = this.formatRupiah(prize);
            
            // Hide after 5 seconds
            setTimeout(() => {
                safeZone.style.display = 'none';
            }, 5000);
        }
    }

    // Update safe zone indicator
    updateSafeZoneIndicator(gameState) {
        const safeZone = document.getElementById('safeZone');
        if (safeZone) {
            const isInSafeZone = gameState.safeZones.includes(gameState.currentLevel);
            safeZone.style.display = isInSafeZone ? 'flex' : 'none';
            
            if (isInSafeZone) {
                const prizeLevels = window.gameDatabase.getPrizeLevels();
                const currentPrize = prizeLevels[gameState.currentLevel - 1];
                document.getElementById('safeZoneAmount').textContent = this.formatRupiah(currentPrize);
            }
        }
    }

    // Show game over
    showGameOver(message, prize, stats) {
        this.showResultModal('❌ GAME OVER', message, prize, '😢', stats);
    }

    // Show game won
    showGameWon(prize, stats) {
        this.createConfetti();
        this.showResultModal('🎉 JACKPOT!', 'Anda memenangkan 1 MILYAR!', prize, '👑', stats);
    }

    // Show game quit
    showGameQuit(prize, stats) {
        this.showResultModal('🏆 SELESAI', 'Anda memilih untuk berhenti', prize, '💰', stats);
    }

    // Show result modal
    showResultModal(title, message, prize, icon, stats = {}) {
        const modal = document.getElementById('resultModal');
        if (!modal) return;
        
        // Update content
        document.getElementById('modalIcon').textContent = icon;
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('modalPrize').textContent = this.formatRupiah(prize);
        
        // Add statistics if available
        if (stats.correctAnswers !== undefined) {
            const statsHTML = `
                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; text-align: left;">
                        <div>Level Dicapai: <strong>${stats.levelsCompleted}</strong></div>
                        <div>Akurasi: <strong>${stats.accuracy || 0}%</strong></div>
                        <div>Waktu: <strong>${stats.timePlayed || 0}s</strong></div>
                        <div>Lifeline: <strong>${stats.lifelinesUsed || 0}/3</strong></div>
                    </div>
                </div>
            `;
            
            const messageDiv = document.getElementById('modalMessage');
            messageDiv.innerHTML += statsHTML;
        }
        
        // Show modal
        modal.style.display = 'flex';
    }

    // Quit game
    quitGame() {
        if (confirm(`Berhenti dan bawa pulang ${this.formatRupiah(this.gameEngine.gameState.guaranteedPrize)}?`)) {
            this.gameEngine.quitGame();
        }
    }

    // Restart game
    restartGame() {
        const modal = document.getElementById('resultModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        this.showStartScreen();
    }

    // Create confetti effect
    createConfetti() {
        const colors = ['#fbc531', '#4cd137', '#e84118', '#8c7ae6', '#00a8ff'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '15px';
            confetti.style.height = '15px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.opacity = '0';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-20px';
            confetti.style.zIndex = '999';
            confetti.style.animation = `confettiFall ${2 + Math.random() * 3}s linear forwards`;
            confetti.style.animationDelay = Math.random() * 2 + 's';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }

    // Show statistics
    showStatistics() {
        const stats = this.gameEngine.getGameStatistics();
        const history = this.gameEngine.getGameHistory();
        
        let historyHTML = '';
        if (history.length > 0) {
            historyHTML = `
                <div style="max-height: 200px; overflow-y: auto; margin-top: 20px;">
                    <h4 style="color: var(--accent); margin-bottom: 10px;">Riwayat Permainan:</h4>
                    ${history.slice(0, 10).map(game => `
                        <div style="background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 5px; border-radius: 5px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span>${new Date(game.date).toLocaleDateString()}</span>
                                <span style="color: var(--accent); font-weight: bold;">${this.formatRupiah(game.score)}</span>
                            </div>
                            <div style="font-size: 0.8rem; opacity: 0.8;">
                                Level: ${game.levels} | Benar: ${game.correct}/${game.questions}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        const modalHTML = `
            <div class="modal" id="statsModal" style="display: flex;">
                <div class="modal-content">
                    <div class="modal-icon">📊</div>
                    <h2 class="modal-title">STATISTIK</h2>
                    
                    <div style="text-align: left; margin: 20px 0;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                                <div style="font-size: 0.9rem; opacity: 0.8;">Total Permainan</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent);">${stats.totalGames}</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                                <div style="font-size: 0.9rem; opacity: 0.8;">Total Kemenangan</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent);">${this.formatRupiah(stats.totalWinnings)}</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                                <div style="font-size: 0.9rem; opacity: 0.8;">Skor Tertinggi</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent);">${this.formatRupiah(stats.highestScore)}</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px;">
                                <div style="font-size: 0.9rem; opacity: 0.8;">Rata-rata</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent);">${this.formatRupiah(stats.averageScore)}</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 20px; display: flex; justify-content: space-around;">
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; color: var(--accent);">${stats.jackpots}</div>
                                <div style="font-size: 0.9rem;">Jackpot</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; color: var(--accent);">${stats.bestStreak}</div>
                                <div style="font-size: 0.9rem;">Level Tertinggi</div>
                            </div>
                        </div>
                        
                        ${historyHTML}
                    </div>
                    
                    <button class="btn btn-submit" onclick="window.gameEngine.ui.closeModal('statsModal')" 
                            style="width: 100%; margin-top: 20px;">
                        <i class="fas fa-times"></i> TUTUP
                    </button>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('statsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Show settings
    showSettings() {
        const themes = this.config.getAvailableThemes();
        const languages = this.config.getAvailableLanguages();
        const difficulties = this.config.getDifficultyLevels();
        
        const themesHTML = themes.map(theme => `
            <option value="${theme.id}" ${this.config.get('theme') === theme.id ? 'selected' : ''}>
                ${theme.name}
            </option>
        `).join('');
        
        const languagesHTML = languages.map(lang => `
            <option value="${lang.id}" ${this.config.get('language') === lang.id ? 'selected' : ''}>
                ${lang.flag} ${lang.name}
            </option>
        `).join('');
        
        const difficultiesHTML = difficulties.map(diff => `
            <option value="${diff.id}" ${this.config.get('difficulty') === diff.id ? 'selected' : ''}>
                ${diff.name} (${diff.timer}s, ${diff.lifelines} lifeline)
            </option>
        `).join('');
        
        const modalHTML = `
            <div class="modal" id="settingsModal" style="display: flex;">
                <div class="modal-content">
                    <div class="modal-icon">⚙️</div>
                    <h2 class="modal-title">PENGATURAN</h2>
                    
                    <div style="text-align: left; margin: 20px 0;">
                        <div class="form-group">
                            <label for="settingTheme">Tema</label>
                            <select id="settingTheme" class="form-control">${themesHTML}</select>
                        </div>
                        
                        <div class="form-group">
                            <label for="settingLanguage">Bahasa</label>
                            <select id="settingLanguage" class="form-control">${languagesHTML}</select>
                        </div>
                        
                        <div class="form-group">
                            <label for="settingDifficulty">Tingkat Kesulitan</label>
                            <select id="settingDifficulty" class="form-control">${difficultiesHTML}</select>
                        </div>
                        
                        <div class="form-group">
                            <label for="settingTimer">Durasi Timer (detik)</label>
                            <input type="number" id="settingTimer" class="form-control" 
                                   value="${this.config.get('timerDuration')}" min="10" max="60">
                        </div>
                        
                        <div class="form-group">
                            <label for="settingFontSize">Ukuran Font</label>
                            <select id="settingFontSize" class="form-control">
                                <option value="small" ${this.config.get('fontSize') === 'small' ? 'selected' : ''}>Kecil</option>
                                <option value="medium" ${this.config.get('fontSize') === 'medium' ? 'selected' : ''}>Sedang</option>
                                <option value="large" ${this.config.get('fontSize') === 'large' ? 'selected' : ''}>Besar</option>
                                <option value="xlarge" ${this.config.get('fontSize') === 'xlarge' ? 'selected' : ''}>Sangat Besar</option>
                            </select>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 20px;">
                            <div>
                                <input type="checkbox" id="settingSounds" ${this.config.get('enableSounds') ? 'checked' : ''}>
                                <label for="settingSounds">Efek Suara</label>
                            </div>
                            <div>
                                <input type="checkbox" id="settingAnimations" ${this.config.get('enableAnimations') ? 'checked' : ''}>
                                <label for="settingAnimations">Animasi</label>
                            </div>
                            <div>
                                <input type="checkbox" id="settingVibration" ${this.config.get('vibration') ? 'checked' : ''}>
                                <label for="settingVibration">Getar</label>
                            </div>
                            <div>
                                <input type="checkbox" id="settingSafeZone" ${this.config.get('safeZoneEnabled') ? 'checked' : ''}>
                                <label for="settingSafeZone">Zona Aman</label>
                            </div>
                        </div>
                        
                        <div class="form-group" style="margin-top: 20px;">
                            <label for="settingVolume">Volume Suara: <span id="volumeValue">${this.config.get('soundVolume')}</span>%</label>
                            <input type="range" id="settingVolume" class="form-control" 
                                   min="0" max="100" value="${this.config.get('soundVolume')}">
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-submit" onclick="window.gameEngine.ui.saveSettings()" style="flex: 1;">
                            <i class="fas fa-save"></i> SIMPAN
                        </button>
                        <button class="btn btn-quit" onclick="window.gameEngine.ui.closeModal('settingsModal')" style="flex: 1;">
                            <i class="fas fa-times"></i> BATAL
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('settingsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listener for volume slider
        const volumeSlider = document.getElementById('settingVolume');
        const volumeValue = document.getElementById('volumeValue');
        if (volumeSlider && volumeValue) {
            volumeSlider.addEventListener('input', (e) => {
                volumeValue.textContent = e.target.value;
            });
        }
    }

    // Save settings
    saveSettings() {
        const settings = {
            theme: document.getElementById('settingTheme').value,
            language: document.getElementById('settingLanguage').value,
            difficulty: document.getElementById('settingDifficulty').value,
            timerDuration: parseInt(document.getElementById('settingTimer').value),
            fontSize: document.getElementById('settingFontSize').value,
            enableSounds: document.getElementById('settingSounds').checked,
            enableAnimations: document.getElementById('settingAnimations').checked,
            vibration: document.getElementById('settingVibration').checked,
            safeZoneEnabled: document.getElementById('settingSafeZone').checked,
            soundVolume: parseInt(document.getElementById('settingVolume').value)
        };
        
        if (this.config.update(settings)) {
            alert('Pengaturan berhasil disimpan!');
            this.closeModal('settingsModal');
            location.reload();
        } else {
            alert('Gagal menyimpan pengaturan!');
        }
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    // Helper function to update element text
    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    // Format Rupiah
    formatRupiah(amount) {
        if (amount >= 1000000000) {
            return `Rp ${(amount / 1000000000).toFixed(1)} Milyar`;
        } else if (amount >= 1000000) {
            return `Rp ${(amount / 1000000).toFixed(1)} Juta`;
        } else if (amount >= 1000) {
            return `Rp ${(amount / 1000).toFixed(1)} Ribu`;
        }
        return `Rp ${amount}`;
    }
}

// Create global instance and link with game engine
window.uiManager = new UIManager();
window.gameEngine.setUIManager(window.uiManager);

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Add CSS for confetti animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(-100px) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
