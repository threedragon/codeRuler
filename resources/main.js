const inputsDiv = document.getElementById('inputs');
// --- 問題読込ボタン・オーバーレイ ---
// （problems_loader.jsに移管したため、main.js側の問題読込・ID取得・setProblem関連処理を削除）

// グローバルエクスポートはDOM取得後に
function renderInputs() {
    window.inputsDiv.innerHTML = '';
    for(let i=0; i<digitCount; ++i) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.className = 'digit';
        input.inputMode = 'numeric';
        input.pattern = '[0-9]*';
        if(i === 0) input.autofocus = true;
        window.inputsDiv.appendChild(input);
    }
}
function renderConditions() {
    window.conditionsList.innerHTML = '';
    selectedConds.forEach(key => {
        const label = document.createElement('label');
        label.setAttribute('data-cond', key);
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.justifyContent = 'center';
        label.style.minWidth = '2.2em';
        label.innerHTML = `<span class="cond-icon">？</span>`;
        window.conditionsList.appendChild(label);
    });
}
function renderHistory() {
    const historyBody = document.getElementById('historyBody');
    historyBody.innerHTML = '';
    // 履歴本体
    inputHistory.slice(-50).reverse().forEach(item => {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.textContent = item.value;
        tr.appendChild(td);
        let td2 = document.createElement('td');
        td2.style.textAlign = 'center';
        if(item.results) {
            td2.textContent = selectedConds.map(key => {
                if(key in item.results) return item.results[key] ? '✔️' : '❌';
                return '?';
            }).join('');
        } else {
            td2.textContent = '?'.repeat(selectedConds.length);
        }
        tr.appendChild(td2);
        historyBody.appendChild(tr);
    });
}
function randomSelectConds() {
    while (true) {
        digitCount = Math.floor(Math.random() * 4) + 3; // 3～6
        renderInputs();
        setInputEvents();
        // 難易度ごとの上限
        const maxDiff2 = 2;
        const maxDiff3 = 1;
        const maxDiff4 = 1;
        const maxDiff5 = 1;
        const maxConds = 5; // 条件最大数
        // 条件候補をdigitCountでフィルタ
        const candidates = condDefs.filter(def => !def.digitLimit || def.digitLimit === digitCount);
        // カテゴリごとにシャッフル
        const categories = {};
        candidates.forEach(c => { if(!categories[c.category]) categories[c.category]=[]; categories[c.category].push(c); });
        Object.values(categories).forEach(arr => arr.sort(() => Math.random()-0.5));
        // カテゴリリストをシャッフル
        const catList = Object.keys(categories).sort(() => Math.random() - 0.5);
        // 2～4カテゴリをランダム選択
        const n = Math.floor(Math.random() * 3) + 2; // 2～4
        const selectedCats = catList.slice(0, n);
        // 難易度制限を考慮して条件を選ぶ
        let diff2 = 0, diff3 = 0, diff4 = 0, diff5 = 0;
        selectedConds = [];
        for(const cat of selectedCats) {
            if(selectedConds.length >= maxConds) break;
            const arr = categories[cat];
            for(const def of arr) {
                if(def.difficulty === 2 && diff2 >= maxDiff2) continue;
                if(def.difficulty === 3 && diff3 >= maxDiff3) continue;
                if(def.difficulty === 4 && diff4 >= maxDiff4) continue;
                if(def.difficulty === 5 && diff5 >= maxDiff5) continue;
                // 既に同じ難易度3以上が選ばれていればスキップ
                if(def.difficulty === 3 && selectedConds.some(k => (condDefs.find(c=>c.key===k)?.difficulty)===3)) continue;
                if(def.difficulty === 4 && selectedConds.some(k => (condDefs.find(c=>c.key===k)?.difficulty)===4)) continue;
                if(def.difficulty === 5 && selectedConds.some(k => (condDefs.find(c=>c.key===k)?.difficulty)===5)) continue;
                selectedConds.push(def.key);
                if(def.difficulty === 2) diff2++;
                if(def.difficulty === 3) diff3++;
                if(def.difficulty === 4) diff4++;
                if(def.difficulty === 5) diff5++;
                break;
            }
        }
        // --- 正解となるパターンが存在するかチェック ---
        let found = false;
        const min = 10 ** (digitCount - 1);
        const max = 10 ** digitCount;
        for (let num = min; num < max; ++num) {
            const pw = String(num).padStart(digitCount, '0');
            const res = checkEachCondition(pw, selectedConds, digitCount);
            if (Object.values(res).every(v => v)) {
                found = true;
                break;
            }
        }
        if (found && selectedConds.length > 0) break; // 条件OK
        // だめなら再抽選
    }
    renderConditions();
}
function setInputEvents() {
    const digits = document.querySelectorAll('.digit');
    digits.forEach((input, idx) => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if(e.target.value && idx < digits.length - 1) {
                digits[idx + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if(e.key === 'Backspace' && !e.target.value && idx > 0) {
                digits[idx - 1].focus();
            }
        });
    });
}
function updateCondIcons(condResults) {
    document.querySelectorAll('.conditions label').forEach(label => {
        const cond = label.getAttribute('data-cond');
        const icon = label.querySelector('.cond-icon');
        if(condResults && cond in condResults) {
            icon.textContent = condResults[cond] ? '✔️' : '❌';
        } else {
            icon.textContent = '？';
        }
    });
}

