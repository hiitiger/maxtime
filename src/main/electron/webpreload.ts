import logger from "./preload/logger";
import sdk from "./preload/sdk";
import settings from "./preload/settings";

import { remote } from "electron";

const maxtime = { sdk, settings, logger };

process.once("loaded", () => {
    const window: any = global;
    window.maxtime = maxtime;
    window.nodeRequire = require;
    window.nodeRequireRemote = remote.require;
    if (remote.getGlobal("DEBUG")) {
        window.__devtron = { require, process };
    }
});
