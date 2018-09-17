declare class Logger {
    public debug(message: any, ...args: any[]): void;
    public info(message: any, ...args: any[]): void;
    public warn(message: any, ...args: any[]): void;
    public error(message: any, ...args: any[]): void;
}

declare interface Window {
    nodeRequire: (name: string) => any;
    nodeRequireRemote: (name: string) => any;

    maxtime: {
        sdk: {
            getSdkVersion(): string;
            getSdkInfo(): any;
        };
        settings: {
            get: (name: string) => any;
            set: (name: string, value: any) => void;
            save: () => any;
        };
        logger: {
            getLogger: (name: string) => Logger;
        };
    };
}
