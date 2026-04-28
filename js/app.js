import { initState, cards } from "./state.js";
import { getNext, gradeCard } from "./scheduler.js";
import { initHeaderMenu, render, showAnswer, setButtonsDisabled, fadeOut, fadeIn, el } from "./ui.js";
import { renderDecks, getSelectedDecks } from "./decks.js";
import { initZoom } from "./zoom.js";

let current = null;
let nextCard = null;
let isTransitioning = false;

/*
/ PRE LOAD AREA {
*/
// Detect PWA installed mode
function isInstalledPWA() {
    return window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true;
}

// Throttled preload
function preloadAllImages() {
    const images = cards.map(c => c.img);
    let i = 0;

    function queue() {
        if (i >= images.length) return;

        const img = new Image();
        img.src = images[i++];

        // small delay for smoother network usage
        setTimeout(queue, 15);
    }

    queue();
    console.log("Preloading DONE");
}

// Delayed preload trigger
setTimeout(() => {
    if (isInstalledPWA()) {
        console.log("Preloading all images...");
        preloadAllImages();
    }
}, 2000);

// Service worker registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service_worker.js")
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.error("SW registration failed:", err));
    });
}

/*
/ END OF PRE LOAD AREA }
*/

// INIT
initState();
initHeaderMenu();
renderDecks(cards, el.deckContainer);
initZoom(el.img);

// Load image with decode safety
// TODO : remove
function preloadImage(src) {
    return new Promise((resolve) => {
        if (!src) return resolve();

        const img = new Image();

        img.onload = async () => {
            try { await img.decode(); } catch(e) {}
            resolve(src);
        };
        img.onerror = () => {
            resolve("images/placeholder_image_not_found.png");
        };

        img.src = src;

        if (img.decode) {
            img.decode().then(() => resolve(src)).catch(() => resolve(src));
        }
    });
}

// NEXT CARD FLOW
async function next() {
    if (isTransitioning) return;

    isTransitioning = true;
    setButtonsDisabled(true);

    const result = getNext(getSelectedDecks());
    if (!result) return;

    // use stored nextCard if available
    const newCard = nextCard || result.current;

    // prepare NEXT one
    nextCard = result.nextCard;

    // preload NEXT card (for future)
    if (nextCard?.img) {
        const img = new Image();
        img.src = nextCard.img;
    }

    // 1. Fade out
    await new Promise(r => fadeOut(r));

    // 2. Activate skeleton
    el.card.classList.add("loading");

    // 3. Render
    current = newCard;

    render(current, {
        onImageReady: () => {
            isTransitioning = false;
            setButtonsDisabled(false);
        }
    });

    // 4. Fade in
    await new Promise(r => fadeIn(r));
}

// EVENTS
el.btnShow.addEventListener("click", () => {
    if (el.card.classList.contains("loading")) return;
    showAnswer();
});

el.gradeButtons.addEventListener("click", (e) => {
    console.log("isTransitioning in clickListener: "+isTransitioning)
    if (isTransitioning || !current || el.card.classList.contains("loading")) return;

    const btn = e.target.closest("button");
    if (!btn) return;

    const grade = Number(btn.dataset.grade);

    gradeCard(current, grade);
    next();
});

document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Reset all progress?")) {
        localStorage.removeItem("cards");
        location.reload();
    }
});

// START APP
next();