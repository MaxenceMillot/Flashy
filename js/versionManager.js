import { showUpdateToast } from "./toaster.js";

let INSTALLED_VERSION = null;

export async function initVersion() {
    const cacheKeys = await caches.keys();
    const activeCache = cacheKeys
        .filter(k => k.startsWith("flashy-v"))
        .sort()
        .at(-1);

    // Fallback
    if (!activeCache) {
        INSTALLED_VERSION = await getAppVersion();
        return;
    }

    INSTALLED_VERSION = activeCache.replace("flashy-v", "");
}

export async function setVersionInFooter(){
    if(!INSTALLED_VERSION){
        document.getElementById("appVersion").textContent += "X";
        return;
    }
    document.getElementById("appVersion").textContent += `${INSTALLED_VERSION}`;
}

export function getCurrentVersion(){
    return INSTALLED_VERSION;
}

// get app version from SERVER
export async function getAppVersion() {
    const res = await fetch("./data/version.json", { cache: "no-store" });
    const data = await res.json();
    return data.version;
}

export function registerServiceWorker() {
    navigator.serviceWorker.register("./service_worker.js")
        .then((registration) => {
            console.log("Service Worker registered");

            // already waiting
            if (registration.waiting) {
                showUpdateToast(registration.waiting);
            }

            // new update found
            registration.addEventListener("updatefound", () => {
                const newWorker = registration.installing;
                if (!newWorker) return;
                newWorker.addEventListener("statechange", () => {
                    if (newWorker.state === "installed" &&
                        navigator.serviceWorker.controller) 
                    {
                        showUpdateToast(newWorker);
                    }
                });
            });
        })
        .catch(error => console.error("SW registration failed:", error));
}

export async function checkForUpdate() {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;

        // already waiting → show again
        if (registration.waiting) {
            showUpdateToast(registration.waiting);
            return;
        }

        await registration.update();
    } catch (error) {
        console.warn("Update check failed:", error);
    }
}