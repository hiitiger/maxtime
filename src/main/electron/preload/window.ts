import { remote, webFrame } from "electron";

function minimize() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.minimize();
    }
}

function restore() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.restore();
    }
}

function maximize() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.maximize();
    }
}

function restoreOrMaximize() {
    const window = remote.getCurrentWindow();
    if (window) {
        if (window.isMaximized()) {
            window.restore();
        } else {
            window.maximize();
        }
    }
}

function hide() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.hide();
    }
}

function show() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.show();
    }
}

function close() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.close();
    }
}

function center() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.center();
    }
}

function focus(force?: boolean) {
    const window = remote.getCurrentWindow();
    if (window) {
        if (force) {
            window.setAlwaysOnTop(true);
            window.focus();
            window.setAlwaysOnTop(false);
        } else {
            window.focus();
        }
    }
}

function enterFullScreen() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.setFullScreen(true);
    }
}

function quitFullScreen() {
    const window = remote.getCurrentWindow();
    if (window) {
        window.setFullScreen(false);
    }
}

function setZoomFactor(factor: number) {
    if (!webFrame.setZoomFactor) {
        return;
    }
    webFrame.setZoomFactor(factor);
}

function setSize(width: number, height: number) {
    const window = remote.getCurrentWindow();
    if (window) {
        window.setSize(width, height);
    }
}

function setPosition(x: number, y: number) {
    const window = remote.getCurrentWindow();
    if (window) {
        window.setPosition(x, y);
    }
}

function setMaximumSize(width: number, height: number) {
    const window = remote.getCurrentWindow();
    if (window) {
        window.setMaximumSize(width, height);
    }
}

function setMinimumSize(width: number, height: number) {
    const window = remote.getCurrentWindow();
    if (window) {
        window.setMinimumSize(width, height);
    }
}

function setResizable(resizable: boolean) {
    const window = remote.getCurrentWindow();
    if (window) {
        window.setResizable(resizable);
    }
}

export enum AllowedEvents {
    focus = "focus",
    blur = "blur",
    show = "show",
    hide = "hide",
    maximize = "maximize",
    unmaximize = "unmaximize",
    minimize = "minimize",
    restore = "restore",
}

const allowedEvents = new Set(
    Object.keys(AllowedEvents).map((key: any) => AllowedEvents[key]),
);

function on(name: string, cb: () => void) {
    if (!allowedEvents.has(name)) {
        throw new Error(`${name} is not allowed to listen`);
    }
    const window = remote.getCurrentWindow();
    if (window) {
        window.on(name as any, cb);
    }
}

function once(name: string, cb: () => void) {
    if (!allowedEvents.has(name)) {
        throw new Error(`${name} is not allowed to listen`);
    }
    const window = remote.getCurrentWindow();
    if (window) {
        window.once(name as any, cb);
    }
}

function off(name: string, cb: () => void) {
    const window = remote.getCurrentWindow();
    if (window) {
        window.removeListener(name as any, cb);
    }
}

function isVisible() {
    const window = remote.getCurrentWindow();
    return window && window.isVisible();
}

function isMaximized() {
    const window = remote.getCurrentWindow();
    return window && window.isMaximized();
}

function isMinimized() {
    const window = remote.getCurrentWindow();
    return window && window.isMinimized();
}

function isFullScreen() {
    const window = remote.getCurrentWindow();
    return window && window.isFullScreen();
}

function flashFrame(flag: boolean) {
    const window = remote.getCurrentWindow();
    if (window) {
        window.flashFrame(flag);
    }
}

export default {
    minimize,
    maximize,
    restoreOrMaximize,
    restore,
    focus,
    show,
    hide,
    close,
    center,
    enterFullScreen,
    quitFullScreen,
    setZoomFactor,
    setSize,
    resize: setSize,
    setPosition,
    setMaximumSize,
    setMinimumSize,
    setResizable,
    on,
    once,
    off,
    isVisible,
    isFullScreen,
    isMaximized,
    isMinimized,
    flashFrame,
};
