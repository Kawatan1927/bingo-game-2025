// グローバル変数
let calledNumbers = [];
let selectedAxe = null;
let currentScreen = 'bingoScreen';

// 音声エフェクト
const drawSound = document.getElementById('drawSound');
const axeSelectSound = document.getElementById('axeSelectSound');
const resultSound = document.getElementById('resultSound');
const winSound = document.getElementById('winSound');

// 景品データ
const prizes = {
    gold: Array.from({length: 15}, (_, i) => ({
        id: i + 16,
        image: `images/gold-prize-${i + 1}.jpg`,
        selected: false
    })),
    silver: Array.from({length: 15}, (_, i) => ({
        id: i + 1,
        image: `images/silver-prize-${i + 1}.jpg`,
        selected: false
    }))
};

// 全画面表示の管理
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        document.getElementById('fullscreenBtn').style.display = 'none';
    }
});

// ESCキーでの全画面解除を防ぐ
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
    }
});

// 画面遷移
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

// ビンゴ番号抽選
document.getElementById('drawButton').addEventListener('click', () => {
    if (calledNumbers.length >= 75) {
        alert('すべての番号が出ました');
        return;
    }

    drawSound.play();

    let number;
    do {
        number = Math.floor(Math.random() * 75) + 1;
    } while (calledNumbers.includes(number));

    animateNumber(number);
});

// 数字めくりアニメーション
function animateNumber(targetNumber) {
    const currentNumber = document.getElementById('currentNumber');
    let count = 0;
    const duration = 5000; // 5秒間
    const interval = 50; // 50ミリ秒ごとに更新
    const steps = duration / interval;
    
    const animation = setInterval(() => {
        if (count < steps) {
            currentNumber.textContent = Math.floor(Math.random() * 75) + 1;
            count++;
        } else {
            clearInterval(animation);
            currentNumber.textContent = targetNumber;
            calledNumbers.push(targetNumber);
            updateHistory();
        }
    }, interval);
}

// 履歴更新
function updateHistory() {
    const history = document.getElementById('numberHistory');
    history.innerHTML = '';
    calledNumbers.forEach(num => {
        const numberElement = document.createElement('div');
        numberElement.className = 'history-number';
        numberElement.textContent = num;
        history.appendChild(numberElement);
    });
}

// 斧選択画面への移動
document.getElementById('toAxeButton').addEventListener('click', () => {
    showScreen('axeScreen');
});

// ビンゴ画面に戻る
document.getElementById('backToBingoButton').addEventListener('click', () => {
    showScreen('bingoScreen');
});

// 斧の選択
document.querySelectorAll('.axe').forEach(axe => {
    axe.addEventListener('click', () => {
        document.querySelectorAll('.axe').forEach(a => {
            a.classList.remove('selected');
        });
        axe.classList.add('selected');
        selectedAxe = axe.dataset.axe;
        axeSelectSound.play();
    });
});

// ENTERキーでの結果表示
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && currentScreen === 'axeScreen' && selectedAxe) {
        showAxeResult();
    }
});

// 斧選択結果の表示
function showAxeResult() {
    showScreen('resultScreen');
    const resultMessage = document.getElementById('resultMessage');
    
    const message = selectedAxe === 'left' ?
        '右が金の斧でした。左が銀の斧でした。' :
        '左が金の斧でした。右が銀の斧でした。';
    
    resultMessage.textContent = '';
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < message.length) {
            resultMessage.textContent += message[i];
            i++;
        } else {
            clearInterval(typeInterval);
            resultSound.play();
            setTimeout(() => {
                document.getElementById('toSilverButton').style.display = 'block';
            }, 1000);
        }
    }, 50);
}

