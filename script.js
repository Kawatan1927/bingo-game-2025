// グローバル変数
let bingoNumbers = [];
let calledNumbers = [];
let drawingCount = 0;
let currentScreen = 'bingoScreen';
let isFullscreen = false;
let animationLength;
let animationLengthMin = 1000; // アニメーション長最小値
let animationLengthMax = 10000; // アニメーション長最大値

// メインプロセスから設定ファイルの値を受信およびキャスト
window.api.on("settings", (arg) => {
    animationLength = parseInt(arg.animationLength);
});

// 音声エフェクト
const drawSound = document.getElementById('drawSound');
const axeSelectSound = document.getElementById('axeSelectSound');
const resultSound = document.getElementById('resultSound');
const winSound = document.getElementById('winSound');

// 景品データ
const prizes = {
    gold: [
        { id: 16, name: 'iPad', image: 'images/gold-prize-1.jpg', selected: false },
        { id: 17, name: 'チェア', image: 'images/gold-prize-2.jpg', selected: false },
        { id: 18, name: 'Bluetooth ヘッドホン', image: 'images/gold-prize-3.jpg', selected: false },
        { id: 19, name: 'コーヒーメーカー', image: 'images/gold-prize-4.jpg', selected: false },
        { id: 20, name: 'ゲーミングモニター', image: 'images/gold-prize-5.jpg', selected: false },
        { id: 21, name: '水なし自動調理鍋', image: 'images/gold-prize-6.jpg', selected: false },
        { id: 22, name: '除湿機', image: 'images/gold-prize-7.jpg', selected: false },
        { id: 23, name: 'オーブンレンジ', image: 'images/gold-prize-8.jpg', selected: false },
        { id: 24, name: 'ワイヤレスイヤホン', image: 'images/gold-prize-9.jpg', selected: false },
        { id: 25, name: 'Dyson 掃除機', image: 'images/gold-prize-10.jpg', selected: false },
        { id: 26, name: 'ReFaヘッドマッサージ', image: 'images/gold-prize-11.jpg', selected: false },
        { id: 27, name: 'Wi-Fiルーター', image: 'images/gold-prize-12.jpg', selected: false },
        { id: 28, name: 'ReFa シャワーヘッド', image: 'images/gold-prize-13.jpg', selected: false },
        { id: 29, name: 'Nintendo Switch Lite', image: 'images/gold-prize-14.jpg', selected: false },
        { id: 30, name: 'ドライヤー', image: 'images/gold-prize-15.jpg', selected: false },
    ],
    silver: [
        { id: 1, name: 'ヒツジのいらない枕', image: 'images/silver-prize-1.jpg', selected: false },
        { id: 2, name: '百黙 純米大吟醸', image: 'images/silver-prize-2.jpg', selected: false },
        { id: 3, name: '布団乾燥機', image: 'images/silver-prize-3.jpg', selected: false },
        { id: 4, name: '魚沼産こしひかり 10kg', image: 'images/silver-prize-4.jpg', selected: false },
        { id: 5, name: 'ホットカーペット', image: 'images/silver-prize-5.jpg', selected: false },
        { id: 6, name: '加湿器', image: 'images/silver-prize-6.jpg', selected: false },
        { id: 7, name: '電動歯ブラシ', image: 'images/silver-prize-7.jpg', selected: false },
        { id: 8, name: 'ゴルフボール 1ダース', image: 'images/silver-prize-8.jpg', selected: false },
        { id: 9, name: 'プラレール レールキット', image: 'images/silver-prize-9.jpg', selected: false },
        { id: 10, name: 'ザ･プレミアム･モルツ', image: 'images/silver-prize-10.jpg', selected: false },
        { id: 11, name: 'ドンジャラ ちいかわ', image: 'images/silver-prize-11.jpg', selected: false },
        { id: 12, name: 'マッサージガン', image: 'images/silver-prize-12.jpg', selected: false },
        { id: 13, name: 'ReFa ヘアブラシ', image: 'images/silver-prize-13.jpg', selected: false },
        { id: 14, name: 'サウナハット', image: 'images/silver-prize-14.jpg', selected: false },
        { id: 15, name: '缶詰おつまみ 3缶セット', image: 'images/silver-prize-15.jpg', selected: false },
    ],
};

// アニメーション長設定欄
const inputAnimationLength = document.getElementById("animationLength");

// 全画面表示の管理
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!isFullscreen) {
        document.documentElement.requestFullscreen();
    }
});

document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
    document.getElementById('fullscreenBtn').style.display = isFullscreen ? 'none' : 'block';
});

// ESCキーでの全画面解除を防ぐ
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
    }
});

