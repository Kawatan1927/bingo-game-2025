<div id="top"></div>

<!-- omit in toc -->
## 目次

1. [プロジェクト名](#プロジェクト名)
2. [プロジェクトについて](#プロジェクトについて)
3. [使用技術一覧](#使用技術一覧)
4. [環境](#環境)
5. [ディレクトリ構成](#ディレクトリ構成)
6. [開発環境構築](#開発環境構築)
<br />

## 1. プロジェクト名

BINGO-GAME-2025

## 2. プロジェクトについて

本プロジェクトは2025/1/18(土)開催のソルクシーズグループ事業計画発表会後に行われる新年会のビンゴイベントで使用されるプログラム開発を目的としたものです。

<p align="right">(<a href="#top">トップへ</a>)</p>

## 3. 使用技術一覧

<p style="display: inline">
<img src="https://img.shields.io/badge/-Node.js-339933.svg?logo=node.js&style=for-the-badge">
<img src="https://img.shields.io/badge/-Npm-CB3837.svg?logo=npm&style=for-the-badge">
<img src="https://img.shields.io/badge/-Electron-47848F.svg?logo=electron&style=for-the-badge">
<img src="https://img.shields.io/badge/-Javascript-F7DF1E.svg?logo=javascript&style=for-the-badge">
<img src="https://img.shields.io/badge/-Html5-E34F26.svg?logo=html5&style=for-the-badge">
<img src="https://img.shields.io/badge/-Css3-1572B6.svg?logo=css3&style=for-the-badge">
</p>

## 4. 環境

| 言語・フレームワーク  | バージョン |
| ------------------- | ---------- |
| Node.js             | 22.12.0    |
| npm                 | 10.9.0     |
| Electron            | 33.2.1     |

その他のパッケージのバージョンは ```package.json``` を参照してください

※2024/12/28時点での使用環境

<p align="right">(<a href="#top">トップへ</a>)</p>

## 5. ディレクトリ構成

可能ならどこかのタイミングでプロジェクト内のフォルダ構成を整理することを検討したい。

```
.
├── src
    ├── css
    ├── html
    └── js
```
↑みたいな感じで

<p align="right">(<a href="#top">トップへ</a>)</p>

## 6. 開発環境構築

#### 6.0.1. はじめに

環境構築時のインストール物についての概要を以下に示します。(詳しくはご自身で調べてください。)
- Node.jsはC++で書かれた**JavaScriptの実行環境です**。
- npm(Node Package Manager)はJavaScriptで書かれた、**Node.js標準のパッケージマネージャー**です。
- Electronはデスクトップアプリを開発するためのフレームワークで、フロントエンドで用いられる3つの言語 ―― **HTML・CSS・JavaScript**を使ってデスクトップアプリを作成できます。

#### 6.0.2. Node.js と npm のインストール

1. <a href="https://nodejs.org/ja/download/">「ダウンロード|Node.js」</a>のページから、インストーラーをダウンロードします。<br />
バージョンについては最新のもので問題ありません。
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 210637.png>)
>[!NOTE]
>CurrentとLTSの2種類がありますが、LTS(安定板：長期の保守運用が約束されているバージョン)のダウンロードを推奨します。
>Currentはリリース後6ヶ月経っていないバージョンのため、本番環境等での使用は慎重に行ってください。

2. ダウンロードしたインストーラー(今回は「node-v22.12.0-x64.msi」)を実行します。
  
3. 「Next」をクリックします。
<br />
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 215620.png>)

4. 「I accept the term in the Licence Agreement」にチェックを入れ、「Next」をクリックします。
<br />
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 215633.png>)

5. インストール先を選択し、「Next」をクリックします。(こだわり等なければデフォルトのままでOK)
<br />
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 215639.png>)

6. インストールしたいコンポーネントを選択し、「Next」をクリックします。(npm package managerが含まれていればOK)
<br />
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 215740.png>)

7. Chocolateyのインストールにチェックを入れずに「Next」をクリックします。
<br />
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 215934.png>)
>[!NOTE]
>Chocolateyとは「コマンドラインによるアプリケーションの導入や削除を実現するパッケージ管理システム」です。

