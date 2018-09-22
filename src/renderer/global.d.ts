declare module "*.css";

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
        window: {
            minimize(): void;
            restore(): void;
            maximize(): void;
            restoreOrMaximize(): void;
            hide(): void;
            show(): void;
            close(): void;
            center(): void;
            focus(force?: boolean): void;
            enterFullScreen(): void;
            quitFullScreen(): void;
            setZoomFactor(factor: number): void;
            setSize(width: number, height: number): void;
            setPosition(x: number, y: number): void;
            setMaximumSize(width: number, height: number): void;
            setMinimumSize(width: number, height: number): void;
            setResizable(resizable: boolean): void;
            on(name: string, cb: () => void): void;
            once(name: string, cb: () => void): void;
            off(name: string, cb: () => void): void;
            isVisible(): boolean;
            isMaximized(): boolean;
            isMinimized(): boolean;
            isFullScreen(): boolean;
            flashFrame(flag: boolean): void;
        };
        require: NodeRequire;
        requireRemote: (module: string) => any;
    };
}
