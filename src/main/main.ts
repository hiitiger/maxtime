import { app as ElectronApp, BrowserWindow, session } from "electron";

import * as fs from "fs";
import * as path from "path";
import "./utils/config";
import { logger, shutdownLogger } from "./utils/logger";

import { Application } from "./electron/app-entry";

import * as fse from "fs-extra";

import "./app/doit";

logger("main").info("start...");
logger("main").info("CONFIG", { DEBUG: global.DEBUG, CONFIG: global.CONFIG });

function installDevtron() {
    console.log("Installing Devtron");
    try {
        const devtron = require("devtron");
        devtron.uninstall();
        devtron.install();
    } catch (err) {
        logger("main").error("install devtron fail", err);
    }

    console.log("Installed Devtron");
}

function installDevtools() {
    installDevtron();
}

function setupDirs() {
    fse.ensureDirSync(global.CONFIG.appDataDir);
}

function beforeElectronReady() {
    if (global.DEBUG || global.CONFIG.debug) {
        ElectronApp.commandLine.appendSwitch("ignore-certificate-errors");
    }
    setupDirs();

    process.on("uncaughtException", (err) => {
        logger("main").error(`Caught exception: ${err}\n`);
    });
}

beforeElectronReady();

function onElectronReady() {
    if (global.DEBUG) {
        installDevtools();
    }
}

function startApp() {
    logger("main").info("startApp");

    logger("main").info("start Application");
    const appEntry = new Application();
    global.appEntry = appEntry;

    appEntry.init(__dirname);
    appEntry.start();
}

ElectronApp.on("ready", () => {
    logger("main").info("ready...");
    onElectronReady();
    startApp();
});

ElectronApp.on("window-all-closed", () => {
    logger("main").info("window-all-closed");
    ElectronApp.quit();
});

ElectronApp.on("activate", () => {
    if (global.appEntry) {
        global.appEntry.activate();
    }
});

ElectronApp.on("will-quit", () => {
    logger("main").info("will-quit...");
});

ElectronApp.on("quit", () => {
    logger("main").info("quit...");
    shutdownLogger();
});
