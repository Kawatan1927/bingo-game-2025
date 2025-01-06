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
  properties.save(filePath);
}

// 設定ファイルの値を更新
function updateValue(filePath, newValue){
  const properties = propertiesReader(filePath);
  properties.set('settings.animationLength', newValue);
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
  'SOLXYZ_NYPWG_2025/BINGO-GAME-2025/settings'
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
  mainWindow = new BrowserWindow({width: 1920, height: 1080, center: true, resizable: false, frame: true, fullscreen: false,
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
  setTimeout(() => {// 設定ファイルの生成との同時実行を避けるために5ms待機
    mainWindow.webContents.send(
      "settings",
      {animationLength: getSettingsValue('settings.animationLength')}
    );
  }, 5);

  // ウィンドウが閉じられたらアプリも終了
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

//レンダラープロセス側から設定値を受信して更新
ipcMain.on("update_animation_length", (event, arg) => {
  console.log('animation length updated ' + arg + '.'); //printing "update_animation_length"
  updateValue(settingsIni, arg);
});