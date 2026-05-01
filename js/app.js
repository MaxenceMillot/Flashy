import { initState, cards } from "./state.js";
import { getNext, gradeCard } from "./scheduler.js";
import { loadImage, PLACEHOLDER } from "./imageLoader.js";
import { initHeaderMenu, setAnswerText, setCardImage, startLoading, stopLoading, showAnswer, showNormalMode, showSkipMode, setButtonsDisabled, fadeOut, fadeIn, el } from "./ui.js";
import { renderDecks, getSelectedDecks, setDeckChangeCallback } from "./decks.js";
import { initZoom } from "./zoom.js";
import { isInStandaloneMode, isIos } from "./utilities.js";

let current = null;
let nextCard = null;
let isTransitioning = false;
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
    // Stop the automatic browser prompt to install the app
    e.preventDefault();

    // Save it for later
    deferredPrompt = e;
});

// REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service_worker.js")
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.error("SW registration failed:", err));
    });
}

// LOAD ICONS FROM LIBRARY
lucide.createIcons();

// HIDE DOWNLOAD BUTTON IN STANDALONE (PWA)
// if(isInStandaloneMode){
//     el.btnDownload.style.display = "none";
// }

// AFTER 5s PRELOAD ALL IMAGES IF PWA
setTimeout(() => {
    if (isInStandaloneMode()) {
        console.log("Preloading all images...");
        preloadAllImages();
    }
}, 5000);

// PRELOAD ALL IMAGES (in cache)
function preloadAllImages() {
    const images = cards.map(c => c.img);
    let i = 0;

    function queue() {
        if (i >= images.length) return;

        const img = new Image();
        img.src = images[i++];

        setTimeout(queue, 15);
    }

    queue();
    console.log("Preloading DONE");
}

// INIT
initState();
initHeaderMenu();
renderDecks(cards, el.deckContainer);
initZoom(el.img);

// =======================
// NEXT CARD FLOW
// =======================
async function next() {
    if (isTransitioning) return;

    isTransitioning = true;
    setButtonsDisabled(true);

    const result = getNext(getSelectedDecks());
    if (!result) return;

    const newCard = nextCard || result.current;
    nextCard = result.nextCard;

    // 1. Fadeout animation
    await new Promise(r => fadeOut(r));

    // 2. Start skeleton placeholder (delayed to avoid flash)
    const skeletonTimer = setTimeout(() => {
        startLoading();
    }, 120);

    // 3. Set answer text (hidden)
    current = newCard;
    setAnswerText(current);

    // 4. Load image
    const finalSrc = await loadImage(newCard.img);

    // 5. Apply image
    clearTimeout(skeletonTimer);
    setCardImage(finalSrc);
    stopLoading();

    // 6. standard behavior OR skip mode 
    if (finalSrc === PLACEHOLDER) {
        showSkipMode();
    } else {
        showNormalMode();
    }

    // 7. Fadein animation
    await new Promise(r => fadeIn(r));

    // 8. Unlock UI
    isTransitioning = false;
    setButtonsDisabled(false);

    // 9. Preload next (non-blocking)
    if (nextCard?.img) {
        loadImage(nextCard.img);
    }
}

// DECK CHANGE CALLBACK
setDeckChangeCallback(() => {
    // Invalidate next preloaded image
    nextCard = null;

    // recompute next preloaded image
    const result = getNext(getSelectedDecks());
    if (result?.nextCard?.img) {
        nextCard = result.nextCard;

        // preload correct image
        loadImage(nextCard.img);
    }
});

// EVENTS
// SHOW ANSWER BUTTON
el.btnShow.addEventListener("click", () => {
    if (el.card.classList.contains("loading")) return;
    showAnswer();
});

// GRADE BUTTON
el.gradeButtons.addEventListener("click", (e) => {
    if (isTransitioning || !current || el.card.classList.contains("loading")) return;

    const btn = e.target.closest("button");
    if (!btn) return;

    const grade = Number(btn.dataset.grade);

    gradeCard(current, grade);
    next();
});

// SKIP BUTTON
el.btnSkip.addEventListener("click", () => {
    if (isTransitioning) return;

    el.btnSkip.style.display = "none";
    next();
});

// RESET BUTTON
document.getElementById("btnReset").addEventListener("click", () => {
    if (confirm("Reset all progress?")) {
        localStorage.removeItem("cards");
        location.reload();
    }
});

// DOWNLOAD BUTTON
el.btnDownload.addEventListener("click", async () => {
    if (isIos()) {
        alert("Pour installer l'application :\n\n1. Appuyez sur le bouton “Partager”\n2. Puis sur “Ajouter à l'écran d'accueil”");
        return;
    }

    if (!deferredPrompt){
        console.error("could not trigger manual download : deferredPrompt is null")
        alert("Pour installer l'application: Utilisez le menu du navigateur (⋮) Puis “Ajouter à l'écran d'accueil”")
        return;
    }

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    deferredPrompt = null;
});


// START
next();