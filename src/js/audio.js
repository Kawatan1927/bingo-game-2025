/**
 * @fileoverview Web Audio APIを使用した音声再生管理
 * ビンゴゲームで使用する効果音の読み込みと再生を制御します。
 */

/**
 * Web Audio API用のオーディオコンテキスト
 * @type {AudioContext|null}
 */
let audioContext = null;
 
/**
 * 読み込む音声ソースファイルのパスマッピング
 * プロパティ名は再生時に使用するキー名として機能します
 * @type {Object<string, string>}
 */
const audioFiles = {
    decisionButton: "../../sounds/Button_SE8.mp3",
    cancelButton: "../../sounds/Button_SE7.mp3",
    transitionButton: "../../sounds/Button_SE9.mp3",
    resultButton: "../../sounds/Button_SE_10.mp3",
    lastOneButton: "../../sounds/Button_SE_11.mp3",
    drawButton: "../../sounds/Button_SE4.mp3",
    drawStart: "../../sounds/Digital_Count_SE1.mp3",
    drawStop: "../../sounds/Digital_Count_Stop_SE1.mp3",
    drumroll: "../../sounds/Drumroll_Only_SE.mp3",
    cymbalCrash: "../../sounds/Cymbal_Crash_SE2.mp3",
    cheer: "../../sounds/Cheer_SE.mp3",
    getPrize: "../../sounds/Get_Prize_SE.mp3",
    axeMove: "../../sounds/Axe_Move_SE.mp3",
    axeStop: "../../sounds/Axe_Move_Stop_SE.mp3",
    displayPrize: "../../sounds/Display_Prize_SE.mp3",
    displayMessage: "../../sounds/Display_Message_SE.mp3"
};
 
/**
 * 音声ソース読み込み後のオーディオバッファ格納用オブジェクト
 * @type {Object<string, AudioBuffer>}
 */
let audioBuffers = {};    

/**
 * 音声ファイルを非同期で読み込み、AudioBufferに変換する関数
 * 全ての音声ファイルを並列で読み込み、完了後にバッファを返します
 * @param {Array<Array<string>>} entries - [キー名, ファイルパス]の配列
 * @returns {Promise<Object<string, AudioBuffer>>} 読み込み完了したオーディオバッファのオブジェクト
 */
const getAudioBuffer = async (entries) => {
    const promises = [];    // 各音声ファイルの読み込み完了通知用Promise配列
    const buffers = {};     // 読み込んだオーディオバッファの格納用オブジェクト
 
    entries.forEach((entry)=>{
        const promise = new Promise((resolve)=>{
            const [name, url] = entry;    // プロパティ名とファイルのURLに分割
            console.log(`${name}[${url}] 読み込み開始...`);
 
            // 音声ファイルをfetchで取得し、AudioBufferに変換
            fetch(url)
            .then(response => response.blob())         // レスポンスをBlobとして取得
            .then(data => data.arrayBuffer())          // BlobをArrayBufferに変換
            .then(arrayBuffer => {
                // ArrayBufferを音声データ（AudioBuffer）にデコードしてバッファに格納
                  audioContext.decodeAudioData(arrayBuffer, function(audioBuffer){
                    buffers[name] = audioBuffer;
                    console.log(`audioBuffers["${name}"] loaded. オーディオバッファに格納完了！`);
                    resolve();    // このファイルの読み込み完了を通知
                });
            });
        })
        promises.push(promise);        // 実行中のPromiseを配列に追加
    });
    await Promise.all(promises);    // 全ての音声ファイルの読み込みが完了するまで待機
    return buffers;                 // 読み込み完了したオーディオバッファを返す
};

/**
 * 単一音声ファイルを再生する関数
 * @param {string} name - audioBuffersオブジェクトに格納されているキー名
 */
function playSound(name) {
    // AudioContextが停止状態の場合は再開する（ブラウザのポリシー対応）
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }
 
    let source = audioContext.createBufferSource();    // 音声再生用のソースノードを作成
    source.buffer = audioBuffers[name];                // 再生する音声バッファを設定
    source.connect(audioContext.destination);          // 出力先（スピーカー）に接続
    source.start();                                    // 音声再生を開始
};

/**
 * 結果発表ボタン押下時音声再生関数
 */
function playResultButtonSound() {
    playSound("resultButton");
}

/**
 * 文字列表示音声再生関数
 * @param {number} playTime - 再生秒数
 */
function playDisplayMessageSound(playTime) {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    let sourceDisplayMessage = audioContext.createBufferSource();
    sourceDisplayMessage.buffer = audioBuffers["displayMessage"];
    sourceDisplayMessage.connect(audioContext.destination);
    sourceDisplayMessage.loop = true;

    sourceDisplayMessage.start(audioContext.currentTime);
    sourceDisplayMessage.stop(audioContext.currentTime + playTime);
}

/**
 * 景品表示時音声再生関数
 */
function playDisplayPrizeSound() {
    playSound("displayPrize");
}

/**
 * 景品選択確定ボタン押下時音声再生関数
 */
function playDecisionSound() {
    playSound("decisionButton");
}

/**
 * 画面遷移ボタン押下時音声再生関数
 */
