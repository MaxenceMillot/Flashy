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
