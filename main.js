'use strict';

// Electronのモジュール
const electron = require("electron");

// IPC通信用モジュール
const {ipcMain} = require("electron");

// fsモジュール
const fs = require('fs');
const path = require('path');

// properties-readerモジュール
const propertiesReader = require("properties-reader");

// ログ保存先フォルダパス
let logFolder = 'C:/ProgramData/SOLXYZ_NYPWG_2025/BINGO-GAME-2025/logs'

// ログファイル名
let numLogFileName;
let selcPrizeLogFileName;

// ログ保存用バッファ
let numBuffer = new ArrayBuffer(76);
let ndv = new DataView(numBuffer);
let prizeBuffer = new ArrayBuffer(30);
let pdv = new DataView(prizeBuffer);

// ゲーム開始時刻
let startTimeStamp;

// ディレクトリ生成関数
function createDirectories(basePath, directories){
  directories.forEach(dir => {
    const fullPath = path.join(basePath, dir);
    if(!fs.existsSync(fullPath)){
      fs.mkdirSync(fullPath, {recursive: true});
      console.log(`created: ${fullPath}`);
    }else{
      console.log(`already exists: ${fullPath}`);
    }
  });
}

// 設定ファイル生成関数(アプリ起動時に存在しない場合にデフォルト値で生成)
function createSettingsIni(filePath){
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if(err){
      fs.writeFile(filePath, '', (err) => {
        if(err) throw err;
        console.log('File created successfully.');
      });
      setDefaultValue(filePath);
    }else{
      console.log('File already exists.');
    }
  });
}

// 設定ファイルにデフォルト値を設定
function setDefaultValue(filePath){
  const properties = propertiesReader(filePath);
  properties.set('settings.animationLength', '2500');
  properties.set('settings.individualFirstAnimationSetting', 'true');
  properties.set('settings.firstAnimationLength', '5000');
  properties.save(filePath);
}

// 設定ファイルの値を更新
function updateValue(filePath, newValue){
  const properties = propertiesReader(filePath);
  properties.set('settings.animationLength', newValue.animationLength);
  properties.set('settings.individualFirstAnimationSetting', newValue.individualFirstAnimationSetting);
  properties.set('settings.firstAnimationLength', newValue.firstAnimationLength);
  properties.save(filePath);
}


// 設定ファイルから設定値取得
function getSettingsValue(sectionAndKey){
  const properties = propertiesReader(settingsIni);
  return(properties.get(sectionAndKey));
}

// ディレクトリ構造のベースパス
const basePath = 'C:/ProgramData';

// 作成するディレクトリのリスト
const directories = [
  'SOLXYZ_NYPWG_2025/BINGO-GAME-2025',
  'SOLXYZ_NYPWG_2025/BINGO-GAME-2025/settings',
  'SOLXYZ_NYPWG_2025/BINGO-GAME-2025/logs'
];

// 設定ファイル名
const settingsIni = 'C:/ProgramData/SOLXYZ_NYPWG_2025/BINGO-GAME-2025/settings/setting.ini';

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// ディレクトリ構造を生成(各種設定保存、ゲーム進捗ログ保存に使用予定)
createDirectories(basePath, directories);

// 設定ファイル生成
createSettingsIni(settingsIni);

