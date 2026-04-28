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
        document.getElementById('share-btn-in').addEventListener('click', () => this.handleINShare());
        document.getElementById('copy-btn').addEventListener('click', () => this.handleCopyResult());
        document.getElementById('retry-btn').addEventListener('click', () => this.handleRetry());

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

        // GASへ非同期送信
        this.postToGoogleAppsScript();

        this.showResult();
    }

    async postToGoogleAppsScript() {
        // ※デプロイしたGASの「ウェブアプリのURL」をここに貼り付けてください
        const GAS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
        
        if (GAS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
            console.warn('Google Apps Script URL is not set. Skipping data submission.');
            return;
        }

        const totalCorrect = Object.values(this.categoryScores).reduce((acc, curr) => acc + curr.correct, 0);
        const percent = Math.round((totalCorrect / this.totalQuestions) * 100);
        const rankInfo = rankCriteria.find(r => percent >= r.minScore) || rankCriteria[rankCriteria.length - 1];

        const params = new URLSearchParams();
        params.append('company', this.userData.company);
        params.append('name', this.userData.name);
        params.append('email', this.userData.email);
        params.append('job', this.userData.job);
        params.append('score', totalCorrect);
        params.append('percent', percent);
        params.append('rank', rankInfo.rank);

        try {
            await fetch(GAS_URL, {
                method: 'POST',
                body: params
            });
        } catch (error) {
            console.error('Error submitting data to GAS:', error);
        }
    }

    showResult() {
        const totalCorrect = Object.values(this.categoryScores).reduce((acc, curr) => acc + curr.correct, 0);
        const percent = Math.round((totalCorrect / this.totalQuestions) * 100);
        
        // Determine Rank
        const rankInfo = rankCriteria.find(r => percent >= r.minScore) || rankCriteria[rankCriteria.length - 1];

        // Update UI
        const rankColors = {
            'L5': '#818cf8',
            'L4': '#60a5fa',
            'L3': '#34d399',
            'L2': '#fbbf24',
            'L1': '#9ca3af'
        };
        const banner = document.getElementById('rank-banner');
        banner.style.backgroundColor = rankColors[rankInfo.rank] || '#0F172A';
        
        const rankImages = {
            'L5': 'img/char_l5.png',
            'L4': 'img/char_l4.png',
            'L3': 'img/char_l3.png',
            'L2': 'img/char_l2.png',
            'L1': 'img/char_l1.png'
        };
        document.getElementById('rank-icon').src = rankImages[rankInfo.rank] || 'img/char_l3.png';
        
        document.getElementById('user-name-display').textContent = this.userData.name;
        document.getElementById('rank-title').textContent = `${rankInfo.title}（${rankInfo.rank}）`;
        document.getElementById('correct-count').textContent = totalCorrect;
        document.querySelector('.total-q-display').textContent = this.totalQuestions;
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

        let feedbackText = "";
        if (strengths.length > 0) {
            feedbackText += `あなたの最も高い専門性は「${strengths[0]}」等にあります。`;
        }
        if (weaknesses.length > 0) {
            feedbackText += `一方で「${weaknesses[0]}」等は今後の強化領域として期待されます。`;
        }
        if (strengths.length === 0 && weaknesses.length === 0) {
            feedbackText = "各領域のバランスが取れています。更なる専門性の追求が期待されます。";
        }
        document.getElementById('rank-message-detail').textContent = feedbackText;
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

    async handleXShare() {
        const totalCorrect = Object.values(this.categoryScores).reduce((acc, curr) => acc + curr.correct, 0);
        const percent = Math.round((totalCorrect / this.totalQuestions) * 100);
        const rankInfo = rankCriteria.find(r => percent >= r.minScore) || rankCriteria[rankCriteria.length - 1];
        const text = `私の人事段位は【${rankInfo.title}・${rankInfo.rank}】でした！正答率${percent}% #人事段位チェック`;
        const url = window.location.href;

        try {
            const banner = document.getElementById('rank-banner');
            const canvas = await html2canvas(banner, { scale: 2 });
            const dataUrl = canvas.toDataURL('image/png');

            if (navigator.share && navigator.canShare) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'nodia_hr_rank.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: '人事段位チェック',
                        text: text,
                        url: url,
                        files: [file]
                    });
                    return;
                }
            }

            // Fallback for Desktop: Download image and open intent
            const link = document.createElement('a');
            link.download = 'nodia_hr_rank.png';
            link.href = dataUrl;
            link.click();

            setTimeout(() => {
                const intentText = encodeURIComponent(`${text}\n※ダウンロードされた画像を添付してシェアしてください！`);
                window.open(`https://twitter.com/intent/tweet?text=${intentText}&url=${encodeURIComponent(url)}`, '_blank');
            }, 500);

        } catch (error) {
            console.error('Error generating image for share', error);
            const fallbackText = encodeURIComponent(text);
            window.open(`https://twitter.com/intent/tweet?text=${fallbackText}&url=${encodeURIComponent(url)}`, '_blank');
        }
    }

    handleFBShare() {
        const url = window.location.href;
        if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
            navigator.share({
                title: '人事段位チェック',
                url: url
            }).catch(console.error);
        } else {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        }
    }

    handleINShare() {
        const url = window.location.href;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }

    handleCopyResult() {
        const totalCorrect = Object.values(this.categoryScores).reduce((acc, curr) => acc + curr.correct, 0);
        const percent = Math.round((totalCorrect / this.totalQuestions) * 100);
        const rankInfo = rankCriteria.find(r => percent >= r.minScore) || rankCriteria[rankCriteria.length - 1];
        const feedback = document.getElementById('rank-message-detail').textContent;
        
        const textToCopy = `【人事段位チェック結果】\n段位: ${rankInfo.title} (${rankInfo.rank})\n正答率: ${percent}%\n\n${feedback}\n\n#人事段位チェック\n${window.location.href}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('結果をクリップボードにコピーしました！');
        }).catch(err => {
            console.error('Copy failed', err);
            alert('コピーに失敗しました。');
        });
    }

    handleRetry() {
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.userData = { company: '', name: '', email: '', job: '' };
        for (let cat in this.categoryScores) {
            this.categoryScores[cat].correct = 0;
        }
        document.getElementById('lead-form').reset();
        document.getElementById('privacy-agreement').checked = false;
        
        this.showScreen('top-screen');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
