/**
 * DATABASE.JS
 * Database terpisah untuk pertanyaan Who Wants to Be a Millionaire
 * Mendukung CRUD operations dan penyimpanan di localStorage
 */

class GameDatabase {
    constructor() {
        this.STORAGE_KEY = 'millionaire_questions';
        this.DEFAULT_QUESTIONS = this.getDefaultQuestions();
        this.initializeDatabase();
    }

    // Initialize database with default questions if empty
    initializeDatabase() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) {
                this.saveQuestions(this.DEFAULT_QUESTIONS);
            }
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    // Get default questions for first-time setup
    getDefaultQuestions() {
        return [
            // Level 1 - Rp 500.000
            {
                id: 1,
                level: 1,
                question: "Apa ibu kota Indonesia?",
                options: ["Jakarta", "Bandung", "Surabaya", "Medan"],
                correct: 0,
                explanation: "Jakarta telah menjadi ibu kota Indonesia sejak tahun 1966."
            },
            {
                id: 2,
                level: 1,
                question: "Planet terdekat dari Matahari adalah?",
                options: ["Venus", "Mars", "Merkurius", "Bumi"],
                correct: 2,
                explanation: "Merkurius adalah planet terdekat dari Matahari dengan jarak sekitar 57,9 juta km."
            },
            {
                id: 3,
                level: 1,
                question: "Siapa penulis novel 'Laskar Pelangi'?",
                options: ["Andrea Hirata", "Dewi Lestari", "Tere Liye", "Pramoedya Ananta Toer"],
                correct: 0,
                explanation: "Andrea Hirata adalah penulis novel bestseller 'Laskar Pelangi' (2005)."
            },

            // Level 2 - Rp 1.000.000
            {
                id: 4,
                level: 2,
                question: "Berapakah hasil dari 7 × 8 + 15 ÷ 3?",
                options: ["59", "61", "63", "65"],
                correct: 1,
                explanation: "7 × 8 = 56, 15 ÷ 3 = 5, maka 56 + 5 = 61."
            },
            {
                id: 5,
                level: 2,
                question: "Apa nama ilmiah untuk manusia modern?",
                options: ["Homo sapiens", "Homo erectus", "Homo habilis", "Homo neanderthalensis"],
                correct: 0,
                explanation: "Homo sapiens adalah nama ilmiah untuk manusia modern."
            },

            // Level 3 - Rp 2.000.000
            {
                id: 6,
                level: 3,
                question: "Di benua manakah negara Mesir berada?",
                options: ["Afrika", "Asia", "Eropa", "Australia"],
                correct: 0,
                explanation: "Mesir terletak di benua Afrika (Sinai termasuk Asia)."
            },
            {
                id: 7,
                level: 3,
                question: "Apa simbol kimia untuk emas?",
                options: ["Ag", "Au", "Fe", "Cu"],
                correct: 1,
                explanation: "Au adalah simbol kimia untuk emas (dari bahasa Latin: aurum)."
            },

            // Level 4 - Rp 5.000.000
            {
                id: 8,
                level: 4,
                question: "Siapakah yang menemukan teori relativitas?",
                options: ["Isaac Newton", "Albert Einstein", "Stephen Hawking", "Galileo Galilei"],
                correct: 1,
                explanation: "Albert Einstein mengemukakan teori relativitas khusus (1905) dan umum (1915)."
            },
            {
                id: 9,
                level: 4,
                question: "Berapa jumlah provinsi di Indonesia saat ini?",
                options: ["34", "36", "38", "40"],
                correct: 0,
                explanation: "Indonesia memiliki 34 provinsi (Papua Selatan ditambahkan 2022)."
            },

            // Level 5 - Rp 10.000.000 (Safe Zone)
            {
                id: 10,
                level: 5,
                question: "Apa nama satelit alami Bumi?",
                options: ["Phobos", "Deimos", "Bulan", "Titan"],
                correct: 2,
                explanation: "Bulan adalah satu-satunya satelit alami Bumi (diameter 3.474 km)."
            },
            {
                id: 11,
                level: 5,
                question: "Dalam komputer, apa kepanjangan dari 'CPU'?",
                options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
                correct: 0,
                explanation: "CPU adalah Central Processing Unit, otak dari komputer."
            },

            // Level 6 - Rp 25.000.000
            {
                id: 12,
                level: 6,
                question: "Siapakah pelukis terkenal yang memotong telinganya sendiri?",
                options: ["Pablo Picasso", "Vincent van Gogh", "Leonardo da Vinci", "Michelangelo"],
                correct: 1,
                explanation: "Vincent van Gogh memotong sebagian telinganya pada tahun 1888."
            },
            {
                id: 13,
                level: 6,
                question: "Apa nama organ terbesar dalam tubuh manusia?",
                options: ["Hati", "Paru-paru", "Kulit", "Usus"],
                correct: 2,
                explanation: "Kulit adalah organ terbesar dengan luas sekitar 2 meter persegi."
            },

            // Level 7 - Rp 50.000.000
            {
                id: 14,
                level: 7,
                question: "Apa nama sungai terpanjang di dunia?",
                options: ["Sungai Amazon", "Sungai Nil", "Sungai Yangtze", "Sungai Mississippi"],
                correct: 1,
                explanation: "Sungai Nil di Afrika memiliki panjang sekitar 6.650 km."
            },

            // Level 8 - Rp 100.000.000
            {
                id: 15,
                level: 8,
                question: "Dalam fisika, partikel elementer pembawa gaya elektromagnetik disebut?",
                options: ["Gluon", "Foton", "Boson Higgs", "Graviton"],
                correct: 1,
                explanation: "Foton adalah partikel pembawa gaya elektromagnetik dalam teori kuantum."
            },

            // Level 9 - Rp 250.000.000
            {
                id: 16,
                level: 9,
                question: "Siapakah penulis drama 'Romeo and Juliet'?",
                options: ["William Shakespeare", "Charles Dickens", "Jane Austen", "Mark Twain"],
                correct: 0,
                explanation: "William Shakespeare menulis 'Romeo and Juliet' sekitar tahun 1591-1595."
            },

            // Level 10 - Rp 500.000.000 (Safe Zone)
            {
                id: 17,
                level: 10,
                question: "Lukisan 'Mona Lisa' disimpan di museum mana?",
                options: ["Louvre Museum", "British Museum", "Metropolitan Museum", "Vatican Museums"],
                correct: 0,
                explanation: "Mona Lisa dipamerkan di Musée du Louvre, Paris sejak 1797."
            },

            // Level 11 - Rp 1.000.000.000 (JACKPOT)
            {
                id: 18,
                level: 11,
                question: "Siapakah ilmuwan yang merumuskan hukum gravitasi setelah melihat apel jatuh?",
                options: ["Albert Einstein", "Isaac Newton", "Galileo Galilei", "Nikola Tesla"],
                correct: 1,
                explanation: "Isaac Newton merumuskan hukum gravitasi universal pada tahun 1687."
            }
        ];
    }

    // CRUD Operations

    // Get all questions
    getAllQuestions() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error getting questions:', error);
            return [];
        }
    }

    // Get questions by level
    getQuestionsByLevel(level) {
        const questions = this.getAllQuestions();
        return questions.filter(q => q.level === level);
    }

    // Get random question by level
    getRandomQuestionByLevel(level) {
        const levelQuestions = this.getQuestionsByLevel(level);
        if (levelQuestions.length === 0) {
            return this.getDefaultQuestions().find(q => q.level === level) || null;
        }
        return levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
    }

    // Save a single question
    saveQuestion(question) {
        try {
            const questions = this.getAllQuestions();
            
            // Check if question with same ID exists
            const existingIndex = questions.findIndex(q => q.id == question.id);
            
            if (existingIndex >= 0) {
                // Update existing question
                questions[existingIndex] = question;
            } else {
                // Add new question with unique ID
                question.id = Date.now();
                questions.push(question);
            }
            
            this.saveQuestions(questions);
            return question.id;
        } catch (error) {
            console.error('Error saving question:', error);
            throw error;
        }
    }

    // Delete a question
    deleteQuestion(questionId) {
        try {
            const questions = this.getAllQuestions();
            const filtered = questions.filter(q => q.id != questionId);
            this.saveQuestions(filtered);
            return true;
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    }

    // Get total questions count
    getTotalQuestions() {
        return this.getAllQuestions().length;
    }

    // Get questions count by level
    getQuestionsCountByLevel() {
        const questions = this.getAllQuestions();
        const count = {};
        questions.forEach(q => {
            count[q.level] = (count[q.level] || 0) + 1;
        });
        return count;
    }

    // Export all questions
    exportQuestions() {
        return this.getAllQuestions();
    }

    // Import questions (replace all)
    importQuestions(newQuestions) {
        if (!Array.isArray(newQuestions)) {
            throw new Error('Questions must be an array');
        }
        
        // Validate each question
        newQuestions.forEach((q, index) => {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
                throw new Error(`Invalid question at index ${index}`);
            }
        });
        
        this.saveQuestions(newQuestions);
    }

    // Reset to default questions
    resetToDefault() {
        this.saveQuestions(this.DEFAULT_QUESTIONS);
    }

    // Private method to save all questions
    saveQuestions(questions) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(questions));
        } catch (error) {
            console.error('Error saving questions:', error);
            throw error;
        }
    }

    // Get prize levels configuration
    getPrizeLevels() {
        return [
            500000,      // Level 1
            1000000,     // Level 2
            2000000,     // Level 3
            5000000,     // Level 4
            10000000,    // Level 5 - SAFE ZONE
            25000000,    // Level 6
            50000000,    // Level 7
            100000000,   // Level 8
            250000000,   // Level 9
            500000000,   // Level 10 - SAFE ZONE
            1000000000   // Level 11 - JACKPOT
        ];
    }

    // Get safe zone levels
    getSafeZoneLevels() {
        return [5, 10]; // Levels where prize is guaranteed
    }

    // Get game statistics
    getStatistics() {
        const questions = this.getAllQuestions();
        const byLevel = this.getQuestionsCountByLevel();
        
        return {
            totalQuestions: questions.length,
            byLevel: byLevel,
            levelsWithQuestions: Object.keys(byLevel).length,
            lastUpdated: new Date().toLocaleString()
        };
    }
}

// Create global instance
window.gameDatabase = new GameDatabase();
