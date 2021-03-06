import { ipcRenderer } from "electron";

function log(name: string, level: string, message: string, ...args: any[]) {
    ipcRenderer.send("__LOGGER__", {
        name,
        level,
        message,
        args,
    });
}

class Logger {
    public readonly name: string;
    constructor(name: string) {
        this.name = name;

        const levels = ["debug", "info", "warn", "error", "fatal"];
        levels.forEach((value) => {
            (this as any)[value] = log.bind(null, name, value);
        });
    }

    public debug(message: any, ...args: any[]) {
        console.debug(message, ...args);
    }

    public info(message: any, ...args: any[]) {
        console.info(message, ...args);
    }

    public warn(message: any, ...args: any[]) {
        console.warn(message, ...args);
    }

    public error(message: any, ...args: any[]) {
        console.error(message, ...args);
    }

    public fatal(message: any, ...args: any[]) {
        console.error(message, ...args);
    }
}

const loggers: any = {};

function getLogger(name: string): Logger {
    let l = loggers[name];
    if (!l) {
        l = new Logger(name);
        loggers[name] = l;
    }
    return l;
}

export default {
    getLogger,
};