// 起動時処理(ビンゴ番号配列の生成、設定ファイルの値を設定欄に表示)
window.onload = function () {
    bingoNumbers = fisherYateShuffle(forRange(1, 75));
    console.log(bingoNumbers);

    inputAnimationLength.value = animationLength;
};

/**
 * a~zまでの連番配列を生成する関数
 * @param {number} a - 開始番号
 * @param {number} z - 終了番号
 * @returns {number[]} - 連番配列
 */
const forRange = (a, z) => {
    var lst = [];
    for (let i = a; i <= z; i++) {
        lst.push(i)
    }
    return lst
}

/**
 * 配列シャッフル関数(Fisher-Yate Shuffle)
 * @param {number[]} numberArray - シャッフルする配列
 * @returns {number[]} - シャッフルされた配列
 */
function fisherYateShuffle(numberArray) {
    for (i = numberArray.length - 1; i > 0; i--) {
        r = Math.floor(Math.random() * (i + 1));
        tmp = numberArray[i];
        numberArray[i] = numberArray[r];
        numberArray[r] = tmp;
    }
    return numberArray;
};

/**
 * 画面遷移を制御する関数
 * @param {string} screenId - 遷移先の画面ID
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
}

// ビンゴ番号抽選(シャッフル後の配列を先頭から参照する)
document.getElementById('drawButton').addEventListener('click', () => {
    const gameControlButtons = document.querySelectorAll('.game-control-btn');

    if (calledNumbers.length >= 75) {
        alert('すべての番号が出ました');
        return;
    }

    // ボタンを無効化してアニメーションを開始
    gameControlButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.5';
    });

    drawSound.play();

    let number = bingoNumbers[drawingCount];
    drawingCount++;

    animateNumber(number);

    // アニメーション完了後にボタンを再度有効化
    setTimeout(() => {
        gameControlButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
        });
        enhanceDrawAnimation(number);
    }, animationLength);
});

/**
 * 数字めくりアニメーション
 * @param {number} targetNumber - 表示する番号
 */
function animateNumber(targetNumber) {
    const currentNumber = document.getElementById('currentNumber');
    let count = 0;
    const duration = animationLength; // 5秒間
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

/**
 * ビンゴ番号履歴を更新する関数
 */
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
    showScreen('axeSelectionScreen');
    anime({
        targets: '#axeSelectionScreen',
        scale: [0.3, 1],
        duration: 1500
    })
});

// 結果発表ボタンクリックで結果表示
document.getElementById('axeResultButton').addEventListener('click', () => {
    if (currentScreen === 'axeSelectionScreen') {
        showAxeResult();
    }
})

// 紙吹雪アニメーション共通パラメータ
var confettiDefaultSettings = {
    spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
};

// 当たりが金の斧の時のパラメータ
var goldSettings = {
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
    origin: {
        x: 0.27,
        y: 0.55
    }
};

// 当たりが銀の斧の時のパラメータ
var silverSettings = {
    colors: ['BDC3C9', 'E9EAEA', '979C9A', 'EEEEEE', '9EACB4'],
    origin: {
        x: 0.73,
        y: 0.55
    }
};

/**
 * 結果発表画面 紙吹雪アニメーション(canvas-confetti)
 * @param {Object} colorSettings - 紙吹雪の色設定
 */
function starShoot(colorSettings){
    confetti({
        ...confettiDefaultSettings,
        ...colorSettings,
        particleCount: 50,
        scalar: 1.2,
        shapes: ['star']
    });

    confetti({
        ...confettiDefaultSettings,
        ...colorSettings,
        particleCount: 50,
        scalar: 0.75,
        shapes: ['circle']
    });
};

/**
 * 斧選択結果の表示
 */
function showAxeResult() {
const goldImg = document.getElementById('goldImg');
const silverImg = document.getElementById('silverImg');

    const resultFlag = Math.random();

    showScreen('resultScreen');
    const resultMessage = document.getElementById('resultMessage');

    const message = resultFlag > 0.5 ?
        'プレミアム景品は銀の斧!' :
        'プレミアム景品は金の斧!';

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
                document.getElementById('toStandardPrizeButton').style.display = 'block';
            }, 1000);
        }
    }, 50);

    if(resultFlag > 0.5){
        goldImg.setAttribute('class', 'dark');
        silverImg.setAttribute('class', 'brite');
        setTimeout(starShoot(silverSettings), 0);
        setTimeout(starShoot(silverSettings), 200);
        setTimeout(starShoot(silverSettings), 400);
        setTimeout(starShoot(silverSettings), 600);
    }else{
        goldImg.setAttribute('class', 'brite');
        silverImg.setAttribute('class', 'dark');
        setTimeout(starShoot(goldSettings), 0);
        setTimeout(starShoot(goldSettings), 200);
        setTimeout(starShoot(goldSettings), 400);
        setTimeout(starShoot(goldSettings), 600);
    };
}

