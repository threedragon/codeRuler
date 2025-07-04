// 条件判定関数群
const condDefs = [
    // 禁則
    { key: 'no_repeat', label: '同じ数字を連続で使わない', category: '禁則', difficulty: 1 },
    { key: 'no_1234', label: '連番禁止', category: '禁則', difficulty: 2 },
    { key: 'no_all_same', label: '全て同じ数字禁止', category: '禁則', difficulty: 1 },
    // パターン
    { key: 'one_pair', label: '同じ数字が2つある', category: 'パターン', difficulty: 2 },
    { key: 'sum12_eq_3', label: '1桁目と2桁目の合計が3桁目', category: 'パターン', digitLimit: 3, difficulty: 3 },
    { key: 'palindrome', label: '回文である', category: 'パターン', difficulty: 2 },
    { key: 'double_3rd4th', label: '3桁目は1桁目の2倍、4桁目は2桁目の2倍', category: 'パターン', digitLimit: 4, difficulty: 4 },
    { key: 'inc_then_dec', label: '増えたあと減る', category: 'パターン', difficulty: 3 },
    { key: 'dec_then_inc', label: '減ったあと増える', category: 'パターン', difficulty: 3 },
    { key: 'all_diff', label: 'すべて異なる数字', category: 'パターン', difficulty: 1 },
    { key: 'maxmin_le_2', label: '最大値と最小値の差が2以内', category: 'パターン', difficulty: 2 },
    { key: 'adj_diff_1', label: '隣り合う数字の差が1', category: 'パターン', difficulty: 2 },
    // 合計
    { key: 'sum_le_10', label: '各位の合計が10以下', category: '合計', difficulty: 2 },
    { key: 'sum_ge_30', label: '各位の合計が30以上', category: '合計', difficulty: 2 },
    { key: 'prod_60', label: '各位の積が60', category: '合計', difficulty: 3 },
    // 数字
    { key: 'all_odd', label: 'すべて奇数', category: '数字', difficulty: 1 },
    { key: 'all_even', label: 'すべて偶数', category: '数字', difficulty: 1 },
    { key: 'all_prime', label: 'すべて素数', category: '数字', difficulty: 4 },
    { key: 'all_01', label: 'すべて0か1', category: '数字', difficulty: 1 },
    { key: 'odd_even_pos', label: '左から奇数番目は奇数、偶数番目は偶数', category: '数字', difficulty: 3 },
    // 順序
    { key: 'asc', label: '数字が昇順である', category: '順序', difficulty: 1 },
    { key: 'desc', label: '数字が降順である', category: '順序', difficulty: 1 },
    // 数学
    { key: 'mod3', label: '数字として3の倍数', category: '数学', difficulty: 4 },
    { key: 'mod4', label: '数字として4の倍数', category: '数学', difficulty: 4 },
    { key: 'mod5', label: '数字として5の倍数', category: '数学', difficulty: 4 },
    { key: 'mod7', label: '数字として7の倍数', category: '数学', difficulty: 4 },
    { key: 'mod8', label: '数字として8の倍数', category: '数学', difficulty: 4 },
    { key: 'mod13', label: '数字として13の倍数', category: '数学', difficulty: 5 },
    { key: 'prime', label: '数字として素数', category: '数学', difficulty: 5 }
];

// ラベルの{N}を桁数で置換
function getCondLabel(condKey, digitCount) {
    const def = condDefs.find(c => c.key === condKey);
    if (!def) return '';
    return def.label.replace('{N}', digitCount);
}

