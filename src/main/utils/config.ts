import { app as ElectronApp } from "electron";
import * as path from "path";
import "./debug";
import { fileUrl } from "./utils";

const CONFIG: any = {};

CONFIG.appName = "maxtime";

CONFIG.appDataDir = path.join(
    ElectronApp.getPath("appData"),
    CONFIG.appName.toLowerCase(),
);

CONFIG.distDir = path.join(__dirname, "../../");

if (global.DEBUG) {
    CONFIG.entryUrl = fileUrl(path.join(CONFIG.distDir, "index/index.html"));
} else {
    CONFIG.entryUrl = fileUrl(path.join(CONFIG.distDir, "index/index.html"));
}

CONFIG.assetsDir = path.join(__dirname, "../../../", "assets");

CONFIG.loadingUrl = fileUrl(
    path.join(CONFIG.distDir, "index/loading/loading.html"),
);

CONFIG.settingsFile = path.join(CONFIG.appDataDir, "settings.json");

global.CONFIG = CONFIG;

export default CONFIG;
