declare module "process-utils" {
    interface IWindowInfo {
        title: string;
    }

    interface IProcessInfo {
        filePath: string;
        version: string;
        description: string;
        productName: string;
        companyName: string;
    }

    type WindowProcessInfo = IWindowInfo & IProcessInfo;

    export function getActiveAppProcessInfo(): WindowProcessInfo;

    export function startSystemForegroundAppWatch(
        listener: (info: WindowProcessInfo) => void,
    ): void;

    export function stopSystemForegroundAppWatch(): void;
    export function enableVibrancy(winhandle: number, enable: boolean): void;
}
