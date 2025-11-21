/**
 * @fileoverview ビンゴゲームのメインスクリプト
 * ビンゴ番号の抽選、景品選択、画面遷移などのゲーム全体の制御を行います。
 */

/**
 * ビンゴ番号の配列（1-75までをシャッフルしたもの）
 * @type {number[]}
 */
let bingoNumbers = [];

/**
 * 既に抽選された番号の履歴
 * @type {number[]}
 */
let calledNumbers = [];

/**
 * 現在の抽選回数
 * @type {number}
 */
let drawingCount = 0;

/**
 * 現在表示中の画面ID
 * @type {string}
 */
let currentScreen = 'bingoScreen';

/**
 * 全画面表示中かどうかのフラグ
 * @type {boolean}
 */
let isFullscreen = false;

/**
 * アニメーション長（ミリ秒）
 * @type {number}
 */
let animationLength;

/**
 * 初回抽選時のみ異なるアニメーション長を使用するかのフラグ
 * @type {boolean}
 */
let individualFirstAnimationSetting;

/**
 * 初回抽選時のアニメーション長（ミリ秒）
 * @type {number}
 */
let firstAnimationLength;

/**
 * アニメーション長の最小値（ミリ秒）
 * @type {number}
 */
let animationLengthMin = 1000;

/**
 * アニメーション長の最大値（ミリ秒）
 * @type {number}
 */
let animationLengthMax = 10000;

/**
 * 保存ログフォルダのパス
 * @type {string}
 */
let saveLogFolderPath;

/**
 * 選択済み景品のID配列
 * @type {number[]}
 */
let selectedId = [];

/**
 * メインプロセスから設定ファイルの値を受信およびキャスト
 * アニメーション長などの設定値をレンダラープロセス側で受け取る
 */
window.api.on("settings", (arg) => {
    animationLength = parseInt(arg.animationLength);
    individualFirstAnimationSetting = Boolean(arg.individualFirstAnimationSetting);
    firstAnimationLength = parseInt(arg.firstAnimationLength);
});

// 音声エフェクト要素（現在は未使用だが将来的な拡張のため保持）
const drawSound = document.getElementById('drawSound');
const axeSelectSound = document.getElementById('axeSelectSound');
const resultSound = document.getElementById('resultSound');
const winSound = document.getElementById('winSound');

/**
 * 景品データのマスター定義
 * gold: プレミアム景品（金の斧）、silver: スタンダード景品（銀の斧）
 * @type {{gold: Array<{id: number, name: string, image: string, selected: boolean, description: string}>, silver: Array<{id: number, name: string, image: string, selected: boolean, description: string}>}}
 */
