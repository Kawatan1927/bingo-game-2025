/**
 * @fileoverview Electronメインプロセス
 * ビンゴゲームアプリケーションのメインプロセスを管理します。
 * ウィンドウ生成、設定ファイル管理、ログファイルの読み書き、
 * レンダラープロセスとのIPC通信を制御します。
 */

'use strict';

/**
 * Electronのコアモジュール
 * @type {Electron}
 */
const electron = require("electron");

/**
 * プロセス間通信（IPC）用モジュール
 * レンダラープロセスとメインプロセス間でメッセージをやり取りします
 * @type {IpcMain}
 */
const {ipcMain} = require("electron");

/**
 * ファイルシステム操作用の標準モジュール
 * @type {fs}
 */
const fs = require('fs');

/**
 * ファイルパス操作用の標準モジュール
 * @type {path}
 */
const path = require('path');

/**
 * INI形式の設定ファイルを読み書きするためのモジュール
 * @type {PropertiesReader}
 */
const propertiesReader = require("properties-reader");

/**
 * ログファイルの保存先ディレクトリパス
 * @type {string}
 */
let logFolder = 'C:/ProgramData/SOLXYZ_NYPWG_2025/BINGO-GAME-2025/logs'

/**
 * ビンゴ番号テーブルを保存するログファイル名（フルパス）
 * @type {string}
 */
let numLogFileName;

/**
 * 選択済み景品を保存するログファイル名（フルパス）
 * @type {string}
 */
let selcPrizeLogFileName;

/**
 * ビンゴ番号テーブル用のバッファ（76バイト：75個の番号 + 1個の抽選回数）
 * @type {ArrayBuffer}
 */
let numBuffer = new ArrayBuffer(76);

/**
 * ビンゴ番号テーブルバッファへのDataViewアクセサ
 * @type {DataView}
 */
let ndv = new DataView(numBuffer);

/**
 * 景品選択状態用のバッファ（30バイト：15個のスタンダード景品 + 15個のプレミアム景品）
 * @type {ArrayBuffer}
 */
let prizeBuffer = new ArrayBuffer(30);

/**
 * 景品選択状態バッファへのDataViewアクセサ
 * @type {DataView}
 */
let pdv = new DataView(prizeBuffer);

/**
 * ゲーム開始時刻（yyMMddhhmmss形式）
 * ログファイルのディレクトリ名やファイル名の一部として使用されます
 * @type {string}
 */
let startTimeStamp;

/**
 * ディレクトリ構造を生成する関数
 * 指定されたベースパスの下に複数のディレクトリを再帰的に作成します。
 * 既存のディレクトリは上書きせず、スキップします。
 * @param {string} basePath - ディレクトリを作成する基準パス
 * @param {string[]} directories - 作成するディレクトリのパス配列（basePath相対）
 */
function createDirectories(basePath, directories){
  directories.forEach(dir => {
    const fullPath = path.join(basePath, dir);
    if(!fs.existsSync(fullPath)){
      fs.mkdirSync(fullPath, {recursive: true});  // recursive: trueで親ディレクトリも同時作成
      console.log(`created: ${fullPath}`);
    }else{
      console.log(`already exists: ${fullPath}`);
    }
  });
}

/**
 * 設定ファイル（INI形式）を生成する関数
 * ファイルが存在しない場合のみ新規作成し、デフォルト値を設定します。
 * アプリ起動時に一度だけ実行され、設定ファイルの初期化を行います。
 * @param {string} filePath - 作成する設定ファイルのフルパス
 */
function createSettingsIni(filePath){
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if(err){
      // ファイルが存在しない場合は空ファイルを作成
      fs.writeFile(filePath, '', (err) => {
        if(err) throw err;
        console.log('File created successfully.');
      });
      setDefaultValue(filePath);  // デフォルト値を書き込み
    }else{
      console.log('File already exists.');
    }
  });
}

/**
 * 設定ファイルにデフォルト値を書き込む関数
 * 新規作成された設定ファイルに初期設定値を設定します。
 * @param {string} filePath - 設定ファイルのフルパス
 */
function setDefaultValue(filePath){
  const properties = propertiesReader(filePath);
  properties.set('settings.animationLength', '2500');                         // 通常アニメーション長: 2.5秒
  properties.set('settings.individualFirstAnimationSetting', 'true');         // 初回アニメーション長を個別設定: 有効
  properties.set('settings.firstAnimationLength', '5000');                    // 初回アニメーション長: 5秒
  properties.save(filePath);
}

