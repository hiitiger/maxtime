import logger from "./preload/logger";
import sdk from "./preload/sdk";
import settings from "./preload/settings";
import window from "./preload/window";

import { remote } from "electron";

const maxtime = {
    sdk,
    settings,
    logger,
    window,
    require,
    requireRemote: remote.require,
};

process.once("loaded", () => {
    (global as any).maxtime = maxtime;
    if (remote.getGlobal("DEBUG")) {
        (global as any).__devtron = { require, process };
    }
});
