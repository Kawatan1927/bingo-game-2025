// グローバル変数
let bingoNumbers = [];
let calledNumbers = [];
let drawingCount = 0;
let currentScreen = 'bingoScreen';
let isFullscreen = false;
let animationLength;
let individualFirstAnimationSetting;
let firstAnimationLength;
let animationLengthMin = 1000; // アニメーション長最小値
let animationLengthMax = 10000; // アニメーション長最大値
let saveLogFolderPath;
let selectedId = [];

// メインプロセスから設定ファイルの値を受信およびキャスト
window.api.on("settings", (arg) => {
    animationLength = parseInt(arg.animationLength);
    individualFirstAnimationSetting = Boolean(arg.individualFirstAnimationSetting);
    firstAnimationLength = parseInt(arg.firstAnimationLength);
});

// 音声エフェクト
const drawSound = document.getElementById('drawSound');
const axeSelectSound = document.getElementById('axeSelectSound');
const resultSound = document.getElementById('resultSound');
const winSound = document.getElementById('winSound');

// 景品データ
const prizes = {
    gold: [
        { id: 16, name: 'iPad', image: 'images/gold-prize-1.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 17, name: 'チェア', image: 'images/gold-prize-2.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 18, name: 'Bluetooth ヘッドホン', image: 'images/gold-prize-3.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 19, name: 'コーヒーメーカー', image: 'images/gold-prize-4.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 20, name: 'ゲーミングモニター', image: 'images/gold-prize-5.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 21, name: '水なし自動調理鍋', image: 'images/gold-prize-6.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 22, name: '除湿機', image: 'images/gold-prize-7.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 23, name: 'オーブンレンジ', image: 'images/gold-prize-8.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 24, name: 'ワイヤレスイヤホン', image: 'images/gold-prize-9.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 25, name: 'Dyson 掃除機', image: 'images/gold-prize-10.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 26, name: 'ReFaヘッドマッサージ', image: 'images/gold-prize-11.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 27, name: 'Wi-Fiルーター', image: 'images/gold-prize-12.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 28, name: 'ReFa シャワーヘッド', image: 'images/gold-prize-13.jpg', selected: false , description: '何か説明が入ります。' },
        { id: 29, name: 'Nintendo Switch Lite', image: 'images/gold-prize-14.jpg', selected: false , description: '何か説明が入ります。'  },
        { id: 30, name: 'ドライヤー', image: 'images/gold-prize-15.jpg', selected: false , description: '何か説明が入ります。' },
    ],
    silver: [
        { id: 1, name: 'ヒツジのいらない枕', image: 'images/silver-prize-1.jpg', selected: false },
        { id: 2, name: '日本酒', image: 'images/silver-prize-2.jpg', selected: false },
        { id: 3, name: '布団乾燥機', image: 'images/silver-prize-3.jpg', selected: false },
        { id: 4, name: 'あきたこまち 10kg', image: 'images/silver-prize-4.jpg', selected: false },
        { id: 5, name: 'ホットカーペット', image: 'images/silver-prize-5.jpg', selected: false },
        { id: 6, name: '加湿器', image: 'images/silver-prize-6.jpg', selected: false },
        { id: 7, name: '電動歯ブラシ', image: 'images/silver-prize-7.jpg', selected: false },
        { id: 8, name: 'ゴルフボール 1ダース', image: 'images/silver-prize-8.jpg', selected: false },
        { id: 9, name: 'プラレール レールキット', image: 'images/silver-prize-9.jpg', selected: false },
        { id: 10, name: 'ビールギフト', image: 'images/silver-prize-10.jpg', selected: false },
        { id: 11, name: 'ドンジャラ ちいかわ', image: 'images/silver-prize-11.jpg', selected: false },
        { id: 12, name: 'マッサージガン', image: 'images/silver-prize-12.jpg', selected: false },
        { id: 13, name: 'ReFa ヘアブラシ', image: 'images/silver-prize-13.jpg', selected: false },
        { id: 14, name: 'サウナハット', image: 'images/silver-prize-14.jpg', selected: false },
        { id: 15, name: '缶詰おつまみ 3缶セット', image: 'images/silver-prize-15.jpg', selected: false },
    ],
};

