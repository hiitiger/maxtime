import logger from "./preload/logger";
import sdk from "./preload/sdk";
import settings from "./preload/settings";
import window from "./preload/window";

import { remote } from "electron";

const maxtime = { sdk, settings, logger, window };

process.once("loaded", () => {
    (global as any).maxtime = maxtime;
    (global as any).nodeRequire = require;
    (global as any).nodeRequireRemote = remote.require;
    if (remote.getGlobal("DEBUG")) {
        (global as any).__devtron = { require, process };
    }
});
