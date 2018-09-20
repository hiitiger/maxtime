/// <reference path="./global.d.ts" />
import { ipcRenderer, remote } from "electron";
import { WEBAPP_EVENT } from "../main/electron/events";
import "./app";

const { maxtime } = window;

if ((module as any).hot) {
    (module as any).hot.accept();
}
