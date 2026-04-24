/**
 * HR Dan Rank Check Game Logic
 */

class Game {
    constructor() {
        this.currentScreen = 'top-screen';
        this.currentQuestionIndex = 0;
        this.totalQuestions = quizData.reduce((acc, cat) => acc + cat.questions.length, 0);
        this.answers = []; 
        this.categoryScores = {};
        this.userData = {
            company: '',
            name: '',
            email: '',
            job: ''
        };

        this.init();
    }

    init() {
        // Elements
        this.screens = {
            top: document.getElementById('top-screen'),
            quiz: document.getElementById('quiz-screen'),
            form: document.getElementById('form-screen'),
            result: document.getElementById('result-screen')
        };

        // Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('lead-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('share-btn-x').addEventListener('click', () => this.handleXShare());
        document.getElementById('share-btn-fb').addEventListener('click', () => this.handleFBShare());

        // Initial Data Setup
        quizData.forEach(cat => {
            this.categoryScores[cat.category] = { correct: 0, total: cat.questions.length };
        });
    }

    showScreen(screenId) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenId.split('-')[0]].classList.add('active');
        this.currentScreen = screenId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    startQuiz() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        // Reset scores
        for (let cat in this.categoryScores) {
            this.categoryScores[cat].correct = 0;
        }
        this.showScreen('quiz-screen');
        this.loadQuestion();
    }

    loadQuestion() {
        const flatQuestions = quizData.flatMap(cat => cat.questions);
        const question = flatQuestions[this.currentQuestionIndex];
        const category = quizData.find(cat => cat.questions.some(q => q.id === question.id)).category;

        // Update UI
        document.getElementById('current-category').textContent = category;
        document.getElementById('progress-text').textContent = `${this.currentQuestionIndex + 1} / ${this.totalQuestions}`;
        
        const progressPercent = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
        document.getElementById('progress-bar').style.width = `${progressPercent}%`;

        document.getElementById('question-text').textContent = question.text;

        const choicesContainer = document.getElementById('choices-container');
        choicesContainer.innerHTML = '';

        ['A', 'B', 'C', 'D'].forEach(label => {
            const btn = document.createElement('div');
            btn.className = 'choice-option';
            btn.innerHTML = `
                <div class="choice-indicator">${label}</div>
                <div class="choice-text">${question.choices[label]}</div>
            `;
            btn.addEventListener('click', () => this.handleAnswer(label, question, category));
            choicesContainer.appendChild(btn);
        });
    }

    handleAnswer(selectedLabel, question, category) {
        const isCorrect = selectedLabel === question.correct;
        
        if (isCorrect) {
            this.categoryScores[category].correct++;
        }

        this.answers.push({
            questionId: question.id,
            category: category,
            isCorrect: isCorrect,
            userAnswer: selectedLabel,
            correctAnswer: question.correct,
            questionText: question.text,
            explanation: question.explanation
        });

        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.totalQuestions) {
            this.loadQuestion();
        } else {
            this.showScreen('form-screen');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.userData = {
            company: formData.get('company'),
            name: `${formData.get('last-name')} ${formData.get('first-name')}`,
            email: formData.get('email'),
            job: formData.get('job')
        };

        this.showResult();
    }

    showResult() {
        const totalCorrect = Object.values(this.categoryScores).reduce((acc, curr) => acc + curr.correct, 0);
        const percent = Math.round((totalCorrect / this.totalQuestions) * 100);
        
        // Determine Rank
        const rankInfo = rankCriteria.find(r => percent >= r.minScore) || rankCriteria[rankCriteria.length - 1];

        // Update UI
        document.getElementById('user-name-display').textContent = this.userData.name;
        document.getElementById('rank-title').textContent = `${rankInfo.title}（${rankInfo.rank}）`;
        document.getElementById('correct-count').textContent = totalCorrect;
        document.getElementById('percent').textContent = percent;
        document.getElementById('rank-message').textContent = rankInfo.message;

        this.renderCategoryCharts();
        this.renderAnalysis();
        this.renderExplanations();

        this.showScreen('result-screen');
    }

    renderCategoryCharts() {
        const container = document.getElementById('category-charts-container');
        container.innerHTML = '';

        quizData.forEach(cat => {
            const score = this.categoryScores[cat.category];
            const percent = (score.correct / score.total) * 100;
            
            const row = document.createElement('div');
            row.className = 'category-bar-row';
            row.innerHTML = `
                <div class="category-label-wrap">
                    <span>${cat.category}</span>
                    <span>${score.correct} / ${score.total}</span>
                </div>
                <div class="bar-bg">
                    <div class="bar-fill" style="width: 0%"></div>
                </div>
            `;
            container.appendChild(row);

            setTimeout(() => {
                row.querySelector('.bar-fill').style.width = `${percent}%`;
            }, 100);
        });
    }

    renderAnalysis() {
        const strengths = [];
        const weaknesses = [];

        quizData.forEach(cat => {
            const score = this.categoryScores[cat.category];
            const percent = (score.correct / score.total) * 100;
            if (percent >= 67) {
                strengths.push(cat.category);
            } else {
                weaknesses.push(cat.category);
            }
        });

        document.getElementById('strengths-list').innerHTML = `<ul>${strengths.map(s => `<li>${s}</li>`).join('') || '<li>なし</li>'}</ul>`;
        document.getElementById('weaknesses-list').innerHTML = `<ul>${weaknesses.map(w => `<li>${w}</li>`).join('') || '<li>なし</li>'}</ul>`;
    }

    renderExplanations() {
        const container = document.getElementById('explanations-container');
        container.innerHTML = '';

        this.answers.forEach((ans, idx) => {
            const item = document.createElement('div');
            item.className = 'exp-item';
            item.innerHTML = `
                <div class="exp-head">
                    <span>Q${idx + 1}. ${ans.questionText.substring(0, 35)}...</span>
                    <span class="exp-tag ${ans.isCorrect ? 'correct' : 'wrong'}">
                        ${ans.isCorrect ? '正解' : '不正解'}
                    </span>
                </div>
                <div class="exp-body">
                    <div style="padding: 20px; background: #fafbfc; border-radius: 8px;">
                        <p style="font-weight: 800; color: var(--accent-color); margin-bottom: 8px;">正解: ${ans.correctAnswer}</p>
                        <p style="font-size: 0.95rem;">${ans.explanation}</p>
                    </div>
                </div>
            `;
            
            item.querySelector('.exp-head').addEventListener('click', () => {
                item.classList.toggle('open');
            });
            
            container.appendChild(item);
        });
    }

    handleXShare() {
        const totalCorrect = Object.values(this.categoryScores).reduce((acc, curr) => acc + curr.correct, 0);
        const percent = Math.round((totalCorrect / this.totalQuestions) * 100);
        const rankInfo = rankCriteria.find(r => percent >= r.minScore) || rankCriteria[rankCriteria.length - 1];

        const text = encodeURIComponent(`私の人事段位は【${rankInfo.title}・${rankInfo.rank}】でした！正答率${percent}% #人事段位チェック #NODIA`);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }

    handleFBShare() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
