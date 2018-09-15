import { ipcRenderer, remote } from "electron";
import { WEBAPP_EVENT } from "../main/electron/events";
import "./app/app";

const quit = () => {
    ipcRenderer.send(WEBAPP_EVENT.APP.QUIT);
};

const quitButton = document.getElementById("quit") as HTMLButtonElement;
quitButton.addEventListener("click", quit);

const { maxtime } = window as any;
