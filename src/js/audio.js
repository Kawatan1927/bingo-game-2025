// Web Audio API用のコンテキスト
let audioContext = null;
 
// 読み込む音声ソース用のオブジェクト（プロパティ名は再生時に使用）
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
 
// 音声ソース読み込み後のバッファ格納用
let audioBuffers = {};    

// 音声ソース読み込み関数
const getAudioBuffer = async (entries) => {
    const promises = [];    // 読み込み完了通知用
    const buffers = {};        // オーディオバッファ格納用
 
    entries.forEach((entry)=>{
        const promise = new Promise((resolve)=>{
            const [name, url] = entry;    //　プロパティ名、ファイルのURLに分割
            console.log(`${name}[${url}] 読み込み開始...`);
 
            // 音声ソース毎に非同期で読み込んでいく
            fetch(url)
            .then(response => response.blob())    // ファイル生データ
            .then(data => data.arrayBuffer())    // ArrayBufferとして取得
            .then(arrayBuffer => {
                // ArrayBufferを音声データに戻してオブジェクト配列に格納する
                  audioContext.decodeAudioData(arrayBuffer, function(audioBuffer){
                    buffers[name] = audioBuffer;
                    console.log(`audioBuffers["${name}"] loaded. オーディオバッファに格納完了！`);
                    resolve();    // 読み込み完了通知をpromiseに送る
                });
            });
        })
        promises.push(promise);        // 現在実行中のPromiseを格納しておく
    });
    await Promise.all(promises);    // 全ての音声ソース読み込みが完了してから
    return buffers;                    // オーディオバッファを返す
};

/**
 * 単一音声ファイル再生関数
 * @param {String} name - audioBuffersのプロパティ名
 */
function playSound(name) {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }
 
    let source = audioContext.createBufferSource();    // 再生用のノードを作成
    source.buffer = audioBuffers[name];    // オーディオバッファをノードに設定
    source.connect(audioContext.destination);    // 出力先設定
    source.start();    // 再生
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
 * 抽選ボタン押下時音声再生関数
 * @param {number} playTime - 数字めくりアニメーションの再生時間
 */
function playDrawSound(playTime) {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    let sourcePush = audioContext.createBufferSource();
    sourcePush.buffer = audioBuffers["drawButton"];
    sourcePush.connect(audioContext.destination);
 
    let sourceStart = audioContext.createBufferSource();
    sourceStart.buffer = audioBuffers["drawStart"];
    sourceStart.connect(audioContext.destination);
    sourceStart.loop = true;
    sourceStart.loopEnd = 3.9;  // ループ時に音声が途切れないように効果音の再生終了時間を設定

    let sourceStop = audioContext.createBufferSource();
    sourceStop.buffer = audioBuffers["drawStop"];
    sourceStop.connect(audioContext.destination);

    sourcePush.start();
    sourceStart.start();
    sourceStart.stop(audioContext.currentTime + playTime);
    sourceStop.start(audioContext.currentTime + playTime);
} 

/**
 * 結果発表時音声再生関数(ドラムロールのループ再生非対応)
 * @param {number} drumrollTime - ドラムロール時間 (7秒以下)
 */
function playResultSound(drumrollTime) {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    // gainノード生成 (音源の大きさが小さいので、これを使って増幅する)
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 3.4;

    let sourceDrumroll = audioContext.createBufferSource();
    sourceDrumroll.buffer = audioBuffers["drumroll"];
    sourceDrumroll.connect(gainNode).connect(audioContext.destination);

    let sourceSymbal = audioContext.createBufferSource();
    sourceSymbal.buffer = audioBuffers["cymbalCrash"];
    sourceSymbal.connect(gainNode).connect(audioContext.destination);

    sourceDrumroll.start();
    sourceDrumroll.stop(audioContext.currentTime + drumrollTime);
    sourceSymbal.start(audioContext.currentTime + drumrollTime);
}

/**
 * 景品獲得時音声再生関数
 */
function playGetPrizeSound() {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    // gainノード生成 (音源の大きさが小さいので、これを使って増幅する)
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 3.4;

    let sourceGetPrize = audioContext.createBufferSource();
    sourceGetPrize.buffer = audioBuffers["getPrize"];
    sourceGetPrize.connect(audioContext.destination);

    let sourceCheer = audioContext.createBufferSource();
    sourceCheer.buffer = audioBuffers["cheer"];
    sourceCheer.connect(gainNode).connect(audioContext.destination);

    sourceGetPrize.start();
    sourceCheer.start(audioContext.currentTime + 2.5);
}

function playDisplayAxeSound() {
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }

    let sourceAxeMove = audioContext.createBufferSource();
    sourceAxeMove.buffer = audioBuffers["axeMove"];
    sourceAxeMove.connect(audioContext.destination);
 
    let sourceAxeStop = audioContext.createBufferSource();
    sourceAxeStop.buffer = audioBuffers["axeStop"];
    sourceAxeStop.connect(audioContext.destination);

    sourceAxeMove.start();
    sourceAxeStop.start(audioContext.currentTime + 1);
}
 
// 起動時の処理
window.addEventListener("load", async ()=>{
 
    // Web Audio API用音声コンテキスト生成
    audioContext = new AudioContext();
 
    // プロパティ毎にオブジェクトにして配列として取得
    const entries = Object.entries(audioFiles);
 
    // 音声ソースを読み込んで音声バッファに格納する
    audioBuffers = await getAudioBuffer(entries);
    // alert("音声ソース読み込み完了！");
});
