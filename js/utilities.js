export function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
// STANDALONE = PWA APP
export function isInStandaloneMode() {
    if (isIos()) {
        return window.navigator.standalone === true;
    }

    return window.matchMedia("(display-mode: standalone)").matches;
}

// GET VERSION NUMBER
export async function getAppVersion() {
    const res = await fetch("./data/version.json", { cache: "no-store" });
    const data = await res.json();
    return data.version;
}