// Electronの初期化完了後に実行
app.on('ready', function() {
  // メイン画面の表示。ウィンドウの幅、高さを指定できる
  mainWindow = new BrowserWindow({width: 1920, height: 1080, center: true, resizable: false, frame: true, fullscreen: false, autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js'
    }
  });
  mainWindow.loadURL('file://' + __dirname + '/bingo.html');

  // デベロッパーツールの表示(必要だったらコメントアウトを外してください)
  //mainWindow.webContents.openDevTools();

  // 設定ファイルに記載の設定をレンダラープロセスへ送信
  setTimeout(() => {// 設定ファイルの生成との同時実行を避けるために100ms待機
    mainWindow.webContents.send(
      "settings",
      {
        animationLength: getSettingsValue('settings.animationLength'),
        individualFirstAnimationSetting: getSettingsValue('settings.individualFirstAnimationSetting'),
        firstAnimationLength: getSettingsValue('settings.firstAnimationLength')
      }
    );
  }, 300);

  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

// レンダラープロセス側から設定値を受信して更新
ipcMain.on("update_animation_length", (event, arg) => {
  console.log('animation length updated ' + arg + '.'); //printing "update_animation_length"
  updateValue(settingsIni, arg);
});

// レンダラープロセス側からゲーム開始時刻を受信する
ipcMain.on("gameStart", (event, arg) => {
  const date = new Date;
  startTimeStamp = getFormattedDate(date, 'yyMMddhhmmss');

  createDirectories(logFolder, [startTimeStamp]);

  console.log(startTimeStamp);
  console.log(arg);

  setTimeout(() => {
    numLogFileName = logFolder + '/' + startTimeStamp + '/' + startTimeStamp +'_num_table.bingolog';
    selcPrizeLogFileName = logFolder + '/' + startTimeStamp + '/' + startTimeStamp + '_selc_prizes.bingolog';
    createLogFile(numLogFileName);
    createLogFile(selcPrizeLogFileName);
  }, 100);
  
  setTimeout(() => {
    writeNumLogF(arg.bingoNumbers, arg.drawingCount);
    prizeLogInit();
  }, 200);
});

//  レンダラープロセス側から2回目以降の抽選開始フラグを受信する
ipcMain.on("countUpdate", (event, arg) => {
  writeNumLogF(arg.bingoNumbers, arg.drawingCount);
})

// レンダラープロセス側から景品獲得状況を受信する
ipcMain.on("updateSelcPrize", (event, arg) => {
  writePrizeLog(arg.selectedId);
})

// 日時データフォーマット関数
const getFormattedDate = (date, format) => {
  const symbol = {
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
  };

  const formatted = format.replace(/(M+|d+|h+|m+|s+)/g, (v) =>
    ((v.length > 1 ? '0' : '') + symbol[v.slice(-1)]).slice(-2)
  );

  return formatted.replace(/(y+)/g, (v) => date.getFullYear().toString().slice(-v.length));
};

// ログファイル生成関数
function createLogFile(filePath){
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if(err){
      fs.writeFile(filePath, '', (err) => {
        if(err) throw err;
        console.log('File created successfully.');
      });
    }else{
      console.log('File already exists.');
    }
  });
}

// 番号ログ保存関数(初回)
function writeNumLogF(numbers, count){

  // 0~74Byte目にビンゴ番号テーブルを格納
  for(var i = 0; i < 75; i++){
    ndv.setUint8(i, numbers[i]);
  }

  // 75Byte目に抽選カウントを格納
  ndv.setUint8(75, count);

  fs.writeFile(numLogFileName, ndv, function (err) {
    console.log('Error writing to numLogFileName:', err);
  });
}

// 景品獲得ログ初期化関数
function prizeLogInit(){
  for(var i = 0; i < 30; i++){
    pdv.setUint8(i, 0);
  }

  fs.writeFile(selcPrizeLogFileName, pdv, function (err) {
    console.log('Error writing to prize log file:', err);
  })
}

// 景品獲得ログ更新関数
function writePrizeLog(selectedId){
  for(var i = 0; i < selectedId.length; i++){
    pdv.setUint8(selectedId[i] - 1, 255);
  }

  fs.writeFile(selcPrizeLogFileName, pdv, function (err) {
    console.log('Error writing to prize log file:', selcPrizeLogFileName, err);
  })
}

// レンダラープロセス側からログファイル名を受信する
ipcMain.on("readLogFile", (event, arg) => {
  startTimeStamp = arg.fileName;
  numLogFileName = logFolder + '/' + startTimeStamp + '/' + startTimeStamp + '_num_table.bingolog';
  selcPrizeLogFileName = logFolder + '/' + startTimeStamp + '/' + startTimeStamp + '_selc_prizes.bingolog';

  const returnNumbers = [];
  const returnSelcPrizes = [];

  fs.readFile(numLogFileName, function(err, data) {
    for(var i = 0; i < 76; i++){
      numBuffer[i] = data[i];
      returnNumbers[i] = data[i];
    }

    console.log(ndv);
    console.log(returnNumbers);
  });

  fs.readFile(selcPrizeLogFileName, function(err, data) {
    for(var i = 0; i < 30; i++){
      prizeBuffer[i] = data[i];
      returnSelcPrizes[i] = data[i];
    }

    console.log(pdv);
    console.log(returnSelcPrizes);
  });

  setTimeout(() => {
    mainWindow.webContents.send(
    "recover",
    {
      returnNumbers,
      returnSelcPrizes
    }
  )
  }, 1000)
  
});