8. 「Install」をクリックします。
<br />
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 215941.png>)

9. インストールが開始されるので、しばらく待ちます。
<br />
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 215950.png>)

10. インストールが完了したら「Finish」をクリックします。
<br />
![alt text](<MarkdownImg/スクリーンショット 2024-12-27 215958.png>)

11. インストールが成功しているか確認をします。
<br />
コマンドプロンプトを開き、コマンド`node -v`でNode.jsのバージョン確認を行います。

    以下のように、インストールしたバージョンが表示されればOKです。
    ```実行結果
    > node -v
    v22.12.0

    >
    ```
    続いてnpmのバージョン確認をコマンド`npm -v`で行います。
    以下のようにインストールしたバージョンが表示されればOKです。
    ```実行結果
    >npm -v
    10.9.0

    >
    ```
これでNode.jsとnpmのインストールは完了です。

<p align="right">(<a href="#top">トップへ</a>)</p>

#### 6.0.3. Electron のインストール

2024/12/28時点で
<a href="https://github.com/Kawatan1927/bingo-game-2024">*GitHubに上がっている本プロジェクト*</a>
に対してElectronおよびビルドに用いるelectron-builderをインストールする方法を解説します。

1. はじめにプロジェクトのソースをダウンロードします。
<br />
zipをダウンロードするなり、自分のワークスペースにcloneするなりしてください。

2. プロジェクトフォルダ内に```package.json```と```package-lock.json```が存在することを確認してください。
<br />
    >[!NOTE]
    >```package.json```と```package-lock.json```について(ざっくりとした解説なので詳しくはご自身で調べてください。)
    >- ```package.json```<br />
    >現在のプロジェクト情報を保存するファイルです。
    >- ```package-lock.json```<br />
    >依存関係のパッケージのバージョンの詳細情報が記載されたファイルで、今回はこのファイルに記載されている情報を用いてElectronと>electron-builderをインストールします。<br />
    >**編集・削除は行わないでください。**

3. コマンドプロンプトを開き、プロジェクトフォルダ内に移動した後、コマンド```npm ci```を実行してください。
<br />
    ```実行結果
    \bingo-game-2024>npm ci
    ...(略)...
    ...(略)...
    found 0 vulnerabilities

    \bingo-game-2024>
    ```

    実行後にプロジェクトフォルダ内に```node_modules```が作成されていることが確認できればOKです。

    >[!NOTE]
    >```node_modules```について
    >- npmやyarnでインストールしたパッケージが保存されるディレクトリです。
    >- サイズが大きいため通常は```.gitignore```ファイルに記載し、**GitHubでの管理対象外**とします。(本プロジェクトにおいてもGit管理対象外としています。)