// 景品グリッドの生成
function createPrizeGrid(isGold) {
    const gridContainer = document.getElementById(isGold ? 'goldPrizeGrid' : 'silverPrizeGrid');
    const prizeList = isGold ? prizes.gold : prizes.silver;
    
    gridContainer.innerHTML = '';
    prizeList.forEach(prize => {
        const item = document.createElement('div');
        item.className = `prize-item ${prize.selected ? 'selected' : ''}`;
        
        const img = document.createElement('img');
        img.src = prize.image;
        img.alt = `景品 ${prize.id}`;
        
        const number = document.createElement('div');
        number.className = 'prize-number';
        number.textContent = prize.id;
        
        item.appendChild(img);
        item.appendChild(number);
        
        if (!prize.selected) {
            item.addEventListener('click', () => selectPrize(prize, isGold));
        }
        
        gridContainer.appendChild(item);
    });
}

// 景品選択処理
function selectPrize(prize, isGold) {
    prize.selected = true;
    winSound.play();
    
    const winScreen = isGold ? 'goldWinScreen' : 'silverWinScreen';
    const winDisplay = document.getElementById(isGold ? 'goldWinDisplay' : 'silverWinDisplay');
    
    winDisplay.innerHTML = `
        <img src="${prize.image}" alt="当選景品">
        <div class="prize-info">
            <h2>景品番号 ${prize.id}</h2>
        </div>
    `;
    
    showScreen(winScreen);
}

// 画面遷移ボタンのイベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toSilverButton').addEventListener('click', () => {
        showScreen('silverPrizeScreen');
        createPrizeGrid(false);
    });

    document.getElementById('toGoldButton').addEventListener('click', () => {
        showScreen('goldPrizeScreen');
        createPrizeGrid(true);
    });

    document.getElementById('toBingoButton').addEventListener('click', () => {
        showScreen('bingoScreen');
        document.getElementById('currentNumber').textContent = 'BINGO';
    });
});

// 画面の初期化
// 画面の初期化
function initializeScreen() {
    [drawSound, axeSelectSound, resultSound, winSound].forEach(sound => {
        sound.load();
    });

    createPrizeGrid(true);
    createPrizeGrid(false);

    showScreen('bingoScreen');
}

// 画面読み込み時の初期化
window.addEventListener('load', initializeScreen);

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('エラーが発生しました:', e.message);
    // エラー時のフォールバック処理を追加することができます
});

// 画面サイズ変更時の処理
window.addEventListener('resize', () => {
    if (document.fullscreenElement) {
        document.getElementById('fullscreenBtn').style.display = 'none';
    }
});

// ビンゴ番号抽選時の演出
function enhanceDrawAnimation(number) {
    const currentNumber = document.getElementById('currentNumber');
    currentNumber.classList.add('highlight');
    setTimeout(() => currentNumber.classList.remove('highlight'), 2000);
}

// 斧選択時の演出
function enhanceAxeSelection(axe) {
    axe.classList.add('selected');
}

// 景品選択時の演出
function enhancePrizeSelection(prize) {
    prize.classList.add('selected');
}

// ビンゴ番号抽選のイベントリスナーを更新
document.getElementById('drawButton').addEventListener('click', () => {
    if (calledNumbers.length >= 75) {
        alert('すべての番号が出ました');
        return;
    }

    drawSound.play();

    let number;
    do {
        number = Math.floor(Math.random() * 75) + 1;
    } while (calledNumbers.includes(number));

    animateNumber(number);
    setTimeout(() => enhanceDrawAnimation(number), 5000); // 5秒後に演出を追加
});

// 斧選択のイベントリスナーを更新
document.querySelectorAll('.axe').forEach(axe => {
    axe.addEventListener('click', () => {
        document.querySelectorAll('.axe').forEach(a => a.classList.remove('selected'));
        selectedAxe = axe.dataset.axe;
        axeSelectSound.play();
        enhanceAxeSelection(axe);
    });
});

// 景品選択処理を更新
function selectPrize(prize, isGold) {
    prize.selected = true;
    winSound.play();
    
    const winScreen = isGold ? 'goldWinScreen' : 'silverWinScreen';
    const winDisplay = document.getElementById(isGold ? 'goldWinDisplay' : 'silverWinDisplay');
    
    winDisplay.innerHTML = `
        <img src="${prize.image}" alt="当選景品">
        <div class="prize-info">
            <h2>景品番号 ${prize.id}</h2>
        </div>
    `;
    
    showScreen(winScreen);
    enhancePrizeSelection(winDisplay);
}