/**
 * 設定ファイルの値を更新する関数
 * レンダラープロセスから受信した新しい設定値を設定ファイルに保存します。
 * @param {string} filePath - 設定ファイルのフルパス
 * @param {Object} newValue - 新しい設定値を含むオブジェクト
 * @param {string} newValue.animationLength - 通常時のアニメーション長（ミリ秒）
 * @param {boolean} newValue.individualFirstAnimationSetting - 初回アニメーション長を個別に設定するか
 * @param {string} newValue.firstAnimationLength - 初回アニメーション長（ミリ秒）
 */
function updateValue(filePath, newValue){
  const properties = propertiesReader(filePath);
  properties.set('settings.animationLength', newValue.animationLength);
  properties.set('settings.individualFirstAnimationSetting', newValue.individualFirstAnimationSetting);
  properties.set('settings.firstAnimationLength', newValue.firstAnimationLength);
  properties.save(filePath);
}

/**
 * 設定ファイルから特定の設定値を取得する関数
 * セクション名とキー名を指定して設定値を読み込みます。
 * @param {string} sectionAndKey - 'セクション名.キー名' 形式の文字列（例: 'settings.animationLength'）
 * @returns {string} 設定値
 */
function getSettingsValue(sectionAndKey){
  const properties = propertiesReader(settingsIni);
  return(properties.get(sectionAndKey));
}

/**
 * ディレクトリ構造のベースパス
 * Windowsのプログラムデータディレクトリを使用
 * @type {string}
 */
const basePath = 'C:/ProgramData';

/**
 * アプリケーション起動時に作成するディレクトリのリスト
 * 設定ファイルとログファイルの保存先を含みます
 * @type {string[]}
 */
const directories = [
  'SOLXYZ_NYPWG_2025/BINGO-GAME-2025',
  'SOLXYZ_NYPWG_2025/BINGO-GAME-2025/settings',
  'SOLXYZ_NYPWG_2025/BINGO-GAME-2025/logs'
];

/**
 * 設定ファイルのフルパス
 * アニメーション設定などのアプリケーション設定を保存します
 * @type {string}
 */
const settingsIni = 'C:/ProgramData/SOLXYZ_NYPWG_2025/BINGO-GAME-2025/settings/setting.ini';

/**
 * Electronアプリケーション制御モジュール
 * アプリのライフサイクル管理を行います
 * @type {App}
 */
const app = electron.app;

/**
 * Electronウィンドウ作成モジュール
 * アプリケーションウィンドウの生成と管理を行います
 * @type {BrowserWindow}
 */
const BrowserWindow = electron.BrowserWindow;

/**
 * メインウィンドウのインスタンス
 * ガベージコレクション対策でグローバルスコープに保持します
 * @type {BrowserWindow|null}
 */
let mainWindow;

/**
 * 全てのウィンドウが閉じられた時のイベントハンドラ
 * macOS以外のプラットフォームではアプリケーションを終了します
 * （macOSではウィンドウが閉じてもアプリは終了しないのが慣例）
 */
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// アプリケーション起動時の初期化処理

// ディレクトリ構造を生成（設定ファイルとログファイルの保存先）
createDirectories(basePath, directories);

// 設定ファイルを生成（存在しない場合のみ）
createSettingsIni(settingsIni);

/**
 * Electronの初期化完了後に実行されるイベントハンドラ
 * メインウィンドウの生成、設定値の読み込みと送信を行います
 */
