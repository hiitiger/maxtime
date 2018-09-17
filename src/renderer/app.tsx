import * as React from "react";
import * as ReactDOM from "react-dom";

import { AppProcessInfo } from "./components/AppProcessInfo";

console.log("start...");

const processUtils = window.nodeRequireRemote("process-utils");

setInterval(() => {
    const procInfo = processUtils.getActiveAppProcessInfo();

    ReactDOM.render(
        <AppProcessInfo
            title={procInfo.title}
            product={procInfo.productName}
            path={procInfo.filePath}
        />,
        document.getElementById("example"),
    );
}, 1000);
