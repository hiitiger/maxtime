console.log("start...");

const processUtils = window.nodeRequireRemote("process-utils");

console.log("start...");

setInterval(() => {
    console.log(JSON.stringify(processUtils.getActiveAppProcessInfo()));
}, 1000);
