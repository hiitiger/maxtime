export function getSdkVersion() {
    return global.CONFIG.sdkVersion;
}

export function getSdkInfo() {
    return {
        version: global.CONFIG.sdkVersion,
        name: global.CONFIG.sdkName,
    };
}