// password: 入力値（文字列）、enabledConds: 有効な条件配列、digitCount: 桁数
function checkEachCondition(password, enabledConds, digitCount) {
    const results = {};
    const digitsArr = password.split('').map(Number);
    if(enabledConds.includes('no_repeat')) {
        let ok = true;
        for(let i=1; i<password.length; ++i) {
            if(password[i] === password[i-1]) ok = false;
        }
        results['no_repeat'] = ok;
    }
    if(enabledConds.includes('no_1234')) {
        // 連番禁止: 昇順・降順の連番を桁数分で判定
        let ng = [];
        for(let start=0; start<=10-digitCount; ++start) {
            let asc = '';
            let desc = '';
            for(let i=0; i<digitCount; ++i) {
                asc += (start+i)%10;
                desc += (start+digitCount-1-i)%10;
            }
            ng.push(asc, desc);
        }
        results['no_1234'] = !ng.includes(password);
    }
    if(enabledConds.includes('no_all_same')) {
        const re = new RegExp(`^([0-9])\\1{${digitCount-1}}$`);
        results['no_all_same'] = !re.test(password);
    }
    if(enabledConds.includes('sum_le_10')) {
        results['sum_le_10'] = digitsArr.reduce((a,b)=>a+b,0) <= 10;
    }
    if(enabledConds.includes('sum_ge_30')) {
        results['sum_ge_30'] = digitsArr.reduce((a,b)=>a+b,0) >= 30;
    }
    if(enabledConds.includes('prod_60')) {
        results['prod_60'] = digitsArr.reduce((a,b)=>a*b,1) === 60;
    }
    if(enabledConds.includes('all_odd')) {
        results['all_odd'] = digitsArr.every(d => d % 2 === 1);
    }
    if(enabledConds.includes('all_even')) {
        results['all_even'] = digitsArr.every(d => d % 2 === 0);
    }
    if(enabledConds.includes('asc')) {
        // すべて同じ数字はNG（昇順条件）
        results['asc'] = digitsArr.every((d,i,arr) => i === 0 || arr[i-1] <= d) && new Set(digitsArr).size > 1;
    }
    if(enabledConds.includes('desc')) {
        // すべて同じ数字はNG（降順条件）
        results['desc'] = digitsArr.every((d,i,arr) => i === 0 || arr[i-1] >= d) && new Set(digitsArr).size > 1;
    }
    if(enabledConds.includes('one_pair')) {
        let counts = {};
        digitsArr.forEach(d => counts[d] = (counts[d]||0)+1);
        results['one_pair'] = Object.values(counts).some(c => c === 2);
    }
    // 数学系: N桁の数字として判定
    const num = Number(password);
    if(enabledConds.includes('mod3')) {
        results['mod3'] = (password.length === digitCount && num % 3 === 0);
    }
    if(enabledConds.includes('mod4')) {
        results['mod4'] = (password.length === digitCount && num % 4 === 0);
    }
    if(enabledConds.includes('mod5')) {
        results['mod5'] = (password.length === digitCount && num % 5 === 0);
    }
    if(enabledConds.includes('mod7')) {
        results['mod7'] = (password.length === digitCount && num % 7 === 0);
    }
    if(enabledConds.includes('mod8')) {
        results['mod8'] = (password.length === digitCount && num % 8 === 0);
    }
    if(enabledConds.includes('mod13')) {
        results['mod13'] = (password.length === digitCount && Number(password) % 13 === 0);
    }
    if(enabledConds.includes('prime')) {
        let isPrime = num > 1 && password.length === digitCount;
        for(let i=2; i<=Math.sqrt(num); ++i) {
            if(num % i === 0) { isPrime = false; break; }
        }
        results['prime'] = isPrime;
    }
    if(enabledConds.includes('all_prime')) {
        function isPrime(n) {
            if(n < 2) return false;
            for(let i=2; i<=Math.sqrt(n); ++i) if(n%i===0) return false;
            return true;
        }
        results['all_prime'] = digitsArr.every(isPrime);
    }
    if(enabledConds.includes('all_01')) {
        results['all_01'] = digitsArr.every(d => d === 0 || d === 1);
    }
    if(enabledConds.includes('odd_even_pos')) {
        results['odd_even_pos'] = digitsArr.every((d,i) => (i%2===0 ? d%2===1 : d%2===0));
    }
    if(enabledConds.includes('sum12_eq_3')) {
        results['sum12_eq_3'] = digitCount === 3 && digitsArr[0] + digitsArr[1] === digitsArr[2];
    }
    if(enabledConds.includes('palindrome')) {
        results['palindrome'] = password === password.split('').reverse().join('');
    }
    if(enabledConds.includes('double_3rd4th')) {
        results['double_3rd4th'] = digitCount === 4 && digitsArr[2] === digitsArr[0]*2 && digitsArr[3] === digitsArr[1]*2;
    }
    if(enabledConds.includes('inc_then_dec')) {
        // 増えたあと減る: 最初に増加、その後減少（山型）
        let peak = -1;
        for(let i=1; i<digitsArr.length; ++i) {
            if(digitsArr[i] > digitsArr[i-1]) peak = i;
            else break;
        }
        let ok = false;
        if(peak > 0 && peak < digitsArr.length-1) {
            // 前半で必ず増加、後半で必ず減少
            let inc = true, dec = true;
            for(let i=1; i<=peak; ++i) if(digitsArr[i] <= digitsArr[i-1]) inc = false;
            for(let i=peak+1; i<digitsArr.length; ++i) if(digitsArr[i] >= digitsArr[i-1]) dec = false;
            ok = inc && dec;
        }
        results['inc_then_dec'] = ok;
    }
    if(enabledConds.includes('dec_then_inc')) {
        // 減ったあと増える: 最初に減少、その後増加（谷型）
        let valley = -1;
        for(let i=1; i<digitsArr.length; ++i) {
            if(digitsArr[i] < digitsArr[i-1]) valley = i;
            else break;
        }
        let ok = false;
        if(valley > 0 && valley < digitsArr.length-1) {
            // 前半で必ず減少、後半で必ず増加
            let dec = true, inc = true;
            for(let i=1; i<=valley; ++i) if(digitsArr[i] >= digitsArr[i-1]) dec = false;
            for(let i=valley+1; i<digitsArr.length; ++i) if(digitsArr[i] <= digitsArr[i-1]) inc = false;
            ok = dec && inc;
        }
        results['dec_then_inc'] = ok;
    }
    if(enabledConds.includes('all_diff')) {
        results['all_diff'] = new Set(digitsArr).size === digitsArr.length;
    }
    if(enabledConds.includes('maxmin_le_2')) {
        results['maxmin_le_2'] = Math.max(...digitsArr) - Math.min(...digitsArr) <= 2;
    }
    if(enabledConds.includes('adj_diff_1')) {
        results['adj_diff_1'] = digitsArr.every((d,i,arr) => i === 0 || Math.abs(d - arr[i-1]) === 1);
    }
    return results;
}

// condDefs, getCondLabel, checkEachCondition をエクスポート（必要に応じて）
