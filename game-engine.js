/**
 * GAME-ENGINE.JS
 * Engine utama game Who Wants to Be a Millionaire
 */

class GameEngine {
    constructor() {
        this.gameState = null;
        this.database = window.gameDatabase;
        this.config = window.gameConfig;
        this.ui = null; // Will be set by UIManager
        this.timerInterval = null;
        this.initialize();
    }

    // Initialize game engine
    initialize() {
        this.resetGame();
    }

    // Reset game state
    resetGame() {
        this.gameState = {
            currentLevel: 1,
            score: 0,
            guaranteedPrize: 0,
            lifelines: {
                "5050": { used: false, name: "50:50", icon: "fa-divide" },
                "phone": { used: false, name: "Telepon Teman", icon: "fa-phone-alt" },
                "audience": { used: false, name: "Tanya Penonton", icon: "fa-users" }
            },
            timer: this.config.get('timerDuration'),
            timerInterval: null,
            selectedOption: null,
            gameActive: true,
            questionsAnswered: [],
            totalQuestions: 0,
            startTime: Date.now(),
            gameMode: 'normal',
            difficulty: this.config.get('difficulty'),
            safeZones: this.database.getSafeZoneLevels()
        };
    }

    // Start new game
    startGame() {
        this.resetGame();
        
        // Get total questions count
        const stats = this.database.getStatistics();
        this.gameState.totalQuestions = Object.values(stats.byLevel)
            .reduce((a, b) => a + b, 0);
        
        // Load first question
        this.loadQuestion(this.gameState.currentLevel);
        
        // Start timer
        this.startTimer();
        
        // Update UI
        if (this.ui) {
            this.ui.updateGameInfo(this.gameState);
            this.ui.updatePrizeLadder(this.gameState.currentLevel);
        }
        
        return this.gameState;
    }

    // Load question for specific level
    async loadQuestion(level) {
        try {
            const question = this.database.getRandomQuestionByLevel(level);
            
            if (!question) {
                throw new Error(`Tidak ada pertanyaan untuk level ${level}`);
            }
            
            this.gameState.currentQuestion = question;
            this.gameState.timer = this.config.get('timerDuration');
            
            // Update UI
            if (this.ui) {
                this.ui.displayQuestion(question, level);
                this.ui.updateTimer(this.gameState.timer);
            }
            
            return question;
        } catch (error) {
            console.error('Error loading question:', error);
            throw error;
        }
    }

