import * as React from "react";
import * as ReactDOM from "react-dom";
import "typeface-roboto";

import { ipcRenderer, remote } from "electron";
import { WEBAPP_EVENT } from "../main/electron/events";

import Button from "@material-ui/core/Button";

import TitleBar from "./pages/titlebar";
import AppProcessInfo from "./pages/AppProcessInfo";

import * as IProcessUtils from "process-utils";

const procoessUtils: typeof IProcessUtils = window.maxtime.requireRemote(
    "process-utils",
);

const styles = {
    window: {
        "display": "flex",
        "flex-direction": "column",
        "height": "100vh",
    },
    title: {
        "width": "100%",
        "height": "40px",
        "backgroundColor": "rgba(0, 0, 0, 0.75)",
        "-webkit-app-region": "drag",
        "position": "unset",
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "flex-end",
    } as React.CSSProperties,

    buttonContainer: {
        "display": "flex",
        "flexDirection": "row",
        "-webkit-app-region": "no-drag",
    } as React.CSSProperties,

    content: {
        width: "100%",
        flex: "1",
        backgroundColor: "rgb(255, 255, 255, 0.5)",
    },

    button: {
        background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
        borderRadius: 12,
        height: 34,
        border: 0,
        color: "white",
        boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    },
};

interface IAppState {
    activeApp: {
        title?: string;
        product?: string;
        path?: string;
    };
}

class App extends React.Component<{}, Partial<IAppState>> {
    constructor(props: {}) {
        super(props);
        this.state = {
            activeApp: {},
        };
    }

    public componentDidMount() {
        setInterval(() => {
            const activeApp = procoessUtils.getActiveAppProcessInfo();
            this.setState({
                activeApp: {
                    title: activeApp.title,
                    product: activeApp.productName,
                    path: activeApp.filePath,
                },
            });
        });
    }

    public render() {
        return (
            <div style={styles.window}>
                <TitleBar title="MaxTime" icon="⏰" />
                <div style={styles.title}>
                    <div style={styles.buttonContainer}>
                        <Button
                            style={styles.button}
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                ipcRenderer.send("doit");
                            }}
                        >
                            Just do it!
                        </Button>

                        <Button
                            style={styles.button}
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                ipcRenderer.send(WEBAPP_EVENT.APP.QUIT);
                            }}
                        >
                            Quit
                        </Button>
                    </div>
                </div>
                <div style={styles.content}>
                    <AppProcessInfo {...this.state.activeApp} />
                </div>
            </div>
        );
    }
}
ReactDOM.render(<App />, document.getElementById("root"));
