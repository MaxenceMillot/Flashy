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

export function getOSInfo() {
    const ua = navigator.userAgent;

    if (/Windows NT 10.0/.test(ua) || /Windows NT 11.0/.test(ua)) {
        return { name: "Windows", version: "10/11" };
    }
    if (/Windows/.test(ua)) {
        return { name: "Windows", version: "unknown" };
    }
    if (/Android ([\d.]+)/.test(ua)) {
        return {
            name: "Android",
            version: ua.match(/Android ([\d.]+)/)?.[1] || "unknown"
        };
    }
    if (/iPhone OS ([\d_]+)/.test(ua)) {
        return {
            name: "iOS",
            version: ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replaceAll("_", ".")
        };
    }
    if (/iPad.*OS ([\d_]+)/.test(ua)) {
        return {
            name: "iPadOS",
            version: ua.match(/OS ([\d_]+)/)?.[1]?.replaceAll("_", ".")
        };
    }
    if (/Mac OS X ([\d_]+)/.test(ua)) {
        return {
            name: "macOS",
            version: ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replaceAll("_", ".")
        };
    }
    if (/Linux/.test(ua)) {
        return {
            name: "Linux",
            version: "unknown"
        };
    }
    return {
        name: "unknown",
        version: "unknown"
    };
}

// MULTICLICK detection (for hidden reset)
export function multiClick(element, callback) {
    let count = 0;
    let timer = null;
    let clicksRequired = 5;
    let delay = 600;

    element.addEventListener("click", () => {
        count++;

        clearTimeout(timer);

        if (count >= clicksRequired) {
            count = 0;
            callback();
            return;
        }

        timer = setTimeout(() => {
            count = 0;
        }, delay);
    });
}