const prizes = {
    gold: [
        { id: 16, name: 'iPad', image: '../../assets/images/gold-prize-1.jpg', selected: false , description: '第10世代 Wi-Fiモデル(64GB)' },
        { id: 17, name: 'チェア', image: '../../assets/images/gold-prize-2.jpg', selected: false , description: 'COFO Chair Pro ブラック' },
        { id: 18, name: 'Bluetooth ヘッドホン', image: '../../assets/images/gold-prize-3.jpg', selected: false , description: 'SONY ノイズキャンセリング対応' },
        { id: 19, name: 'コーヒーメーカー', image: '../../assets/images/gold-prize-4.jpg', selected: false , description: '全自動 /ミル付き' },
        { id: 20, name: 'ゲーミングモニター', image: '../../assets/images/gold-prize-5.jpg', selected: false , description: '27型 /WQHD(2560×1440）' },
        { id: 21, name: '水なし自動調理鍋', image: '../../assets/images/gold-prize-6.jpg', selected: false , description: 'HEALSIO ホットクック' },
        { id: 22, name: '除湿機', image: '../../assets/images/gold-prize-7.jpg', selected: false , description: 'コンプレッサー方式 /木造10畳まで' },
        { id: 23, name: 'オーブンレンジ', image: '../../assets/images/gold-prize-8.jpg', selected: false , description: '日立 27L 1000W' },
        { id: 24, name: 'ワイヤレスイヤホン', image: '../../assets/images/gold-prize-9.jpg', selected: false , description: 'SONY ノイズキャンセリング対応' },
        { id: 25, name: 'Dyson 掃除機', image: '../../assets/images/gold-prize-10.jpg', selected: false , description: 'V8 Slim Fluffy Extra' },
        { id: 26, name: 'ReFaヘッドマッサージ', image: '../../assets/images/gold-prize-11.jpg', selected: false , description: 'ReFa ビューテック ヘッドスパ' },
        { id: 27, name: 'Wi-Fiルーター', image: '../../assets/images/gold-prize-12.jpg', selected: false , description: 'Wi-Fi 7(be) /IPv6対応' },
        { id: 28, name: 'ReFa シャワーヘッド', image: '../../assets/images/gold-prize-13.jpg', selected: false , description: 'ReFa FINE BUBBLE U' },
        { id: 29, name: 'Nintendo Switch Lite', image: '../../assets/images/gold-prize-14.jpg', selected: false , description: 'カラー：ターコイズ'  },
        { id: 30, name: 'ドライヤー', image: '../../assets/images/gold-prize-15.jpg', selected: false , description: 'プラズマクラスタードライヤー' },
    ],
    silver: [
        { id: 1, name: 'ヒツジのいらない枕', image: '../../assets/images/silver-prize-1.jpg', selected: false, description: '至極 テンセル枕カバー付き' },
        { id: 2, name: '日本酒', image: '../../assets/images/silver-prize-2.jpg', selected: false, description: '写真はイメージです。' },
        { id: 3, name: '布団乾燥機', image: '../../assets/images/silver-prize-3.jpg', selected: false, description: 'アイリスオーヤマ マット無タイプ' },
        { id: 4, name: 'あきたこまち 10kg', image: '../../assets/images/silver-prize-4.jpg', selected: false, description: 'あきたこまち 10kg' },
        { id: 5, name: 'ホットカーペット', image: '../../assets/images/silver-prize-5.jpg', selected: false, description: '2畳相当' },
        { id: 6, name: '加湿器', image: '../../assets/images/silver-prize-6.jpg', selected: false, description: 'ハイブリットW抗菌加湿器' },
        { id: 7, name: '電動歯ブラシ', image: '../../assets/images/silver-prize-7.jpg', selected: false, description: 'BRAUN PRO 600' },
        { id: 8, name: 'ゴルフボール 1ダース', image: '../../assets/images/silver-prize-8.jpg', selected: false, description: 'NEW PRO V1x' },
        { id: 9, name: 'プラレール レールキット', image: '../../assets/images/silver-prize-9.jpg', selected: false, description: '20のレイアウトでかっこよく走らせよう！DXレールキット' },
        { id: 10, name: 'ビールギフト', image: '../../assets/images/silver-prize-10.jpg', selected: false, description: '写真はイメージです。' },
        { id: 11, name: 'ドンジャラ ちいかわ', image: '../../assets/images/silver-prize-11.jpg', selected: false, description: 'ドンジャラNEO ちいかわ' },
        { id: 12, name: 'マッサージガン', image: '../../assets/images/silver-prize-12.jpg', selected: false, description: '筋膜リリースガン' },
        { id: 13, name: 'ReFa ヘアブラシ', image: '../../assets/images/silver-prize-13.jpg', selected: false, description: 'ReFa HEART BRUSH for SCALP' },
        { id: 14, name: 'サウナハット', image: '../../assets/images/silver-prize-14.jpg', selected: false, description: 'ごリラックス ととのいサウナカラーハット' },
        { id: 15, name: '缶詰おつまみ 3缶セット', image: '../../assets/images/silver-prize-15.jpg', selected: false, description: 'ウイスキー･ハイボールに合う缶つま' },
    ],
};

/**
 * スタック（LIFO: Last In First Out）データ構造を実装するコンストラクタ関数
 * 景品選択時の「戻る」操作をサポートするために使用します
 * @constructor
 */
function Stack() {
	this.__a = new Array();
}

/**
 * スタックに要素を追加（プッシュ）
 * @param {*} o - 追加する要素
 */
Stack.prototype.push = function(o) {
	this.__a.push(o);
}

/**
 * スタックから要素を取り出し（ポップ）
 * @returns {*|null} 取り出した要素、スタックが空の場合はnull
 */
Stack.prototype.pop = function() {
	if( this.__a.length > 0 ) {
		return this.__a.pop();
	}
	return null;
}

