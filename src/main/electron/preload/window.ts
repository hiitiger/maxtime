import { remote } from "electron";

function minimize() {
    remote.getCurrentWindow().minimize();
}

function restore() {
    remote.getCurrentWindow().restore();
}

function maximize() {
    remote.getCurrentWindow().maximize();
}

function restoreOrMaximize() {
    if (remote.getCurrentWindow().isMaximized()) {
        restore();
    } else {
        maximize();
    }
}

function close() {
    remote.getCurrentWindow().close();
}

export default {
    minimize,
    restore,
    maximize,
    restoreOrMaximize,
    close,
};