// スタック操作関数
function Stack() {
	this.__a = new Array();
}

Stack.prototype.push = function(o) {
	this.__a.push(o);
}

Stack.prototype.pop = function() {
	if( this.__a.length > 0 ) {
		return this.__a.pop();
	}
	return null;
}

Stack.prototype.size = function() {
	return this.__a.length;
}

// 景品選択管理スタック(LIFO)
const selectedPrizeIdStack = new Stack();

// スタックに積まれている景品を獲得済みにする関数
function updateSelectedPrizes(){
    var selectedPremiumId = selectedPrizeIdStack.pop();
    var selectedStandardId = selectedPrizeIdStack.pop();
    var selectedPremiumPrize = prizes.gold.find(prize => prize.id === selectedPremiumId);
    var selectedStandardPrize = prizes.silver.find(prize => prize.id === selectedStandardId);

    selectedPremiumPrize.selected = true;
    selectedStandardPrize.selected = true;

    selectedId.push(selectedPremiumId);
    selectedId.push(selectedStandardId);

    window.api.send(
        "updateSelcPrize",
        {
            selectedId
        }
    );
}

// アニメーション長設定欄
const inputAnimationLength = document.getElementById("animationLength");
const animationToggle = document.getElementById('animationToggle');
const inputFirstAnimation = document.getElementById('firstAnimationLength');

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
    setTimeout(() => {
    bingoNumbers = fisherYateShuffle(forRange(1, 75));
    console.log(bingoNumbers);

    inputAnimationLength.value = animationLength;
    animationToggle.checked = individualFirstAnimationSetting;
    inputFirstAnimation.value = firstAnimationLength;
    if(animationToggle.checked != true){
        inputFirstAnimation.disabled = true;
    }
    }, 1500);
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

    let number = bingoNumbers[drawingCount];
    animateNumber(number);

    const time = (drawingCount == 0) && animationToggle.checked ? firstAnimationLength : animationLength;
    drawingCount++;

    if (drawingCount == 1){
        window.api.send(
            "gameStart",
            {
                bingoNumbers,
                drawingCount
            }
        );
    }else{
        window.api.send(
            "countUpdate",
            {
                bingoNumbers,
                drawingCount
            }
        );
    }

    playDrawSound(time / 1000);

    // アニメーション完了後にボタンを再度有効化
    setTimeout(() => {
        gameControlButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
        });
        enhanceDrawAnimation(number);
    }, time);
});

/**
 * 数字めくりアニメーション
 * @param {number} targetNumber - 表示する番号
 */
function animateNumber(targetNumber) {
    const currentNumber = document.getElementById('currentNumber');
    let count = 0;
    const duration = (drawingCount == 0) && animationToggle.checked ? firstAnimationLength : animationLength;
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
    playDecisionSound();
    playDisplayAxeSound();
    showScreen('axeSelectionScreen');
    anime({
        targets: '#axeSelectionScreen',
        scale: [0, 1],
        duration: 1200,
        easing: 'cubicBezier(1, 1.49, 1, 1.16)'
    })
});

