import { app as ElectronApp } from "electron";

function start(
    successCallback: () => void,
    newProcessCallback: (argv: string[]) => void,
) {
    const shouldQuit = ElectronApp.makeSingleInstance((argv: string[]) => {
        newProcessCallback(argv);
    });

    successCallback();
}

export { start };
