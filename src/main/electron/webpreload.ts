import sdk from "./preload/sdk";
import settings from "./preload/settings";
import logger from "./preload/logger";

import { remote } from "electron";

const maxtime = { sdk, settings, logger };

process.once("loaded", () => {
    const window: any = global;
    window.maxtime = maxtime;

    if (remote.getGlobal("DEBUG")) {
        window.__devtron = { require, process };
    }
});