/**
 * スタックのサイズを取得
 * @returns {number} スタック内の要素数
 */
Stack.prototype.size = function() {
	return this.__a.length;
}

/**
 * 景品選択管理用のスタック（LIFO方式）
 * 最後に選択した景品から順に取り出すことができます
 * @type {Stack}
 */
const selectedPrizeIdStack = new Stack();

/**
 * スタックに積まれている景品を獲得済みに更新する関数
 * プレミアム景品とスタンダード景品の両方を獲得済みに設定し、
 * メインプロセスに選択済み景品情報を送信します
 */
function updateSelectedPrizes(){
    var selectedPremiumId = selectedPrizeIdStack.pop();  // 金の斧（プレミアム景品）のIDを取得
    var selectedStandardId = selectedPrizeIdStack.pop(); // 銀の斧（スタンダード景品）のIDを取得
    var selectedPremiumPrize = prizes.gold.find(prize => prize.id === selectedPremiumId);
    var selectedStandardPrize = prizes.silver.find(prize => prize.id === selectedStandardId);

    // 選択済みフラグを設定
    selectedPremiumPrize.selected = true;
    selectedStandardPrize.selected = true;

    // 選択済みIDリストに追加
    selectedId.push(selectedPremiumId);
    selectedId.push(selectedStandardId);

    // メインプロセスに選択済み景品情報を送信（ログ保存用）
    window.api.send(
        "updateSelcPrize",
        {
            selectedId
        }
    );
}

// アニメーション長設定欄の要素取得
const inputAnimationLength = document.getElementById("animationLength");
const animationToggle = document.getElementById('animationToggle');
const inputFirstAnimation = document.getElementById('firstAnimationLength');

/**
 * 全画面表示の管理
 * 全画面表示ボタンをクリックすると画面全体を使用した表示に切り替わります
 */
document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!isFullscreen) {
        document.documentElement.requestFullscreen();
    }
});

/**
 * 全画面表示状態の変更を検知
 * 全画面表示ボタンの表示/非表示を制御します
 */
document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
    document.getElementById('fullscreenBtn').style.display = isFullscreen ? 'none' : 'block';
});

/**
 * ESCキーでの全画面解除を防ぐ
 * 誤操作による全画面解除を防止します
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
    }
});

/**
 * 起動時処理
 * ビンゴ番号配列の生成と設定ファイルの値を設定欄に反映します
 * 音声ファイル読み込み完了を待つため、1.5秒の遅延を設けています
 */