/**
 * 景品一覧画面をグリッドレイアウトで生成する
 *
 * @param {boolean} isGold - 金の斧の場合はtrue、銀の斧の場合はfalse
 * @param {boolean} previewMode - プレビューモードの場合はtrue
 */
function createPrizeGrid(isGold, previewMode = false) {
    const gridId = previewMode
        ? (isGold ? 'premiumPreviewGrid' : 'standardPreviewGrid')
        : (isGold ? 'premiumPrizeGrid' : 'standardPrizeGrid');

    const gridContainer = document.getElementById(gridId);
    const prizeList = isGold ? prizes.gold : prizes.silver;

    gridContainer.innerHTML = '';
    prizeList.forEach(prize => {
        const item = document.createElement('div');
        item.setAttribute("id", "prize");
        item.className = `prize-item ${prize.selected ? 'selected' : ''}`;
        if (previewMode) {
            item.classList.add('preview');
        }

        const img = document.createElement('img');
        img.src = prize.image;
        img.alt = `景品 ${prize.id}`;

        const number = document.createElement('div');
        number.className = 'prize-number';
        number.textContent = prize.id + "：" + prize.name;


        item.appendChild(img);
        item.appendChild(number);

        if (!prize.selected && !previewMode) {
            item.addEventListener('click', () => displayConfirmWindow(prize, isGold));
        }

        gridContainer.appendChild(item);
    });
}

// 画面遷移ボタンのイベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('toStandardPrizeButton').addEventListener('click', () => {
        showScreen('standardPrizeScreen');
        createPrizeGrid(false);
        anime({
            targets: '#prize',
            rotateY: -360,
            duration: 3000,
            easing: 'spring(1, 80, 10, 0)'
        })
    });

    document.getElementById('toPremiumPrizeButton').addEventListener('click', () => {
        showScreen('premiumPrizeScreen');
        createPrizeGrid(true);
        anime({
            targets: '#prize',
            rotateY: 360,
            duration: 3000,
            easing: 'spring(1, 80, 10, 0)'
        })
    });

    document.getElementById('previewPremiumPrizeButton').addEventListener('click', () => {
        showScreen('premiumPreviewScreen');
        createPrizeGrid(true, true);
        anime({
            targets: '#prize',
            rotateY: 360,
            duration: 3000,
            easing: 'spring(1, 80, 10, 0)'
        })
    });

    document.getElementById('previewStandardPrizeButton').addEventListener('click', () => {
        showScreen('standardPreviewScreen');
        createPrizeGrid(false, true);
        anime({
            targets: '#prize',
            rotateY: -360,
            duration: 3000,
            easing: 'spring(1, 80, 10, 0)'
        })
    });

    document.getElementById('backToSelectStandardItem').addEventListener('click', () => {
        showScreen('standardPrizeScreen');
        createPrizeGrid(false);
    });

    document.getElementById('backToSelectPremiumItem').addEventListener('click', () => {
        showScreen('premiumPrizeScreen');
        createPrizeGrid(true);
    });

    document.querySelectorAll('.back-to-bingo-btn').forEach(button => {
        button.addEventListener('click', () => {
            showScreen('bingoScreen');
        });
    });
});

/**
 * 画面の初期化処理を行う関数
 * ※画面読み込み時に使用
 */