// 結果発表ボタンクリックで結果表示
document.getElementById('axeResultButton').addEventListener('click', () => {
    if (currentScreen === 'axeSelectionScreen') {
        const text = 'ARE YOU READY?';
        const msg = document.getElementById('pre-result-message');

        msg.innerHTML = ``;

        playResultButtonSound();
        showScreen('preResultScreen');
        anime({
            targets: '#preResultScreen',
            opacity: [0, 1],
            duration: 7000,
		    fill: 'forwards'
        })

        setTimeout(() => {
            for(i = 0; i < text.length; i++){
                if(text[i] == ' '){
                    msg.innerHTML += `<span><pre> </pre></span>`
                }else{
                    msg.innerHTML += `<span>${text[i]}</span>`
                }
            }

            playDisplayMessageSound(1.4);

            anime({
                targets: '.pre-result-message > span',
                scale: [0, 1],
                duration: 150,
                easing: 'easeInElastic(10,1)',
                delay: anime.stagger(100)
            });
        }, 1500);

        setTimeout(() => {
            playDisplayMessageSound(1.4);

            anime({
                targets: '.pre-result-message > span',
                scale: [1, 0],
                duration: 150,
                easing: 'easeInElastic(10,1)',
                delay: anime.stagger(100)
            });
        }, 3500);

        setTimeout(() => {
            playResultSound(2.8);
        }, 5000);

        setTimeout(() => {

            showAxeResult();

            anime({
                targets: '#resultScreen',
                scale: [0, 1],
                duration: 1200,
            })
        }, 7800);
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
        setTimeout(starShoot(silverSettings), 120);
        setTimeout(starShoot(silverSettings), 200);
        setTimeout(starShoot(silverSettings), 400);
        setTimeout(starShoot(silverSettings), 600);
    }else{
        goldImg.setAttribute('class', 'brite');
        silverImg.setAttribute('class', 'dark');
        setTimeout(starShoot(goldSettings), 120);
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
        playTransitionSound();
        showScreen('standardPrizeScreen');
        createPrizeGrid(false);
    });

    document.getElementById('toPremiumPrizeButton').addEventListener('click', () => {
        playTransitionSound();
        showScreen('premiumPrizeScreen');
        createPrizeGrid(true);
    });

    document.getElementById('previewPremiumPrizeButton').addEventListener('click', () => {
        playTransitionSound();
        showScreen('premiumPreviewScreen');
        createPrizeGrid(true, true);
    });

    document.getElementById('previewStandardPrizeButton').addEventListener('click', () => {
        playTransitionSound();
        showScreen('standardPreviewScreen');
        createPrizeGrid(false, true);
    });

    document.getElementById('backToSelectStandardItem').addEventListener('click', () => {
        playCancelSound();
        selectedPrizeIdStack.pop();
        showScreen('standardPrizeScreen');
        createPrizeGrid(false);
    });

    document.getElementById('backToSelectPremiumItem').addEventListener('click', () => {
        playCancelSound();
        selectedPrizeIdStack.pop();
        showScreen('premiumPrizeScreen');
        createPrizeGrid(true);
    });

    document.querySelectorAll('.back-to-bingo-btn').forEach(button => {
        button.addEventListener('click', () => {
            if(selectedPrizeIdStack.size() > 0){
                updateSelectedPrizes();
            }
            playCancelSound();
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
    const itemImg = document.getElementById(isGold ? 'premiumItemImg' : 'standardItemImg');
    const itemTxt = document.getElementById(isGold ? 'premiumItemTxt' : 'standardItemTxt');
    const confirmButton = document.getElementById(isGold ? 'confirmPremiumItem' : 'confirmStandardItem');

    playTransitionSound();
    playDisplayPrizeSound();

    itemImg.innerHTML = `
        <img src="${prize.image}" alt="当選景品">
    `;

    itemTxt.innerHTML = `
        <div class="prize-info">
            <h4 id="line1">景品番号 ${prize.id}</h4>
            <h4 id="line2">${prize.name}</h4>
            <h6 id="line3">${prize.description}</h6>
        </div>
    `;

    showScreen(confirmScreen);
    confirmButton.addEventListener('click', () => selectPrize(prize, isGold));
    selectedPrizeIdStack.push(prize.id);

    anime({
        targets: itemImg,
        scale: [0.5, 1],
        duration: 3500
    });

    var tl = anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
      });

      tl
      .add({
        targets: '#line1',
        translateX: [-1700, -20],
      })
      .add({
        targets: '#line2',
        translateX: [-1700, -20],
      }, '-=500')
      .add({
        targets: '#line3',
        translateX: [-1700, -20],
      }, '-=500')


}

/**
 * 景品選択処理
 * @param {Object} prize - 選択された景品
 * @param {boolean} isGold - 金の斧の場合はtrue、銀の斧の場合はfalse
 */
function selectPrize(prize, isGold) {
    playDecisionSound();
    playGetPrizeSound();

    const winScreen = isGold ? 'premiumWinScreen' : 'standardWinScreen';
    const winDisplay = document.getElementById(isGold ? 'goldWinDisplay' : 'silverWinDisplay');
    var displayNum = ('00' + prize.id ).slice( -2 );

    winDisplay.innerHTML = `
        <div id="${prize.id}" class="card">
            <div class="content">
                <h3 style="font-family: cursive;">CONGRATULATIONS!</h3>
                <h2>${displayNum}</h2>
                <br>
                <p>
                    <img src="${prize.image}" alt="当選景品">
                </p>
                <h3>${prize.name}</h3>
            </div>
        </div>
    `;

    VanillaTilt.init(document.getElementById(prize.id), {
        max: 25,
        speed: 400,
        glare: true,
    });

    showScreen(winScreen);
    enhancePrizeSelection(winDisplay);

    anime({
        targets: winDisplay,
        translateY: [-500, 0],
        rotateY: [180, 360],
        duration: 5000,
        complete: function(anime){ //callback関数
            anime.set(winDisplay, {
                rotateY: 0
            });
        }
    });

    if (isGold) {
        checkLastOnePrize();
    }
}

// ラストワン賞画面処理
function checkLastOnePrize() {
    const allSelected = (prizes.gold.filter(prize => prize.selected === false).length == 1) && (prizes.silver.filter(prize => prize.selected === false).length == 1);
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

// ラストワン賞アニメーション
document.getElementById('toLastOnePrizeButton').addEventListener('click', () => {
    playLastOneButtonSound();
    showScreen('preLastOneScreen');
    anime({
        targets: '#preLastOneScreen',
        opacity: [0, 1],
        duration: 7000,
	    fill: 'forwards'
    })

    lastOneAnimetion(
        'Thank you for waiting and participating in the new year party 2025.',
        'pre-last-one-message1',
        '.pre-last-one-message1 > span',
        3000
    );

    lastOneAnimetion(
        'This is LAST (31st) BINGO!!',
        'pre-last-one-message2',
        '.pre-last-one-message2 > span',
        3500
    );

    lastOneAnimetion(
        'So, I would lile to present LAST ONE PRIZE!!',
        'pre-last-one-message3',
        '.pre-last-one-message3 > span',
        4000
    );

    lastOneAnimetion(
        '                                                        ',
        'pre-last-one-message4',
        '.pre-last-one-message4 > span',
        8500
    );

    lastOneAnimetion(
        'Now Loading..........',
        'pre-last-one-message5',
        '.pre-last-one-message5 > span',
        9500
    );

    lastOneAnimetion(
        '[Prize Name]: ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮  All loaded.',
        'pre-last-one-message6',
        '.pre-last-one-message6 > span',
        12000
    );

    lastOneAnimetion(
        '[Prize Image]: ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮  All loaded.',
        'pre-last-one-message7',
        '.pre-last-one-message7 > span',
        12500
    );

    lastOneAnimetion(
        '[Prize Size]: ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮  All loaded.',
        'pre-last-one-message8',
        '.pre-last-one-message8 > span',
        13000
    );

    lastOneAnimetion(
        '[Prize Mfr.]: ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮  All loaded.',
        'pre-last-one-message9',
        '.pre-last-one-message9 > span',
        13500
    );

    lastOneAnimetion(
        '                                                               ',
        'pre-last-one-message10',
        '.pre-last-one-message10 > span',
        14000
    );

    lastOneAnimetion(
        'Loading Completed!!!',
        'pre-last-one-message11',
        '.pre-last-one-message11 > span',
        19500
    );

    setTimeout(() => {
        showScreen('lastOnePrizeScreen');
        createFireworks();
    }, 23500);
});

/**
 * ラストワン賞アニメーション用関数
 * @param {String} text - 表示テキスト
 * @param {String} elemId - 表示位置の要素のID
 * @param {String} target - アニメーションターゲットID/クラス
 * @param {number} timeout - アニメーション開始時間(ミリ秒)
 */
function lastOneAnimetion(text, elemId, target, timeout) {
    const msg = document.getElementById(elemId);

    setTimeout(() => {
        for(i = 0; i < text.length; i++){
            if(text[i] == ' '){
                msg.innerHTML += `<span><pre> </pre></span>`
            }else{
                msg.innerHTML += `<span>${text[i]}</span>`
            }
        }

        anime({
            targets: target,
            scale: [0, 1],
            duration: 80,
            easing: 'easeInElastic(10,1)',
            delay: anime.stagger(100)
        });
    }, timeout);
}

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
const saveLogFolder = document.getElementById('log-folder');

// 設定ボタン押下時イベント
modalButton.addEventListener('click', () => {
    playTransitionSound();
    modal.classList.add('is-open');
});

// 設定完了ボタン押下時イベント
modalComplete.addEventListener('click', () => {
    playDecisionSound();
    modal.classList.remove('is-open');
    animationLength = inputValueCheck(inputAnimationLength);
    individualFirstAnimationSetting = animationToggle.checked;
    firstAnimationLength = inputValueCheck(inputFirstAnimation);

    var fileName = saveLogFolder.value.substr(12, 12);

    window.api.send(
        "update_animation_length",
        {
            animationLength,
            individualFirstAnimationSetting,
            firstAnimationLength
        }
    );

    if(saveLogFolder.value != null){
        window.api.send(
            "readLogFile",
            {
                fileName
            }
        );
    }

    setTimeout(() => {
        window.api.on("recover", (arg) => {
            for(var i = 0; i < 75; i++){
                bingoNumbers[i] = arg.returnNumbers[i];
            }

            drawingCount = arg.returnNumbers[75];

            for(var j = 0; j < drawingCount; j++){
                calledNumbers.push(bingoNumbers[j]);
                updateHistory();
            }

            console.log(bingoNumbers, drawingCount);

            selectedId = [];
            for(var k = 0; k < 30; k++){
                if((k < 15) && (arg.returnSelcPrizes[k] == 255)){   
                    var selectedStandardPrize = prizes.silver.find(prize => prize.id === (k + 1));
                    selectedStandardPrize.selected = true;
                    selectedId.push(k + 1);
                }else if((k >= 15) && (arg.returnSelcPrizes[k] == 255)){
                    var selectedPremiumPrize = prizes.gold.find(prize => prize.id === (k + 1));
                    selectedPremiumPrize.selected = true;
                    selectedId.push(k + 1);
                }
            }
        });
    }, 500)
});

// キャンセルボタン押下時イベント
modalClose.addEventListener('click', () => {
    playCancelSound();
    modal.classList.remove('is-open');
    inputAnimationLength.value = animationLength;
});

// 初回アニメーション長設定トグル押下時イベント
animationToggle.addEventListener('change', () => {
    if(animationToggle.checked){
        inputFirstAnimation.disabled = false;
    }else{
        inputFirstAnimation.disabled = true;
    }
})

// アニメーション長の入力値チェック(1000ms~10000msに強制)
function inputValueCheck(inputValueElem) {
    if(inputValueElem.value < animationLengthMin){
        inputValueElem.value = animationLengthMin;
        return animationLengthMin;
    }else if(inputValueElem.value > animationLengthMax){
        inputValueElem.value = animationLengthMax;
        return animationLengthMax;
    }else{
        return inputValueElem.value;
    };
}

// 保存先フォルダ入力欄
$('#js-selectFolder').on('click', 'button', function () {
    $('#log-folder').click();
    return false;
});

$('#log-folder').on('change', function() {
    //選択したファイル情報を取得し変数に格納
    var file = $(this).prop('files')[0];
    //アイコンを選択中に変更
    $('#js-selectFolder').find('.choose-status').addClass('select').html('選択中');
    //未選択→選択の場合（.filenameが存在しない場合）はファイル名表示用の<div>タグを追加
    if(!($('.filename').length)){
        $('#js-selectFolder').append('<div class="foldername"></div>');
    };
    //ファイル名を表示
    $('.foldername').html('フォルダ名：' + file.name);
});