export function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
// STANDALONE = PWA APP
export function isInStandaloneMode() {
    return window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true;
}

