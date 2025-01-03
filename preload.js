// レンダラープロセス側ではモジュールをrequireできないためこのファイルを先に読み込ませることでモジュールを使用可能にする

const {contextBridge, ipcRenderer} = require("electron");
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            ipcRenderer.send(channel, data);
        },
        on: (channel, func) => {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
);