import * as React from "react";
import classes from "./style.css";

export interface ITitleBarProps {
    icon: string;
    title: string;
}

const CloseButton = (props: any) => (
    <div className={classes.button + " " + classes.close} {...props}>
        <svg width="12" height="12" viewBox="0 0 12 12">
            <polygon
                fill="#ffffff"
                fillRule="evenodd"
                points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
            />
        </svg>
    </div>
);

const RestoreButton = (props: any) => (
    <div className={classes.button} {...props}>
        <svg width="12" height="12" viewBox="0 0 12 12">
            <rect
                width="9"
                height="9"
                x="1.5"
                y="1.5"
                fill="none"
                stroke="#ffffff"
            />
        </svg>
    </div>
);

const MinimizeButton = (props: any) => (
    <div className={classes.button} {...props}>
        <svg name="TitleBarMinimize" width="12" height="12" viewBox="0 0 12 12">
            <rect fill="#ffffff" width="10" height="1" x="1" y="6" />
        </svg>
    </div>
);

export default class TitleBar extends React.Component<Partial<ITitleBarProps>> {
    public render() {
        return (
            <div className={classes.titlebar}>
                <div className={classes.icon}>{this.props.icon}</div>
                <div className={classes.title}>{this.props.title}</div>
                <CloseButton onClick={() => window.maxtime.window.close()} />
                <RestoreButton
                    onClick={() => window.maxtime.window.restoreOrMaximize()}
                />
                <MinimizeButton
                    onClick={() => window.maxtime.window.minimize()}
                />
            </div>
        );
    }
}
