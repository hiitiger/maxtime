import { app as ElectronApp, BrowserWindow } from "electron";
import { Menu, Tray } from "electron";
import { ipcMain } from "electron";
import { shell } from "electron";
import * as path from "path";
import { logger } from "../utils/logger";
import { CLIENT_EVENT, WEBAPP_EVENT } from "./events";
import * as sdk from "./native/sdk";
import { settings } from "./native/settings";
import * as processUtils from "process-utils";

enum AppWindows {
    main = "main",
}
const PRELOAD_JS = path.join(__dirname, "./webpreload.js");

class Application {
    private static singleton: Application;

    private windows: Map<string, Electron.BrowserWindow>;
    private appDir: string;
    private tray: Electron.Tray | null;
    private markQuit = false;
    private isWebReady = false;

    static get app() {
        return this.singleton;
    }

    get appWindows() {
        return this.windows;
    }

    get mainWindow() {
        return this.windows.get(AppWindows.main) || null;
    }

    set mainWindow(window: Electron.BrowserWindow | null) {
        if (!window) {
            this.windows.delete(AppWindows.main);
        } else {
            this.windows.set(AppWindows.main, window);
            window.on("closed", () => {
                this.mainWindow = null;
            });

            window.webContents.on("new-window", (e, url) => {
                e.preventDefault();
                shell.openExternal(url);
            });

            window.webContents.on("will-navigate", (evt, url) => {
                evt.preventDefault();
            });

            window.on("ready-to-show", () => {
                this.webReady();
            });

            window.webContents.on(
                "did-fail-load",
                (event, errorCode, errorDescription) => {
                    if (this.markQuit) {
                        return;
                    }

                    logger("client").error(
                        `main window load fail ${errorCode} ${errorDescription}`,
                    );

                    window.reload();
                },
            );

            window.webContents.on("crashed", (event, killed) => {
                if (killed) {
                    this.quit();
                    return;
                }

                if (this.markQuit) {
                    return;
                }

                window.webContents.reload();
            });

            window.on("unresponsive", () => {
                logger("client").info("main window unresponsive");
            });

            window.on("close", (event) => {
                if (this.markQuit) {
                    return;
                }
                event.preventDefault();
                window.hide();
                return false;
            });

            window.loadURL(global.CONFIG.entryUrl);
        }
    }
    constructor() {
        this.windows = new Map();
        this.appDir = "";
        this.tray = null;
        Application.singleton = this;
    }

    public init(appDir: string) {
        this.appDir = appDir;
    }

    public getWindow(window: string) {
        return this.windows.get(window) || null;
    }

    public createMainWindow() {
        const options = {
            minWidth: 600,
            minHeight: 420,
            width: 1280,
            height: 768,
            show: false,
            frame: false,
            center: true,
            backgroundColor: "#80ffffff",
            transparent: false,
            webPreferences: {
                nodeIntegration: true,
                preload: PRELOAD_JS,
            },
        };
        const mainWindow = this.createWindow(AppWindows.main, options);
        if (process.platform === "win32") {
            processUtils.enableVibrancy(
                mainWindow.getNativeWindowHandle().readUInt32LE(0),
                true,
            );
        }
        this.mainWindow = mainWindow;
        return mainWindow;
    }

    public openMainWindow() {
        let mainWindow = this.mainWindow;
        if (!mainWindow) {
            mainWindow = this.createMainWindow();
        }
        mainWindow!.show();
        mainWindow!.focus();
    }

    public closeMainWindow() {
        const mainWindow = this.mainWindow;
        if (mainWindow) {
            mainWindow.close();
        }
    }

    public closeAllWindows() {
        const windows = this.windows.values();
        for (const window of windows) {
            window.close();
        }
    }

    public closeWindow(name: string) {
        const window = this.windows.get(name);
        if (window) {
            window.close();
        }
    }

    public hideWindow(name: string) {
        const window = this.windows.get(name);
        if (window) {
            window.hide();
        }
    }

    public showAndFocusWindow(name: string) {
        const window = this.windows.get(name);
        if (window) {
            window.show();
            window.focus();
        }
    }

    public setupSystemTray() {
        if (!this.tray) {
            const icon = path.join(global.CONFIG.assetsDir, "app.ico");
            this.tray = new Tray(icon);
            const contextMenu = Menu.buildFromTemplate([
                {
                    label: "OpenMainWindow",
                    click: () => {
                        this.showAndFocusWindow(AppWindows.main);
                    },
                },
                {
                    label: "About",
                    click: () => {
                        this.showAbout();
                    },
                },
                {
                    label: "Quit",
                    click: () => {
                        this.quit();
                    },
                },
            ]);
            this.tray.setToolTip("WelCome");
            this.tray.setContextMenu(contextMenu);

            this.tray.on("click", () => {
                this.showAndFocusWindow(AppWindows.main);
            });
        }
    }

    public start() {
        this.bindIpc();
        this.createMainWindow();
    }

    public webReady() {
        if (!this.isWebReady) {
            this.isWebReady = true;
            this.showAndFocusWindow(AppWindows.main);
            this.setupSystemTray();
        }
    }

    public activate() {
        this.openMainWindow();
    }

    public quit() {
        if (this.markQuit) {
            return;
        }
        this.markQuit = true;
        this.closeMainWindow();
        this.closeAllWindows();
        if (this.tray) {
            this.tray.destroy();
        }
    }

    public showAbout() {
        this.openLink(path.join(global.CONFIG.distDir, "index/about.txt"));
    }

    public openLink(url: string) {
        shell.openExternal(url);
    }

    public openWindow(
        name: string,
        url: string,
        options: Electron.BrowserWindowConstructorOptions,
    ) {
        let window = this.getWindow(name);
        if (!window) {
            window = this.createWindow(
                name,
                options as Electron.BrowserViewConstructorOptions,
            );
        }
        if (window.webContents.getURL() !== url) {
            window.loadURL(url);
        }
        if (options.show) {
            window.show();
        }
        return window;
    }

    private createWindow(
        name: string,
        options: Electron.BrowserWindowConstructorOptions,
    ) {
        const { webPreferences } = options;
        options = {
            ...options,
            webPreferences: {
                nodeIntegration: false,
                ...webPreferences,
            },
        };

        const window = new BrowserWindow(options);
        this.windows.set(name, window);
        window.on("closed", () => {
            this.windows.delete(name);
        });
        window.webContents.on(
            "before-input-event",
            (event: Electron.Event, input: Electron.Input) => {
                if (input.key === "F12" && input.type === "keyDown") {
                    window.webContents.openDevTools();
                }
            },
        );
        window.setMenu(null);
        return window;
    }

    private bindIpc() {
        ipcMain.on(WEBAPP_EVENT.APP.QUIT, () => this.quit());
    }
}

export { Application };