window.onload = function () {
    setTimeout(() => {
    bingoNumbers = fisherYateShuffle(forRange(1, 75));  // 1-75の配列を生成してシャッフル
    console.log(bingoNumbers);

    // 設定値をUIに反映
    inputAnimationLength.value = animationLength;
    animationToggle.checked = individualFirstAnimationSetting;
    inputFirstAnimation.value = firstAnimationLength;
    if(animationToggle.checked != true){
        inputFirstAnimation.disabled = true;  // トグルOFFの場合は初回設定を無効化
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

/**
 * ビンゴ番号抽選処理
 * 抽選ボタンクリックで番号をアニメーション表示し、履歴に追加します
 * アニメーション中はボタンを無効化し、二重押しを防止します
 */
document.getElementById('drawButton').addEventListener('click', () => {
    const gameControlButtons = document.querySelectorAll('.game-control-btn');

    // 全75個の番号が出尽くしたかチェック
    if (calledNumbers.length >= 75) {
        alert('すべての番号が出ました');
        return;
    }

    // アニメーション中はボタンを無効化
    gameControlButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.5';
    });

    let number = bingoNumbers[drawingCount];
    animateNumber(number);

    // 初回のみ異なるアニメーション長を使用するか判定
    const time = (drawingCount == 0) && animationToggle.checked ? firstAnimationLength : animationLength;
    drawingCount++;

    // メインプロセスにゲーム状態を送信（ログ保存用）
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

    playDrawSound(time / 1000);  // ミリ秒を秒に変換して音声再生

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
 * ランダムな数字を高速で切り替えた後、最終的に抽選された番号を表示します
 * @param {number} targetNumber - 最終的に表示する抽選番号
 */
function animateNumber(targetNumber) {
    const currentNumber = document.getElementById('currentNumber');
    let count = 0;
    const duration = (drawingCount == 0) && animationToggle.checked ? firstAnimationLength : animationLength;
    const interval = 50; // 50ミリ秒ごとに数字を更新
    const steps = duration / interval;  // 総更新回数を計算

    const animation = setInterval(() => {
        if (count < steps) {
            // ランダムな数字（1-75）を表示
            currentNumber.textContent = Math.floor(Math.random() * 75) + 1;
            count++;
        } else {
            // アニメーション完了時に正しい番号を表示
            clearInterval(animation);
            currentNumber.textContent = targetNumber;
            calledNumbers.push(targetNumber);  // 履歴に追加
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

/**
 * 斧選択画面への移動処理
 * 決定音と斧表示音を再生し、拡大アニメーションで画面遷移します
 */
document.getElementById('toAxeButton').addEventListener('click', () => {
    playDecisionSound();
    playDisplayAxeSound();
    showScreen('axeSelectionScreen');
    anime({
        targets: '#axeSelectionScreen',
        scale: [0, 1],               // 0倍から1倍に拡大
        duration: 1200,              // 1.2秒でアニメーション
        easing: 'cubicBezier(1, 1.49, 1, 1.16)'  // バウンド効果のあるイージング
    })
});

/**
 * 結果発表ボタンクリック処理
 * "ARE YOU READY?"のメッセージ表示後、ドラムロールと共に結果を表示します
 */
document.getElementById('axeResultButton').addEventListener('click', () => {
    if (currentScreen === 'axeSelectionScreen') {
        const text = 'ARE YOU READY?';
        const msg = document.getElementById('pre-result-message');

        msg.innerHTML = ``;

        playResultButtonSound();
        showScreen('preResultScreen');
        
        // 画面全体をフェードイン
        anime({
            targets: '#preResultScreen',
            opacity: [0, 1],
            duration: 7000,
		    fill: 'forwards'
        })

        // 1.5秒後にメッセージを1文字ずつアニメーション表示
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
                delay: anime.stagger(100)  // 各文字を100msずつ遅延
            });
        }, 1500);

        // 3.5秒後にメッセージを縮小して消す
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

        // 5秒後にドラムロール開始
        setTimeout(() => {
            playResultSound(2.8);
        }, 5000);

        // 7.8秒後に結果画面を表示
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

/**
 * 紙吹雪アニメーションの共通パラメータ（canvas-confetti使用）
 * @type {Object}
 */
var confettiDefaultSettings = {
    spread: 360,         // 紙吹雪の広がり角度（360度 = 全方向）
        ticks: 50,       // アニメーションの更新回数
        gravity: 0,      // 重力効果（0 = 浮遊）
        decay: 0.94,     // 減衰率（徐々に消えていく速度）
        startVelocity: 30,  // 初速度
};

/**
 * 金の斧が当たったときの紙吹雪設定
 * @type {Object}
 */
var goldSettings = {
    colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],  // ゴールド系の色
    origin: {
        x: 0.27,  // 発射位置（画面の左寄り）
        y: 0.55
    }
};

/**
 * 銀の斧が当たったときの紙吹雪設定
 * @type {Object}
 */
var silverSettings = {
    colors: ['BDC3C9', 'E9EAEA', '979C9A', 'EEEEEE', '9EACB4'],  // シルバー系の色
    origin: {
        x: 0.73,  // 発射位置（画面の右寄り）
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
 * 斧選択結果の表示処理
 * 50%の確率で金の斧または銀の斧を選出し、タイプライター風にメッセージを表示します
 * 当選した斧側を明るく表示し、外れた斧を暗く表示します
 */
function showAxeResult() {
const goldImg = document.getElementById('goldImg');
const silverImg = document.getElementById('silverImg');

    const resultFlag = Math.random();  // 0.0-1.0のランダム値で当選判定

    showScreen('resultScreen');
    const resultMessage = document.getElementById('resultMessage');

    // 50%の確率で金か銀かを決定
    const message = resultFlag > 0.5 ?
        'プレミアム景品は銀の斧!' :
        'プレミアム景品は金の斧!';

    // タイプライター風にメッセージを1文字ずつ表示
    resultMessage.textContent = '';
    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < message.length) {
            resultMessage.textContent += message[i];
            i++;
        } else {
            clearInterval(typeInterval);
            resultSound.play();
            // メッセージ表示完了後、次の画面への遷移ボタンを表示
            setTimeout(() => {
                document.getElementById('toStandardPrizeButton').style.display = 'block';
            }, 1000);
        }
    }, 50);

    // 当選結果に応じて斧の明暗と紙吹雪を制御
    if(resultFlag > 0.5){
        // 銀の斧が当選
        goldImg.setAttribute('class', 'dark');
        silverImg.setAttribute('class', 'brite');
        // 銀色の紙吹雪を複数回発射
        setTimeout(starShoot(silverSettings), 120);
        setTimeout(starShoot(silverSettings), 200);
        setTimeout(starShoot(silverSettings), 400);
        setTimeout(starShoot(silverSettings), 600);
    }else{
        // 金の斧が当選
        goldImg.setAttribute('class', 'brite');
        silverImg.setAttribute('class', 'dark');
        // 金色の紙吹雪を複数回発射
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

/**
 * 画面遷移ボタンのイベントリスナー設定
 * DOM読み込み完了後に各ボタンにイベントリスナーを設定します
 */
document.addEventListener('DOMContentLoaded', () => {
    // スタンダード景品画面への遷移
    document.getElementById('toStandardPrizeButton').addEventListener('click', () => {
        playTransitionSound();
        showScreen('standardPrizeScreen');
        createPrizeGrid(false);
    });

    // プレミアム景品画面への遷移
    document.getElementById('toPremiumPrizeButton').addEventListener('click', () => {
        playTransitionSound();
        showScreen('premiumPrizeScreen');
        createPrizeGrid(true);
    });

    // プレミアム景品プレビュー画面への遷移
    document.getElementById('previewPremiumPrizeButton').addEventListener('click', () => {
        playTransitionSound();
        showScreen('premiumPreviewScreen');
        createPrizeGrid(true, true);
    });

    // スタンダード景品プレビュー画面への遷移
    document.getElementById('previewStandardPrizeButton').addEventListener('click', () => {
        playTransitionSound();
        showScreen('standardPreviewScreen');
        createPrizeGrid(false, true);
    });

    // スタンダード景品選択画面に戻る
    document.getElementById('backToSelectStandardItem').addEventListener('click', () => {
        playCancelSound();
        selectedPrizeIdStack.pop();  // 選択を取り消し
        showScreen('standardPrizeScreen');
        createPrizeGrid(false);
    });

    // プレミアム景品選択画面に戻る
    document.getElementById('backToSelectPremiumItem').addEventListener('click', () => {
        playCancelSound();
        selectedPrizeIdStack.pop();  // 選択を取り消し
        showScreen('premiumPrizeScreen');
        createPrizeGrid(true);
    });

    // ビンゴ画面に戻る（全ての戻るボタン共通）
    document.querySelectorAll('.back-to-bingo-btn').forEach(button => {
        button.addEventListener('click', () => {
            // スタックに景品が残っている場合は確定処理
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
 * 音声エフェクトの読み込み、景品グリッドの生成、初期画面の表示を行います
 */
function initializeScreen() {
    // 音声エフェクトのプリロード
    [drawSound, axeSelectSound, resultSound, winSound].forEach(sound => {
        sound.load();
    });

    // 景品グリッドの初期生成
    createPrizeGrid(true);   // プレミアム景品
    createPrizeGrid(false);  // スタンダード景品

    // 初期画面（ビンゴ画面）を表示
    showScreen('bingoScreen');
    
    // 全画面ボタンの表示状態を初期化
    isFullscreen = !!document.fullscreenElement;
    document.getElementById('fullscreenBtn').style.display = isFullscreen ? 'none' : 'block';
}

/**
 * 画面読み込み時の初期化処理
 */
window.addEventListener('load', initializeScreen);

/**
 * エラーハンドリング
 * グローバルエラーをキャッチしてコンソールに出力します
 */
window.addEventListener('error', (e) => {
    console.error('エラーが発生しました:', e.message);
    // エラー時のフォールバック処理を追加することができます
});

/**
 * 画面サイズ変更時の処理
 * 全画面表示時は全画面ボタンを非表示にします
 */
window.addEventListener('resize', () => {
    if (document.fullscreenElement) {
        document.getElementById('fullscreenBtn').style.display = 'none';
    }
});

/**
 * ビンゴ番号抽選時の視覚演出
 * 抽選された番号を2秒間ハイライト表示します
 * @param {number} number - 抽選された番号
 */
function enhanceDrawAnimation(number) {
    const currentNumber = document.getElementById('currentNumber');
    currentNumber.classList.add('highlight');
    setTimeout(() => currentNumber.classList.remove('highlight'), 2000);
}

/**
 * 斧選択時の視覚演出
 * 選択された斧に'selected'クラスを追加します
 * @param {HTMLElement} axe - 選択された斧の要素
 */
function enhanceAxeSelection(axe) {
    axe.classList.add('selected');
}

/**
 * 景品選択時の視覚演出
 * 選択された景品に'selected'クラスを追加します
 * @param {HTMLElement} prize - 選択された景品の要素
 */
function enhancePrizeSelection(prize) {
    prize.classList.add('selected');
}

/**
 * 斧選択のイベントリスナー設定
 * 金の斧または銀の斧をクリックした際の処理
 */
document.querySelectorAll('.axe').forEach(axe => {
    axe.addEventListener('click', () => {
        // 全ての斧の選択状態を解除
        document.querySelectorAll('.axe').forEach(a => a.classList.remove('selected'));
        selectedAxe = axe.dataset.axe;
        axeSelectSound.play();
        enhanceAxeSelection(axe);
    });
});

/**
 * 景品選択確認画面の表示処理
 * 選択された景品の詳細情報を表示し、確認ボタンを有効化します
 * @param {Object} prize - 選択された景品オブジェクト
 * @param {number} prize.id - 景品ID
 * @param {string} prize.name - 景品名
 * @param {string} prize.image - 景品画像のパス
 * @param {string} prize.description - 景品の説明
 * @param {boolean} isGold - 金の斧（プレミアム景品）の場合はtrue、銀の斧（スタンダード景品）の場合はfalse
 */
function displayConfirmWindow(prize, isGold){
    const confirmScreen = isGold ? 'premiumConfirmScreen' : 'standardConfirmScreen';
    const itemImg = document.getElementById(isGold ? 'premiumItemImg' : 'standardItemImg');
    const itemTxt = document.getElementById(isGold ? 'premiumItemTxt' : 'standardItemTxt');
    const confirmButton = document.getElementById(isGold ? 'confirmPremiumItem' : 'confirmStandardItem');

    playTransitionSound();
    playDisplayPrizeSound();

    // 景品画像を設定
    itemImg.innerHTML = `
        <img src="${prize.image}" alt="当選景品">
    `;

    // 景品情報を設定
    itemTxt.innerHTML = `
        <div class="prize-info">
            <h4 id="line1">景品番号 ${prize.id}</h4>
            <h4 id="line2">${prize.name}</h4>
            <h6 id="line3">${prize.description}</h6>
        </div>
    `;

    showScreen(confirmScreen);
    confirmButton.addEventListener('click', () => selectPrize(prize, isGold));
    selectedPrizeIdStack.push(prize.id);  // 選択履歴をスタックに追加

    // 画像の拡大アニメーション
    anime({
        targets: itemImg,
        scale: [0.5, 1],
        duration: 3500
    });

    // 景品情報のスライドインアニメーション
    var tl = anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
      });

      tl
      .add({
        targets: '#line1',
        translateX: [-1700, -20],  // 左から右へスライド
      })
      .add({
        targets: '#line2',
        translateX: [-1700, -20],
      }, '-=500')  // 前のアニメーションの500ms前から開始
      .add({
        targets: '#line3',
        translateX: [-1700, -20],
      }, '-=500')


}

/**
 * 景品選択処理
 * 選択された景品の当選画面を表示し、3Dカードエフェクトと回転アニメーションを適用します
 * @param {Object} prize - 選択された景品オブジェクト
 * @param {number} prize.id - 景品ID
 * @param {string} prize.name - 景品名
 * @param {string} prize.image - 景品画像のパス
 * @param {boolean} isGold - 金の斧（プレミアム景品）の場合はtrue、銀の斧（スタンダード景品）の場合はfalse
 */
function selectPrize(prize, isGold) {
    playDecisionSound();
    playGetPrizeSound();

    const winScreen = isGold ? 'premiumWinScreen' : 'standardWinScreen';
    const winDisplay = document.getElementById(isGold ? 'goldWinDisplay' : 'silverWinDisplay');
    var displayNum = ('00' + prize.id ).slice( -2 );  // IDを2桁表示に整形（例：1 → 01）

    // 当選カードのHTML生成
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

    // VanillaTiltで3Dチルトエフェクトを適用
    VanillaTilt.init(document.getElementById(prize.id), {
        max: 25,           // 最大傾斜角度
        speed: 400,        // アニメーション速度
        glare: true,       // グレア（光沢）エフェクトを有効化
    });

    showScreen(winScreen);
    enhancePrizeSelection(winDisplay);

    // カードの回転＋落下アニメーション
    anime({
        targets: winDisplay,
        translateY: [-500, 0],    // 上から落下
        rotateY: [180, 360],      // Y軸で1回転
        duration: 5000,
        complete: function(anime){ // アニメーション完了時のコールバック
            anime.set(winDisplay, {
                rotateY: 0  // 回転をリセット
            });
        }
    });

    // プレミアム景品の場合、ラストワン賞の条件をチェック
    if (isGold) {
        checkLastOnePrize();
    }
}

/**
 * ラストワン賞画面のチェック処理
 * 全30景品のうち29個が選択済みで残り1個の場合、ラストワン賞画面への遷移ボタンを表示します
 */
function checkLastOnePrize() {
    // 金の斧と銀の斧それぞれで未選択が1個ずつかチェック
    const allSelected = (prizes.gold.filter(prize => prize.selected === false).length == 1) && (prizes.silver.filter(prize => prize.selected === false).length == 1);
    const toLastOnePrizeButton = document.getElementById('toLastOnePrizeButton');
    const backToBingoButton = document.getElementById('backToBingoFromGoldWin');
    
    if (allSelected) {
        // ラストワン賞の条件を満たした場合
        toLastOnePrizeButton.style.display = 'block';
        backToBingoButton.style.display = 'none';
    } else {
        // まだ選択可能な景品がある場合
        toLastOnePrizeButton.style.display = 'none';
        backToBingoButton.style.display = 'block';
    }
}

/**
 * ラストワン賞アニメーション
 * 複数のメッセージを順番に表示し、最後に花火演出と共にラストワン賞画面を表示します
 */
document.getElementById('toLastOnePrizeButton').addEventListener('click', () => {
    playLastOneButtonSound();
    showScreen('preLastOneScreen');
    anime({
        targets: '#preLastOneScreen',
        opacity: [0, 1],
        duration: 7000,
	    fill: 'forwards'
    })

    // 各メッセージを指定タイミングで表示（英語メッセージによる演出）
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

    // 最終的にラストワン賞画面を表示（花火演出付き）
    setTimeout(() => {
        showScreen('lastOnePrizeScreen');
        createFireworks();
    }, 23500);
});

/**
 * ラストワン賞アニメーション用のテキスト表示関数
 * 指定されたテキストを1文字ずつアニメーション表示します
 * @param {string} text - 表示するテキスト
 * @param {string} elemId - 表示位置となる要素のID
 * @param {string} target - anime.jsでアニメーションするターゲットのセレクタ
 * @param {number} timeout - アニメーション開始までの遅延時間（ミリ秒）
 */
function lastOneAnimetion(text, elemId, target, timeout) {
    const msg = document.getElementById(elemId);

    setTimeout(() => {
        // テキストを1文字ずつspan要素に分割（スペースはpreタグで保持）
        for(i = 0; i < text.length; i++){
            if(text[i] == ' '){
                msg.innerHTML += `<span><pre> </pre></span>`
            }else{
                msg.innerHTML += `<span>${text[i]}</span>`
            }
        }

        // 各文字を順番に拡大表示
        anime({
            targets: target,
            scale: [0, 1],
            duration: 80,
            easing: 'easeInElastic(10,1)',
            delay: anime.stagger(100)  // 各文字を100msずつ遅延させて表示
        });
    }, timeout);
}

/**
 * 花火演出を作成する関数
 * ランダムな位置と色で50個の花火エフェクトを生成します
 */
function createFireworks() {
    for (let i = 0; i < 50; i++) {
        const firework = document.createElement('div');
        firework.className = 'firework';
        // ランダムな移動距離を設定（-100px ~ 100px）
        firework.style.setProperty('--tx', `${Math.random() * 200 - 100}px`);
        firework.style.setProperty('--ty', `${Math.random() * 200 - 100}px`);
        // ランダムな初期位置を設定
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${Math.random() * 100}%`;
        // ランダムな色を設定（HSL形式で360度の色相環から選択）
        firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.getElementById('lastOnePrizeScreen').appendChild(firework);
    }
}

/**
 * 設定モーダル操作用の要素取得
 */
const modal = document.querySelector('.js-modal');
const modalButton = document.querySelector('.js-modal-button');
const modalComplete = document.querySelector('.js-complete-button');
const modalClose = document.querySelector('.js-close-button');
const saveLogFolder = document.getElementById('log-folder');

/**
 * 設定ボタン押下時イベント
 * 設定モーダルを開きます
 */
modalButton.addEventListener('click', () => {
    playTransitionSound();
    modal.classList.add('is-open');
});

/**
 * 設定完了ボタン押下時イベント
 * 入力された設定値を検証・保存し、ログファイルからの復元処理も行います
 */
modalComplete.addEventListener('click', () => {
    playDecisionSound();
    modal.classList.remove('is-open');
    
    // 入力値の検証と取得
    animationLength = inputValueCheck(inputAnimationLength);
    individualFirstAnimationSetting = animationToggle.checked;
    firstAnimationLength = inputValueCheck(inputFirstAnimation);

    var fileName = saveLogFolder.value.substr(12, 12);

    // メインプロセスにアニメーション設定を送信
    window.api.send(
        "update_animation_length",
        {
            animationLength,
            individualFirstAnimationSetting,
            firstAnimationLength
        }
    );

    // ログファイルが選択されている場合は復元処理
    if(saveLogFolder.value != ""){
        window.api.send(
            "readLogFile",
            {
                fileName
            }
        );

        // ログデータを受信して状態を復元
        setTimeout(() => {
            window.api.on("recover", (arg) => {
                // ビンゴ番号配列と抽選回数を復元
                for(var i = 0; i < 75; i++){
                    bingoNumbers[i] = arg.returnNumbers[i];
                }
    
                drawingCount = arg.returnNumbers[75];
    
                // 抽選履歴を復元
                for(var j = 0; j < drawingCount; j++){
                    calledNumbers.push(bingoNumbers[j]);
                    updateHistory();
                }
    
                console.log(bingoNumbers, drawingCount);
    
                // 選択済み景品を復元
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
    }
});

/**
 * キャンセルボタン押下時イベント
 * 設定を元に戻してモーダルを閉じます
 */
modalClose.addEventListener('click', () => {
    playCancelSound();
    modal.classList.remove('is-open');
    inputAnimationLength.value = animationLength;  // 元の値に戻す
});

/**
 * 初回アニメーション長設定トグル押下時イベント
 * トグルの状態に応じて初回アニメーション長入力欄の有効/無効を切り替えます
 */
animationToggle.addEventListener('change', () => {
    if(animationToggle.checked){
        inputFirstAnimation.disabled = false;
    }else{
        inputFirstAnimation.disabled = true;
    }
})

/**
 * アニメーション長の入力値チェック関数
 * 入力値を1000ms～10000msの範囲に制限します
 * @param {HTMLInputElement} inputValueElem - チェック対象の入力要素
 * @returns {number} 検証後の値（最小値～最大値の範囲内）
 */
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

/**
 * 保存先フォルダ入力欄の制御（jQuery使用）
 * ボタンクリックで隠しファイル入力をトリガーします
 */
$('#js-selectFolder').on('click', 'button', function () {
    $('#log-folder').click();
    return false;
});

/**
 * ログフォルダ選択時の処理
 * 選択されたファイル情報を画面に表示します
 */
$('#log-folder').on('change', function() {
    // 選択したファイル情報を取得
    var file = $(this).prop('files')[0];
    // 選択状態表示を更新
    $('#js-selectFolder').find('.choose-status').addClass('select').html('選択中');
    // 初回選択時はファイル名表示用の要素を追加
    if(!($('.filename').length)){
        $('#js-selectFolder').append('<div class="foldername"></div>');
    };
    // ファイル名を表示
    $('.foldername').html('フォルダ名：' + file.name);
});