app.on('ready', function() {
  // メインウィンドウの生成と設定
  mainWindow = new BrowserWindow({
    width: 1920,                    // ウィンドウ幅（フルHD想定）
    height: 1080,                   // ウィンドウ高さ（フルHD想定）
    center: true,                   // 画面中央に配置
    resizable: false,               // サイズ変更を無効化
    frame: true,                    // ウィンドウフレームを表示
    fullscreen: false,              // 起動時は全画面表示しない
    autoHideMenuBar: true,          // メニューバーを自動的に隠す
    webPreferences: {
      nodeIntegration: false,       // Node.js統合を無効化（セキュリティ対策）
      contextIsolation: true,       // コンテキスト分離を有効化（セキュリティ対策）
      preload: __dirname + '/src/js/preload.js'  // プリロードスクリプトのパス
    }
  });
  
  // HTMLファイルを読み込み
  mainWindow.loadURL('file://' + __dirname + '/src/html/bingo.html');

  // デベロッパーツールの表示（開発時のデバッグ用）
  // 必要に応じてコメントアウトを外してください
  //mainWindow.webContents.openDevTools();

  // 設定ファイルから読み込んだ設定値をレンダラープロセスに送信
  // 300ms待機してから送信（設定ファイルの生成処理との競合を避けるため）
  setTimeout(() => {
    mainWindow.webContents.send(
      "settings",
      {
        animationLength: getSettingsValue('settings.animationLength'),
        individualFirstAnimationSetting: getSettingsValue('settings.individualFirstAnimationSetting'),
        firstAnimationLength: getSettingsValue('settings.firstAnimationLength')
      }
    );
  }, 300);

  /**
   * ウィンドウが閉じられた時のイベントハンドラ
   * メインウィンドウの参照をクリアしてガベージコレクションを促進します
   */
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

/**
 * アニメーション設定値更新のIPCハンドラ
 * レンダラープロセスから新しい設定値を受信し、設定ファイルを更新します
 */
ipcMain.on("update_animation_length", (event, arg) => {
  console.log('animation length updated ' + arg + '.');
  updateValue(settingsIni, arg);
});

/**
 * ゲーム開始のIPCハンドラ
 * 初回抽選時にログファイル用のディレクトリとファイルを生成し、
 * ビンゴ番号テーブルと景品選択状態の初期データを保存します
 * @param {Object} arg - レンダラープロセスから送信されるデータ
 * @param {number[]} arg.bingoNumbers - シャッフルされたビンゴ番号配列（1-75）
 * @param {number} arg.drawingCount - 抽選回数（初回は1）
 */
ipcMain.on("gameStart", (event, arg) => {
  const date = new Date;
  startTimeStamp = getFormattedDate(date, 'yyMMddhhmmss');  // ログ識別用のタイムスタンプ生成

  // ゲームセッション用のログディレクトリを作成
  createDirectories(logFolder, [startTimeStamp]);

  console.log(startTimeStamp);
  console.log(arg);

  // ログファイルのパスを生成してファイルを作成（100ms待機後）
  setTimeout(() => {
    numLogFileName = logFolder + '/' + startTimeStamp + '/' + startTimeStamp +'_num_table.bingolog';
    selcPrizeLogFileName = logFolder + '/' + startTimeStamp + '/' + startTimeStamp + '_selc_prizes.bingolog';
    createLogFile(numLogFileName);
    createLogFile(selcPrizeLogFileName);
  }, 100);
  
  // 初期データを書き込み（200ms待機後）
  setTimeout(() => {
    writeNumLogF(arg.bingoNumbers, arg.drawingCount);  // ビンゴ番号テーブルを保存
    prizeLogInit();                                     // 景品選択状態を初期化
  }, 200);
});

/**
 * 抽選回数更新のIPCハンドラ
 * 2回目以降の抽選時に呼び出され、ビンゴ番号テーブルと抽選回数を更新します
 * @param {Object} arg - レンダラープロセスから送信されるデータ
 * @param {number[]} arg.bingoNumbers - ビンゴ番号配列
 * @param {number} arg.drawingCount - 現在の抽選回数
 */
ipcMain.on("countUpdate", (event, arg) => {
  writeNumLogF(arg.bingoNumbers, arg.drawingCount);
})

/**
 * 景品選択状態更新のIPCハンドラ
 * 景品が選択された際に呼び出され、選択済み景品情報をログファイルに保存します
 * @param {Object} arg - レンダラープロセスから送信されるデータ
 * @param {number[]} arg.selectedId - 選択済み景品のID配列
 */
ipcMain.on("updateSelcPrize", (event, arg) => {
  writePrizeLog(arg.selectedId);
})

/**
 * 日時データをフォーマットする関数
 * 指定されたフォーマット文字列に従って日付をフォーマットします
 * @param {Date} date - フォーマットする日時オブジェクト
 * @param {string} format - フォーマット文字列（例: 'yyMMddhhmmss'）
 *                          y:年, M:月, d:日, h:時, m:分, s:秒
 *                          文字数により桁数が決定（MM=2桁の月、M=1桁の月など）
 * @returns {string} フォーマットされた日時文字列
 * @example
 * getFormattedDate(new Date('2025-01-18 14:30:45'), 'yyMMddhhmmss')
 * // returns '250118143045'
 */
const getFormattedDate = (date, format) => {
  const symbol = {
    M: date.getMonth() + 1,  // 月（0-11を1-12に変換）
    d: date.getDate(),       // 日
    h: date.getHours(),      // 時
    m: date.getMinutes(),    // 分
    s: date.getSeconds(),    // 秒
  };

  // M, d, h, m, s を対応する値に置換（2文字以上の場合は0埋め）
  const formatted = format.replace(/(M+|d+|h+|m+|s+)/g, (v) =>
    ((v.length > 1 ? '0' : '') + symbol[v.slice(-1)]).slice(-2)
  );

  // 年（y）を対応する値に置換（文字数分の下位桁を取得）
  return formatted.replace(/(y+)/g, (v) => date.getFullYear().toString().slice(-v.length));
};

/**
 * ログファイルを生成する関数
 * ファイルが存在しない場合のみ空のログファイルを新規作成します
 * @param {string} filePath - 作成するログファイルのフルパス
 */
function createLogFile(filePath){
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if(err){
      // ファイルが存在しない場合は空ファイルを作成
      fs.writeFile(filePath, '', (err) => {
        if(err) throw err;
        console.log('File created successfully.');
      });
    }else{
      console.log('File already exists.');
    }
  });
}

