import { ipcRenderer, remote } from "electron";
import { WEBAPP_EVENT } from "../main/electron/events";
import "./global";
import "./app";

const quit = () => {
    ipcRenderer.send(WEBAPP_EVENT.APP.QUIT);
};

const doit = () => {
    ipcRenderer.send("doit");
};

const quitButton = document.getElementById("quit") as HTMLButtonElement;
quitButton.addEventListener("click", quit);

const doitButton = document.getElementById("doit") as HTMLButtonElement;
doitButton.addEventListener("click", doit);

const { maxtime } = window;
