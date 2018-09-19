import { ipcMain, screen } from "electron";
import { fileUrl } from "../utils/utils";
import { Application } from "../electron/app-entry";
import * as path from "path";

ipcMain.on("doit", () => {
    Application.app.closeWindow("doit");

    const display = screen.getDisplayNearestPoint(
        screen.getCursorScreenPoint(),
    );

    const window = Application.app.openWindow(
        "doit",
        fileUrl(path.join(global.CONFIG.distDir, "doit/index.html")),
        {
            width: 960,
            height: 540,
            transparent: true,
            show: true,
            frame: false,
            skipTaskbar: true,
            x: display.bounds.width + display.bounds.x - 1000,
            y: display.bounds.height + display.bounds.y - 600,
            alwaysOnTop: true,
        },
    );

    window.setIgnoreMouseEvents(true);
});