window.DEBUG_MODE = false;

window.addEventListener('DOMContentLoaded', () => {
    // デバッグモード判定（例: URLパラメータやグローバル変数で切替可能）
    // ここではwindow.DEBUG_MODE=true; で有効化
    if(window.DEBUG_MODE) {
        document.getElementById('cheatBtn').style.display = '';
    } else {
        document.getElementById('cheatBtn').style.display = 'none';
    }

    window.inputsDiv = document.getElementById('inputs');
    window.conditionsList = document.getElementById('conditionsList');
    window.digitCount = 4;
    window.selectedConds = [];
    window.inputHistory = [];
    window.renderInputs = renderInputs;
    window.setInputEvents = setInputEvents;
    window.renderConditions = renderConditions;
    window.renderHistory = renderHistory;
    window.updateCondIcons = updateCondIcons;
    window.message = document.getElementById('message');
    window.needInputClear = false;

    // ボタン・要素取得
    const randomCondBtn = document.getElementById('randomCondBtn');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const cheatBtn = document.getElementById('cheatBtn');
    const cheatOverlay = document.getElementById('cheatOverlay');
    const numBtns = document.querySelectorAll('.num-btn');
    const delBtn = document.querySelector('.del-btn');
    const nextProblemBtn = document.getElementById('nextProblemBtn');
    // ルール説明オーバーレイはクリックで非表示
    const ruleOverlay = document.getElementById('ruleOverlay');
    if(ruleOverlay) {
        ruleOverlay.addEventListener('click', (e) => {
            if(e.target === ruleOverlay) ruleOverlay.style.display = 'none';
        });
    }

    // イベント登録
    randomCondBtn.addEventListener('click', () => {
        window.isRandomMode = true;
        randomSelectConds();
        inputHistory = [];
        renderHistory();
        updateCondIcons();
        message.textContent = '';
        // 難易度計算
        const maxDiff = selectedConds.reduce((max, key) => {
            const def = condDefs.find(c => c.key === key);
            return def && def.difficulty > max ? def.difficulty : max;
        }, 1);
        const stars = '★'.repeat(maxDiff) + '☆'.repeat(5-maxDiff);
        document.getElementById('problemIdLabel').textContent = 'ランダム / 難易度: ' + stars;
    });
    submitBtn.addEventListener('click', () => {
        const digits = document.querySelectorAll('.digit');
        const password = Array.from(digits).map(d => d.value).join('');
        if(password.length !== digitCount) {
            message.textContent = `${digitCount}桁すべて入力してください。`;
            message.style.color = 'red';
            updateCondIcons();
            return;
        }
        const enabledConds = selectedConds;
        const condResults = checkEachCondition(password, enabledConds, digitCount);
        inputHistory.push({ value: password, results: condResults });
        if(inputHistory.length > 50) inputHistory = inputHistory.slice(-50);
        renderHistory();
        updateCondIcons(condResults);
        if(Object.values(condResults).every(v => v)) {
            message.textContent = 'パスワードOK!';
            message.style.color = 'green';
            // ファイル問題の場合は正解記録
            if(!window.isRandomMode && typeof problems !== 'undefined' && typeof problemIndex !== 'undefined') {
                const prob = problems[problemIndex];
                if(prob && prob.id) {
                    if(typeof solvedProblems === 'undefined') {
                        window.solvedProblems = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
                    }
                    if(!solvedProblems.includes(prob.id)) {
                        solvedProblems.push(prob.id);
                        localStorage.setItem('solvedProblems', JSON.stringify(solvedProblems));
                    }
                }
            }
        } else {
            message.textContent = '';
        }
        window.needInputClear = true; // 判定後にクリアフラグON
    });
    clearBtn.addEventListener('click', () => {
        const digits = document.querySelectorAll('.digit');
        digits.forEach(d => d.value = '');
        if(digits[0]) digits[0].focus();
        message.textContent = '';
        updateCondIcons();
    });
    numBtns.forEach(btn => {
        if(btn.classList.contains('del-btn')) return;
        if(btn.id === 'clearBtn') return;
        btn.addEventListener('click', () => {
            const digits = document.querySelectorAll('.digit');
            if(window.needInputClear) {
                digits.forEach(d => d.value = '');
                window.needInputClear = false;
            }
            for(let i=0; i<digits.length; ++i) {
                if(!digits[i].value) {
                    digits[i].value = btn.textContent;
                    if(i < digits.length-1) digits[i+1].focus();
                    else digits[i].focus();
                    break;
                }
            }
        });
    });
    delBtn.addEventListener('click', () => {
        const digits = document.querySelectorAll('.digit');
        for(let i=digits.length-1; i>=0; --i) {
            if(digits[i].value) {
                digits[i].value = '';
                digits[i].focus();
                break;
            }
        }
    });
    cheatBtn.addEventListener('click', () => {
        const conds = selectedConds.map(key => {
            const def = condDefs.find(c => c.key === key);
            return def ? def.label.replace(/\{N\}桁の?/g, '') : '';
        });
        cheatOverlay.innerHTML = '<div class="cheat-hint-box"><ul>' +
            conds.map(c => `<li>${c}</li>`).join('') +
            '</ul></div>';
        cheatOverlay.style.display = 'flex';
    });
    cheatOverlay.addEventListener('click', () => {
        cheatOverlay.style.display = 'none';
    });
    nextProblemBtn.addEventListener('click', async () => {
        // ランダム問題表示中はランダム出題、それ以外は次のファイル問題
        if(typeof setProblem === 'function' && typeof problems !== 'undefined' && problems.length > 0) {
            if(window.isRandomMode) {
                randomSelectConds();
                document.getElementById('problemIdLabel').textContent = '';
            } else {
                let idx = typeof problemIndex !== 'undefined' ? problemIndex + 1 : 1;
                if(idx >= problems.length) idx = 0;
                await setProblem(idx);
            }
        } else if(window.isRandomMode) {
            randomSelectConds();
            document.getElementById('problemIdLabel').textContent = '';
        }
    });

    // 初回履歴描画
    renderHistory();

    // 起動時は問題も条件も自動出題しない（ユーザー操作で初めて出題）
    // 何も呼ばない
    function updateCheatBtnVisibility() {
        document.getElementById('cheatBtn').style.display = window.DEBUG_MODE ? '' : 'none';
    }
    updateCheatBtnVisibility();
    document.addEventListener('keydown', (e) => {
        if(e.key === 'F2') {
            window.DEBUG_MODE = !window.DEBUG_MODE;
            updateCheatBtnVisibility();
        }
    });

    // 起動時はランダムモードで問題を開始
    window.isRandomMode = true;
    randomSelectConds();
    inputHistory = [];
    renderHistory();
    updateCondIcons();
    message.textContent = '';
    document.getElementById('problemIdLabel').textContent = '';

    // 遊び方ボタンでルール説明オーバーレイ再表示
    const howtoBtn = document.getElementById('howtoBtn');
    if(howtoBtn && ruleOverlay) {
        howtoBtn.addEventListener('click', () => {
            ruleOverlay.style.display = 'flex';
        });
    }
    // クレジットボタンでクレジットオーバーレイ表示
    const creditBtn = document.getElementById('creditBtn');
    const creditOverlay = document.getElementById('creditOverlay');
    if(creditBtn && creditOverlay) {
        creditBtn.addEventListener('click', () => {
            creditOverlay.style.display = 'flex';
        });
        creditOverlay.addEventListener('click', (e) => {
            if(e.target === creditOverlay) creditOverlay.style.display = 'none';
        });
    }
});