    // Start timer
    startTimer() {
        this.stopTimer();
        
        this.gameState.timer = this.config.get('timerDuration');
        this.gameState.timerStart = Date.now();
        
        this.timerInterval = setInterval(() => {
            this.gameState.timer--;
            
            // Update UI
            if (this.ui) {
                this.ui.updateTimer(this.gameState.timer);
            }
            
            // Check if time's up
            if (this.gameState.timer <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    // Stop timer
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Handle time up
    timeUp() {
        this.stopTimer();
        this.gameState.gameActive = false;
        
        // Show correct answer
        if (this.ui) {
            this.ui.showCorrectAnswer(this.gameState.currentQuestion.correct);
        }
        
        // Game over after delay
        setTimeout(() => {
            this.gameOver(false, 'Waktu habis!');
        }, 2000);
    }

    // Submit answer
    submitAnswer(selectedIndex) {
        if (!this.gameState.gameActive || selectedIndex === null) {
            return false;
        }
        
        this.stopTimer();
        this.gameState.gameActive = false;
        
        const question = this.gameState.currentQuestion;
        const isCorrect = selectedIndex === question.correct;
        
        // Record answered question
        this.gameState.questionsAnswered.push({
            questionId: question.id,
            selected: selectedIndex,
            correct: isCorrect,
            level: this.gameState.currentLevel,
            time: Date.now()
        });
        
        // Update UI
        if (this.ui) {
            this.ui.showAnswerResult(selectedIndex, isCorrect, question.correct);
        }
        
        // Process result after delay
        setTimeout(() => {
            if (isCorrect) {
                this.correctAnswer();
            } else {
                this.wrongAnswer();
            }
        }, 2000);
        
        return isCorrect;
    }

    // Handle correct answer
    correctAnswer() {
        const prizeLevels = this.database.getPrizeLevels();
        const currentPrize = prizeLevels[Math.min(this.gameState.currentLevel - 1, prizeLevels.length - 1)];
        
        // Add to score
        this.gameState.score += currentPrize;
        
        // Update guaranteed prize at safe zones
        if (this.gameState.safeZones.includes(this.gameState.currentLevel)) {
            this.gameState.guaranteedPrize = currentPrize;
            
            // Show safe zone message
            if (this.ui) {
                this.ui.showSafeZoneMessage(currentPrize);
            }
        }
        
        // Check if won the jackpot
        if (this.gameState.currentLevel >= prizeLevels.length) {
            this.gameWon();
            return;
        }
        
        // Move to next level
        this.gameState.currentLevel++;
        this.gameState.gameActive = true;
        
        // Load next question
        this.loadQuestion(this.gameState.currentLevel);
        
        // Restart timer
        this.startTimer();
        
        // Update UI
        if (this.ui) {
            this.ui.updateGameInfo(this.gameState);
            this.ui.updatePrizeLadder(this.gameState.currentLevel);
        }
    }

    // Handle wrong answer
    wrongAnswer() {
        this.gameOver(true, `Jawaban salah!`);
    }

    // Handle game over
    gameOver(isWrongAnswer = false, message = '') {
        const finalPrize = isWrongAnswer ? this.gameState.guaranteedPrize : this.gameState.score;
        
        // Calculate game stats
        const gameStats = {
            finalPrize: finalPrize,
            levelsCompleted: this.gameState.currentLevel - (isWrongAnswer ? 1 : 0),
            questionsAnswered: this.gameState.questionsAnswered.length,
            correctAnswers: this.gameState.questionsAnswered.filter(q => q.correct).length,
            accuracy: this.gameState.questionsAnswered.length > 0 ? 
                (this.gameState.questionsAnswered.filter(q => q.correct).length / 
                 this.gameState.questionsAnswered.length * 100).toFixed(1) : 0,
            timePlayed: Math.floor((Date.now() - this.gameState.startTime) / 1000),
            lifelinesUsed: Object.values(this.gameState.lifelines).filter(l => l.used).length
        };
        
        // Save game history
        this.saveGameHistory(gameStats);
        
        // Show result
        if (this.ui) {
            this.ui.showGameOver(message, finalPrize, gameStats);
        }
    }

    // Handle game won
    gameWon() {
        const finalPrize = this.gameState.score;
        const gameStats = {
            finalPrize: finalPrize,
            levelsCompleted: this.gameState.currentLevel,
            questionsAnswered: this.gameState.questionsAnswered.length,
            correctAnswers: this.gameState.questionsAnswered.length,
            accuracy: 100,
            timePlayed: Math.floor((Date.now() - this.gameState.startTime) / 1000),
            lifelinesUsed: Object.values(this.gameState.lifelines).filter(l => l.used).length,
            jackpotWon: true
        };
        
        // Save game history
        this.saveGameHistory(gameStats);
        
        // Show win screen
        if (this.ui) {
            this.ui.showGameWon(finalPrize, gameStats);
        }
    }

    // Use lifeline
    useLifeline(lifelineType) {
        if (!this.gameState.gameActive || 
            this.gameState.lifelines[lifelineType].used) {
            return null;
        }
        
        const question = this.gameState.currentQuestion;
        let result = null;
        
        switch(lifelineType) {
            case '5050':
                result = this.useFiftyFifty(question);
                break;
            case 'phone':
                result = this.usePhoneFriend(question);
                break;
            case 'audience':
                result = this.useAskAudience(question);
                break;
        }
        
        if (result) {
            this.gameState.lifelines[lifelineType].used = true;
            
            // Update UI
            if (this.ui) {
                this.ui.updateLifelines(this.gameState.lifelines);
            }
        }
        
        return result;
    }

    // 50:50 lifeline
    useFiftyFifty(question) {
        const wrongOptions = [0, 1, 2, 3].filter(i => i !== question.correct);
        const removeOptions = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
        
        return {
            type: '5050',
            removedOptions: removeOptions,
            remainingOptions: [question.correct, ...wrongOptions.filter(i => !removeOptions.includes(i))]
        };
    }

    // Phone a friend lifeline
    usePhoneFriend(question) {
        // 80% chance correct on easy, 60% on medium, 40% on hard
        let correctChance = 80;
        switch(this.gameState.difficulty) {
            case 'medium': correctChance = 60; break;
            case 'hard': correctChance = 40; break;
            case 'expert': correctChance = 30; break;
        }
        
        const isCorrect = Math.random() * 100 < correctChance;
        const suggestion = isCorrect ? question.correct : 
            [0, 1, 2, 3].filter(i => i !== question.correct)[
                Math.floor(Math.random() * 3)
            ];
        
        return {
            type: 'phone',
            suggestion: suggestion,
            confidence: isCorrect ? 'sangat yakin' : 'agak ragu',
            duration: 30
        };
    }

    // Ask the audience lifeline
    useAskAudience(question) {
        const pollResults = [0, 0, 0, 0];
        
        // Base accuracy based on difficulty
        let baseAccuracy = 70;
        switch(this.gameState.difficulty) {
            case 'medium': baseAccuracy = 60; break;
            case 'hard': baseAccuracy = 50; break;
            case 'expert': baseAccuracy = 40; break;
        }
        
        // Correct answer gets highest percentage
        pollResults[question.correct] = baseAccuracy + Math.floor(Math.random() * 20);
        
        // Distribute remaining percentage
        let remaining = 100 - pollResults[question.correct];
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== question.correct);
        
        wrongIndices.forEach((index, i) => {
            if (i === wrongIndices.length - 1) {
                pollResults[index] = remaining;
            } else {
                const percent = Math.floor(Math.random() * remaining / 2);
                pollResults[index] = percent;
                remaining -= percent;
            }
        });
        
        return {
            type: 'audience',
            pollResults: pollResults,
            topChoice: pollResults.indexOf(Math.max(...pollResults))
        };
    }

    // Quit game
    quitGame() {
        this.stopTimer();
        const finalPrize = this.gameState.guaranteedPrize;
        
        const gameStats = {
            finalPrize: finalPrize,
            levelsCompleted: this.gameState.currentLevel - 1,
            questionsAnswered: this.gameState.questionsAnswered.length,
            correctAnswers: this.gameState.questionsAnswered.filter(q => q.correct).length,
            quitVoluntarily: true
        };
        
        // Save game history
        this.saveGameHistory(gameStats);
        
        // Show quit screen
        if (this.ui) {
            this.ui.showGameQuit(finalPrize, gameStats);
        }
    }

    // Save game history
    saveGameHistory(stats) {
        try {
            const history = JSON.parse(localStorage.getItem('game_history') || '[]');
            
            history.unshift({
                date: new Date().toISOString(),
                score: stats.finalPrize,
                levels: stats.levelsCompleted,
                questions: stats.questionsAnswered,
                correct: stats.correctAnswers,
                time: stats.timePlayed || 0,
                lifelines: stats.lifelinesUsed || 0,
                jackpot: stats.jackpotWon || false
            });
            
            // Keep only last 100 games
            if (history.length > 100) {
                history.length = 100;
            }
            
            localStorage.setItem('game_history', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving game history:', error);
        }
    }

    // Get game history
    getGameHistory() {
        try {
            return JSON.parse(localStorage.getItem('game_history') || '[]');
        } catch (error) {
            console.error('Error getting game history:', error);
            return [];
        }
    }

    // Get game statistics
    getGameStatistics() {
        const history = this.getGameHistory();
        
        if (history.length === 0) {
            return {
                totalGames: 0,
                totalWinnings: 0,
                highestScore: 0,
                averageScore: 0,
                jackpots: 0,
                bestStreak: 0
            };
        }
        
        const totalWinnings = history.reduce((sum, game) => sum + game.score, 0);
        const highestScore = Math.max(...history.map(game => game.score));
        const jackpots = history.filter(game => game.jackpot).length;
        const bestStreak = Math.max(...history.map(game => game.levels));
        
        return {
            totalGames: history.length,
            totalWinnings: totalWinnings,
            highestScore: highestScore,
            averageScore: Math.round(totalWinnings / history.length),
            jackpots: jackpots,
            bestStreak: bestStreak,
            lastPlayed: history[0]?.date
        };
    }

    // Set UI manager
    setUIManager(uiManager) {
        this.ui = uiManager;
    }
}

// Create global instance
window.gameEngine = new GameEngine();