function playTransitionSound() {
    playSound("transitionButton");
}

/**
 * 戻る/キャンセルボタン押下時音声再生関数
 */
function playCancelSound() {
    playSound("cancelButton");
}

/**
 * ラストワン賞ボタン押下時音声再生関数
 */
function playLastOneButtonSound() {
    playSound("lastOneButton");
}
 
/**
 * 抽選ボタン押下時の音声再生関数
 * ボタン押下音、数字めくり音（ループ）、停止音を順番に再生します
 * @param {number} playTime - 数字めくりアニメーションの再生時間（秒）
 */
function playDrawSound(playTime) {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    // ボタン押下音
    let sourcePush = audioContext.createBufferSource();
    sourcePush.buffer = audioBuffers["drawButton"];
    sourcePush.connect(audioContext.destination);
 
    // 数字めくり音（ループ再生）
    let sourceStart = audioContext.createBufferSource();
    sourceStart.buffer = audioBuffers["drawStart"];
    sourceStart.connect(audioContext.destination);
    sourceStart.loop = true;
    sourceStart.loopEnd = 3.9;  // ループ時に音声が途切れないよう再生終了時間を調整

    // 停止音
    let sourceStop = audioContext.createBufferSource();
    sourceStop.buffer = audioBuffers["drawStop"];
    sourceStop.connect(audioContext.destination);

    // 各音声を適切なタイミングで再生
    sourcePush.start();                                   // ボタン音を即座に再生
    sourceStart.start();                                  // めくり音を開始
    sourceStart.stop(audioContext.currentTime + playTime); // 指定時間後にめくり音を停止
    sourceStop.start(audioContext.currentTime + playTime); // めくり音停止と同時に停止音を再生
} 

/**
 * 結果発表時の音声再生関数
 * ドラムロール音と、その後にシンバル音を再生します
 * （注：ドラムロールのループ再生には非対応。drumrollTimeは7秒以下を推奨）
 * @param {number} drumrollTime - ドラムロール音の再生時間（秒）。推奨値は7秒以下
 */
function playResultSound(drumrollTime) {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    // ゲインノードを生成して音量を増幅（元音源の音量が小さいため）
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 3.4;  // 音量を3.4倍に増幅

    // ドラムロール音
    let sourceDrumroll = audioContext.createBufferSource();
    sourceDrumroll.buffer = audioBuffers["drumroll"];
    sourceDrumroll.connect(gainNode).connect(audioContext.destination);

    // シンバルクラッシュ音
    let sourceSymbal = audioContext.createBufferSource();
    sourceSymbal.buffer = audioBuffers["cymbalCrash"];
    sourceSymbal.connect(gainNode).connect(audioContext.destination);

    // ドラムロールを開始し、指定時間後にシンバル音を再生
    sourceDrumroll.start();
    sourceDrumroll.stop(audioContext.currentTime + drumrollTime);
    sourceSymbal.start(audioContext.currentTime + drumrollTime);
}

/**
 * 景品獲得時の音声再生関数
 * 獲得音の後、2.5秒後に歓声音を再生します
 */
function playGetPrizeSound() {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    // ゲインノードを生成して歓声音の音量を増幅
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 3.4;  // 音量を3.4倍に増幅

    // 景品獲得音
    let sourceGetPrize = audioContext.createBufferSource();
    sourceGetPrize.buffer = audioBuffers["getPrize"];
    sourceGetPrize.connect(audioContext.destination);

    // 歓声音
    let sourceCheer = audioContext.createBufferSource();
    sourceCheer.buffer = audioBuffers["cheer"];
    sourceCheer.connect(gainNode).connect(audioContext.destination);

    // 獲得音を即座に再生し、2.5秒後に歓声音を再生
    sourceGetPrize.start();
    sourceCheer.start(audioContext.currentTime + 2.5);
}

/**
 * 斧表示時の音声再生関数
 * 斧が動く音と、1秒後に停止音を再生します
 */
function playDisplayAxeSound() {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    // 斧移動音
    let sourceAxeMove = audioContext.createBufferSource();
    sourceAxeMove.buffer = audioBuffers["axeMove"];
    sourceAxeMove.connect(audioContext.destination);
 
    // 斧停止音
    let sourceAxeStop = audioContext.createBufferSource();
    sourceAxeStop.buffer = audioBuffers["axeStop"];
    sourceAxeStop.connect(audioContext.destination);

    // 移動音を即座に再生し、1秒後に停止音を再生
    sourceAxeMove.start();
    sourceAxeStop.start(audioContext.currentTime + 1);
}
 
/**
 * ページ読み込み時の初期化処理
 * AudioContextを生成し、全ての音声ファイルを非同期で読み込みます
 */
window.addEventListener("load", async ()=>{
 
    // Web Audio API用のAudioContextを生成
    audioContext = new AudioContext();
 
    // audioFilesオブジェクトを[キー, パス]の配列に変換
    const entries = Object.entries(audioFiles);
 
    // 全ての音声ファイルを読み込み、audioBuffersに格納
    audioBuffers = await getAudioBuffer(entries);
    // デバッグ用: alert("音声ソース読み込み完了！");
});