function initializeScreen() {
    [drawSound, axeSelectSound, resultSound, winSound].forEach(sound => {
        sound.load();
    });

    createPrizeGrid(true);
    createPrizeGrid(false);

    showScreen('bingoScreen');
    
    // 全画面ボタンの表示状態を初期化
    isFullscreen = !!document.fullscreenElement;
    document.getElementById('fullscreenBtn').style.display = isFullscreen ? 'none' : 'block';
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

/**
 * ビンゴ番号抽選時の演出
 * @param {number} number - 抽選された番号
 */
function enhanceDrawAnimation(number) {
    const currentNumber = document.getElementById('currentNumber');
    currentNumber.classList.add('highlight');
    setTimeout(() => currentNumber.classList.remove('highlight'), 2000);
}

/**
 * 斧選択時の演出
 * @param {HTMLElement} axe - 選択された斧の要素
 */
function enhanceAxeSelection(axe) {
    axe.classList.add('selected');
}

/**
 * 景品選択時の演出
 * @param {HTMLElement} prize - 選択された景品の要素
 */
function enhancePrizeSelection(prize) {
    prize.classList.add('selected');
}

// 斧選択のイベントリスナー
document.querySelectorAll('.axe').forEach(axe => {
    axe.addEventListener('click', () => {
        document.querySelectorAll('.axe').forEach(a => a.classList.remove('selected'));
        selectedAxe = axe.dataset.axe;
        axeSelectSound.play();
        enhanceAxeSelection(axe);
    });
});

/**
 * 景品選択確認画面表示処理
 * @param {Object} prize - 選択された景品
 * @param {boolean} isGold - 金の斧の場合はtrue、銀の斧の場合はfalse
 */
// 景品選択確認画面表示処理
function displayConfirmWindow(prize, isGold){
    const confirmScreen = isGold ? 'premiumConfirmScreen' : 'standardConfirmScreen';
    const confirmDisplay = document.getElementById(isGold ? 'premiumConfirmDisplay' : 'standardConfirmDisplay');
    const confirmButton = document.getElementById(isGold ? 'confirmPremiumItem' : 'confirmStandardItem');

    confirmDisplay.innerHTML = `
        <img src="${prize.image}" alt="当選景品">
        <div class="prize-info">
            <h2>景品番号 ${prize.id}</h2>
            <h2>${prize.name}</h2>
        </div>
    `;

    showScreen(confirmScreen);
    confirmButton.addEventListener('click', () => selectPrize(prize, isGold));
}

/**
 * 景品選択処理
 * @param {Object} prize - 選択された景品
 * @param {boolean} isGold - 金の斧の場合はtrue、銀の斧の場合はfalse
 */
function selectPrize(prize, isGold) {
    prize.selected = true;
    winSound.play();

    const winScreen = isGold ? 'premiumWinScreen' : 'standardWinScreen';
    const winDisplay = document.getElementById(isGold ? 'goldWinDisplay' : 'silverWinDisplay');

    winDisplay.innerHTML = `
        <img src="${prize.image}" alt="当選景品">
        <div class="prize-info">
            <h2>景品番号 ${prize.id}</h2>
            <h2>${prize.name}</h2>
        </div>
    `;

    showScreen(winScreen);
    enhancePrizeSelection(winDisplay);
    anime({
        targets: winDisplay,
        scale: [0.3, 1.5, 1.1],
        rotateY: 360,
        duration: 1500
    })

    if (isGold) {
        checkLastOnePrize();
    }
}

// ラストワン賞画面処理
function checkLastOnePrize() {
    const allSelected = prizes.gold.every(prize => prize.selected) && prizes.silver.every(prize => prize.selected);
    const toLastOnePrizeButton = document.getElementById('toLastOnePrizeButton');
    const backToBingoButton = document.getElementById('backToBingoFromGoldWin');
    
    if (allSelected) {
        toLastOnePrizeButton.style.display = 'block';
        backToBingoButton.style.display = 'none';
    } else {
        toLastOnePrizeButton.style.display = 'none';
        backToBingoButton.style.display = 'block';
    }
}

document.getElementById('toLastOnePrizeButton').addEventListener('click', () => {
    showScreen('lastOnePrizeScreen');
    createFireworks();
});

//花火演出
function createFireworks() {
    for (let i = 0; i < 50; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.setProperty('--tx', `${Math.random() * 200 - 100}px`);
        firework.style.setProperty('--ty', `${Math.random() * 200 - 100}px`);
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${Math.random() * 100}%`;
        firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.getElementById('lastOnePrizeScreen').appendChild(firework);
    }
}

// 設定値入力欄制御用変数
const modal = document.querySelector('.js-modal');
const modalButton = document.querySelector('.js-modal-button');
const modalComplete = document.querySelector('.js-complete-button');
const modalClose = document.querySelector('.js-close-button');

// 設定ボタン押下時イベント
modalButton.addEventListener('click', () => {
    modal.classList.add('is-open');
});

// 設定完了ボタン押下時イベント
modalComplete.addEventListener('click', () => {
    modal.classList.remove('is-open');
    animationLength = inputValueCheck(inputAnimationLength.value);
    window.api.send("update_animation_length", animationLength);
});

// キャンセルボタン押下時イベント
modalClose.addEventListener('click', () => {
    modal.classList.remove('is-open');
    inputAnimationLength.value = animationLength;
});

/**
 * アニメーション長の入力値チェック
 * @param {number} inputValue - 入力されたアニメーション長設定値
 * @returns {number} 実設定値(範囲外の場合は1000ms~10000msに強制)
 */
function inputValueCheck(inputValue) {
    if(inputValue < animationLengthMin){
        inputAnimationLength.value = animationLengthMin;
        return animationLengthMin;
    }else if(inputValue > animationLengthMax){
        inputAnimationLength.value = animationLengthMax;
        return animationLengthMax;
    }else{
        return inputValue;
    };
}
