/**
 * @fileoverview Electronのプリロードスクリプト
 * レンダラープロセスからメインプロセスへの安全な通信を実現するための
 * contextBridgeを使用したAPIの公開を行います。
 * レンダラープロセス側ではモジュールをrequireできないため、
 * このファイルを先に読み込ませることでモジュールを使用可能にします。
 */

const {contextBridge, ipcRenderer} = require("electron");

/**
 * レンダラープロセスで使用可能なAPIをwindow.apiとして公開
 * セキュリティのためcontextBridgeを使用して安全にIPCを実行
 */
contextBridge.exposeInMainWorld(
    "api", {
        /**
         * メインプロセスにメッセージを送信
         * @param {string} channel - 送信先チャンネル名
         * @param {*} data - 送信するデータ
         */
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        /**
         * メインプロセスからのメッセージを受信
         * @param {string} channel - 受信するチャンネル名
         * @param {Function} func - メッセージ受信時に実行するコールバック関数
         */
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
);