/**
 * ビンゴ番号テーブルと抽選回数をログファイルに保存する関数
 * バイナリ形式で76バイトのデータを保存します（75個の番号 + 1個の抽選回数）
 * @param {number[]} numbers - ビンゴ番号の配列（1-75の数値が格納）
 * @param {number} count - 現在の抽選回数
 */
function writeNumLogF(numbers, count){

  // 0~74バイト目：ビンゴ番号テーブル（75個の番号）を格納
  for(var i = 0; i < 75; i++){
    ndv.setUint8(i, numbers[i]);
  }

  // 75バイト目：抽選回数を格納
  ndv.setUint8(75, count);

  // バッファの内容をファイルに書き込み
  fs.writeFile(numLogFileName, ndv, function (err) {
    console.log('Error writing to numLogFileName:', err);
  });
}

/**
 * 景品選択状態ログの初期化関数
 * 30個の景品全てを「未選択」状態（0）で初期化します
 * ゲーム開始時に一度だけ実行されます
 */
function prizeLogInit(){
  // 全30バイトを0（未選択）で初期化
  for(var i = 0; i < 30; i++){
    pdv.setUint8(i, 0);
  }

  // 初期化されたバッファをファイルに書き込み
  fs.writeFile(selcPrizeLogFileName, pdv, function (err) {
    console.log('Error writing to prize log file:', err);
  })
}

/**
 * 景品選択状態ログの更新関数
 * 選択された景品のIDを受け取り、該当バイトを255（選択済み）に更新します
 * @param {number[]} selectedId - 選択済み景品のID配列（1から始まるID）
 */
function writePrizeLog(selectedId){
  // 選択された景品のバイトを255（選択済み）に設定
  // IDは1始まりなので、配列インデックス用に-1する
  for(var i = 0; i < selectedId.length; i++){
    pdv.setUint8(selectedId[i] - 1, 255);
  }

  // 更新されたバッファをファイルに書き込み
  fs.writeFile(selcPrizeLogFileName, pdv, function (err) {
    console.log('Error writing to prize log file:', selcPrizeLogFileName, err);
  })
}

/**
 * ログファイル読み込みのIPCハンドラ
 * 過去のゲームセッションのログファイルを読み込み、
 * ビンゴ番号テーブルと景品選択状態をレンダラープロセスに送信します。
 * ゲームの途中状態を復元する際に使用します。
 * @param {Object} arg - レンダラープロセスから送信されるデータ
 * @param {string} arg.fileName - 読み込むログファイルのタイムスタンプ（yyMMddhhmmss形式）
 */
ipcMain.on("readLogFile", (event, arg) => {
  startTimeStamp = arg.fileName;
  
  // ログファイルのパスを構築
  numLogFileName = logFolder + '/' + startTimeStamp + '/' + startTimeStamp + '_num_table.bingolog';
  selcPrizeLogFileName = logFolder + '/' + startTimeStamp + '/' + startTimeStamp + '_selc_prizes.bingolog';

  const returnNumbers = [];       // 読み込んだビンゴ番号テーブル用配列
  const returnSelcPrizes = [];    // 読み込んだ景品選択状態用配列

  // ビンゴ番号テーブルログファイルを読み込み
  fs.readFile(numLogFileName, function(err, data) {
    for(var i = 0; i < 76; i++){
      numBuffer[i] = data[i];      // バッファに復元
      returnNumbers[i] = data[i];  // 返却用配列にコピー
    }

    console.log(ndv);
    console.log(returnNumbers);
  });

  // 景品選択状態ログファイルを読み込み
  fs.readFile(selcPrizeLogFileName, function(err, data) {
    for(var i = 0; i < 30; i++){
      prizeBuffer[i] = data[i];         // バッファに復元
      returnSelcPrizes[i] = data[i];    // 返却用配列にコピー
    }

    console.log(pdv);
    console.log(returnSelcPrizes);
  });

  // ファイル読み込み完了を待ってからレンダラープロセスに送信（1秒待機）
  setTimeout(() => {
    mainWindow.webContents.send(
    "recover",
    {
      returnNumbers,      // ビンゴ番号テーブルと抽選回数（76バイト）
      returnSelcPrizes    // 景品選択状態（30バイト）
    }
  )
  }, 1000)
  
});
