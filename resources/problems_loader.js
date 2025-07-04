// problems.json を読み込んで問題セットを切り替える機能
// main.js から呼び出される想定

let problems = [];
let problemIndex = 0;
let solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');

async function loadProblems() {
    try {
        // fetchでproblems.jsonを読み込む
        const res = await fetch('problems.json');
        if (!res.ok) throw new Error('HTTP status ' + res.status);
        problems = await res.json();
        return problems;
    } catch (e) {
        problems = [];
        return problems;
    }
}

async function getProblemIds() {
    if(problems.length === 0) await loadProblems();
    return problems.map(p => p.id);
}

function saveSolvedProblems() {
    localStorage.setItem('solvedProblems', JSON.stringify(solvedProblems));
}

async function showProblemsOverlay() {
    try {
        const ids = await getProblemIds();
        const problemsOverlay = document.getElementById('problemsOverlay');
        if (!problemsOverlay) {
            return;
        }
        if (!ids || ids.length === 0) {
            problemsOverlay.innerHTML = '<div style="color:red;">問題がありません</div>';
            problemsOverlay.style.display = 'flex';
            return;
        }
        let html = '<div class="problem-list">';
        ids.forEach(id => {
            const solved = solvedProblems.includes(id);
            html += `<button class="problem-btn${solved ? ' solved' : ''}" data-idx="${id-1}">${id}</button>`;
        });
        html += '</div>';
        problemsOverlay.innerHTML = html;
        problemsOverlay.style.display = 'flex';
        problemsOverlay.querySelectorAll('.problem-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                setProblem(idx);
                problemsOverlay.style.display = 'none';
            });
        });
        problemsOverlay.addEventListener('click', e => {
            if(e.target === problemsOverlay) problemsOverlay.style.display = 'none';
        });
    } catch (e) {
        // 何もしない（本番用）
    }
}

async function setProblem(idx) {
    if(problems.length === 0) await loadProblems();
    if(idx < 0) idx = 0;
    if(idx >= problems.length) idx = problems.length-1;
    problemIndex = idx;
    window.isRandomMode = false; // ファイル問題選択時はランダムモードOFF
    const prob = problems[problemIndex];
    // 難易度計算
    const maxDiff = prob.condKeys.reduce((max, key) => {
        const def = condDefs.find(c => c.key === key);
        return def && def.difficulty > max ? def.difficulty : max;
    }, 1);
    const stars = '★'.repeat(maxDiff) + '☆'.repeat(5-maxDiff);
    document.getElementById('problemIdLabel').textContent = '問題番号: ' + prob.id + ' / 難易度: ' + stars;
    digitCount = prob.digitCount;
    selectedConds = prob.condKeys;
    renderInputs();
    setInputEvents();
    renderConditions();
    inputHistory = [];
    renderHistory();
    updateCondIcons();
    message.textContent = '';
}

// ボタンイベント登録（main.jsからは呼ばない）
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loadProblemsBtn').addEventListener('click', showProblemsOverlay);
});