4. インストール物のバージョン確認を行います。<br />
   コマンドプロンプトでコマンド```npm ls```を実行します。
   ```実行結果
    \bingo-game-2024>npm ls
    bingo-game-2024@1.0.0 C:\bingo-game-2024
    +-- electron-builder@25.1.8
    `-- electron@33.2.1
   ```

   上記のようにElectronとelectron-builderのバージョンが表示されていればOKです。<br />
   ここまでで、開発環境の構築は完了です。続いて、アプリの起動方法とビルドの実行について解説します。

5. コマンド```npm start```を実行するとアプリが起動します。
   
   ```実行結果
   \bingo-game-2024-main>npm start

    > bingo-game-2024@1.0.0 start
    > electron .
    ```

    ![alt text](<MarkdownImg/スクリーンショット 2024-12-28 132312.png>)
    ※開発中の画面です。

6. コマンド```npm run build```を実行するとビルドが開始します。
   >[!CAUTION]
   >この作業は管理者権限で開いたコマンドプロンプトで行ってください。

   ```実行結果
   \bingo-game-2024>npm run build

    > bingo-game-2024@1.0.0 build
    > electron-builder build

    ...(略)...
    ```

    ビルドが完了するとプロジェクトフォルダ内に```dist```が作成されます。(```dist```もGitHub管理対象外としています。)<br />
    - ```./dist```内にある```bingo-game-2024 Setup 1.0.0.exe```がインストーラーです。
    - ```./dist/win-unpacked```内にある```bingo-game-2024.exe```が実行ファイルです。

    ![alt text](<MarkdownImg/スクリーンショット 2024-12-28 133822.png>)
    <br />
    ※アイコンは2024/12/28時点のものです。

    <p align="right">(<a href="#top">トップへ</a>)</p>

#### 6.0.4. 新規プロジェクトの立ち上げ

本プロジェクトについては既に矢作が環境構築を行ったものがGitHubに上がっているため、以下に記載する作業は不要ですが、一からプロジェクトを立ち上げる方法を解説します。(最低限の解説のため、ここに記載されていない事項はご自身で調べてください。)

1. プロジェクトの作成を行います。
<br />
コマンドプロンプトでアプリケーション用のディレクトリ(今回は「```electron-test```」という名称)を作成し、その下でコマンド```npm init -y```を実行します。

    ```実行結果
    >mkdir electron-test
    >cd electron-test
    \electron-test>npm init -y
    ```

    実行するとカレントディレクトリ内に```package.json```が作成されるので、以下のように編集します。

    ```json:./electron-test/package.json
    {
    "name": "electron-test",
    "version": "1.0.0",
    "main": "main.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "your-name",
    "license": "ISC",
    "description": "your app's description"
    }
    ```

    ```package.json```の各項目の意味は以下の通りです。
    - name：アプリ名(デフォルトだと```npm init```したディレクトリ名)
    - version : アプリのバージョン。デフォルトは1.0.0
    - main : メインプロセスの相対パス。
    >[!NOTE]
    >デフォルトは```index.js```だが、Electronアプリでは```main.js```とするのが一般的。
    - scripts : 独自のコマンドを設定することができます。(よく使用するものをショートカットとして登録しておくイメージです。)
    - keywords : ```npm search```されたときの検索キーワード
    - author : アプリの作者名。
    - license : 配布時のライセンス。デフォルトはISC
    - description : アプリの説明。

2. Electronのインストールを行います。
<br />
作成したアプリケーション用のディレクトリ直下で以下のコマンドを実行して、Electronをインストールします。

    ```
    \electron-test>npm install -D electron
    ```

    >[!WARNING]
    >- インストールには時間がかかる場合があります。<br />
    >- 上記のように```-D```オプションを付与してdevDependenciesとして追加しないと、ビルド時にエラーが出ます。

    無事にインストールが完了すると```package-lock.json```と```node_modules```がディレクトリ内に作成されることが確認できると思います。

3. メインプロセスとレンダラープロセスを作成します。
    >[!NOTE]
    >メインプロセスとレンダラープロセスについて
    >- メインプロセス<br />
    >メインプロセスはアプリの画面ウインドウを生成して、起動・終了等のアプリ本体の制御を行います。1つのアプリに対して1つのみ存在します。<br />
    >アプリのウィンドウ生成を```BrowserWindow```インスタンスの作成で行います。
    >- レンダラープロセス<br />
    >メインプロセスで作成されたアプリ画面をChromiumでレンダリングして表示します。1つのアプリに対して複数個(=画面の数だけ)用意することができます。<br />
    >アプリの画面レイアウト・装飾をHTML・CSS・JavaScriptで行います。<br />
    ><br />
    >![alt text](<MarkdownImg/スクリーンショット 2024-12-28 145651.png>)

    今回は画面に「Hello World」を出力させてみます。<br />
    ```main.js```に以下のようにHTMLを表示するだけの記述をします。

    ```js:main.js
    'use strict';

    // Electronのモジュール
    const electron = require("electron");

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

    // Electronの初期化完了後に実行
    app.on('ready', function() {
        // メイン画面の表示。ウィンドウの幅、高さを指定できる
        mainWindow = new BrowserWindow({width: 800, height: 600});
        mainWindow.loadURL('file://' + __dirname + '/index.html');

        // ウィンドウが閉じられたらアプリも終了
        mainWindow.on('closed', function() {
            mainWindow = null;
        });
    });
    ```

    続いて、```index.html```に「Hello World」を書きます。

    ```html:index.html
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <title>Sample</title>
        </head>
        <body>
            <p>Hello World</p>
        </body>
    </html>
    ```

4. アプリケーションを開始します。<br />
    以下のコマンドを実行して下さい。

    ```実行結果
    \electron-test>.\node_modules\.bin\electron .\
    ```
    ![alt text](<MarkdownImg/スクリーンショット 2024-12-28 153038.png>)<br />
    アプリケーションウインドウが立ち上がります。<br />
    終了する際は、ウインドウを閉じてください。

5. 起動ショートカット設定をします。<br />
    ```package.json```に以下のように設定を追加しておくとコマンド```npm start```で起動が行えるようになります。

    ```json:package.json
    {
    ...(略)...
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "start": "electron ."
    },
    ...(略)...
    }
    ```
6. アプリケーションのビルドを行います。<br />
    ビルドにはelectron-bulderを使用します。以下のコマンドを実行して、electron-builderをインストールしてください。
    ```実行結果
    \electron-test>npm install -D electron-builder
    ```

    >[!WARNING]
    >- 上記のように```-D```オプションを付与してdevDependenciesとして追加しないと、ビルド時にエラーが出ます。

    続いて、```package.json```に以下のようにビルド設定を追加します。<br />
    buildキーは必ず一番上の階層(=nameやversionと同じ階層)に設置してください。

    ```json:package.json
    {
    ...(略)...
        　"build": {
            "appId": "com.electron.yourapp",
            "directories": {
            "output": "dist"
            },
            "files": [
            "assets",
            "index.html",
            "main.js",
            "package.json",
            "package-lock.json"
            ],
            "mac": {
            "icon": "assets/win/icon.ico",
            "target": [
                "dmg"
            ]
            },
            "win": {
            "icon": "assets/win/icon_win.ico",
            "target": "nsis"
            },
            "nsis":{
            "oneClick": false,
            "allowToChangeInstallationDirectory": true
            }
        },
        ...(略)...
    }
    ```

    各項目の意味については以下の通りです。
    - appId : アプリのBundle ID。
    - directories
    - output : ビルドしたアプリの格納先
    - files : ビルドに含めるファイル
    - mac : Mac用にビルドするときの設定
    - icon : アイコンファイルの相対パス
    - target : パッケージ後のファイル形式
    - win : Windows用にビルドするときの設定
    - icon : アイコンファイルの相対パス
    - target : パッケージ後のファイル形式
    - nsis : インストーラ生成ツールNSISの設定
    - oneClick : インストールから実行まで一気に行うかどうか
    - allowToChangeInstallationDirectory : インストール先の変更を許可するかどうか<br />
    <br />
    >[!NOTE]
    >上記の設定において、アプリのアイコン画像は```assets/win```に配置しています。必要でない場合は空欄にしておいてください。<br />
    >アイコン画像のファイル形式については以下の通りです。
    >- Windows用：.icoファイル
    >- Mac用：icnsファイル

    ここまで完了したら以下のコマンドを実行してビルドを行ってください。

    >[!CAUTION]
    >管理者権限で開いたコマンドプロンプトで実行してください。

    ```実行結果
    \electron-test>.\node_modules\.bin\electron .\
    ```

    全てのメッセージが表示し終えて、プロンプトが再度表示されたらビルド完了です。

<p align="right">(<a href="#top">トップへ</a>)</p>