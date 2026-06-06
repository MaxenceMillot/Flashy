import { initState, cards, DATA_CARDS_STORAGE_KEY } from "./state.js";
import { setLastCard, getScheduledCards, gradeCard, rememberShownCard } from "./scheduler.js";
import { loadImage, preloadAllImages, PLACEHOLDER } from "./imageLoader.js";
import { initHeaderMenu, initCardMenu, setDateInFooter, setAnswerText, setCardImage, startLoading, stopLoading, showAnswer, showNormalMode, showSkipMode, cardFadeOut, cardFadeIn, el } from "./ui.js";
import { initDeckSelector, getSelectedDecks, setDeckChangeCallback, updateDeckScrollbar } from "./decks.js";
import { initZoom } from "./zoom.js";
import { isInStandaloneMode, getBrowserInfo, isIos, getOSInfo, multiClick } from "./utilities.js";
import { initVersion, setVersionInFooter, getAppVersion, getCurrentVersion, registerServiceWorker, checkForUpdate, INSTALLED_VERSION_STORAGE_KEY } from "./versionManager.js";
import { generateToast } from "./toaster.js";

let current = null;
let nextCard = null;
let isTransitioning = false;
let deferredPrompt = null;
const isInStandalone = isInStandaloneMode();

// Prevent automatic prompt to install PWA app
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();

    // Save it for later
    deferredPrompt = e;
});

// REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
    registerServiceWorker();
}

// LOAD ICONS FROM LIBRARY
lucide.createIcons();

// AFTER 5s PRELOAD ALL IMAGES IF PWA
setTimeout(() => {
    if (isInStandalone) {
        console.log("Preloading all images...");
        preloadAllImages();
    }
}, 5000);

// INIT
(async () => {
    await initState();
    initHeaderMenu();
    initCardMenu();
    setDateInFooter();
    initDeckSelector(cards, el.deckContainer);
    initZoom(el.img);
    initEventListeners();
    
    await initVersion();
    setVersionInFooter();

    // START the app
    await nextCardFlow();
})();

// =======================
// NEXT CARD FLOW
// =======================
async function nextCardFlow() {
    if (isTransitioning) return;
    isTransitioning = true;

    try{
        const scheduledCards = getScheduledCards(getSelectedDecks(), nextCard);
        if (!scheduledCards) {
            console.warn("No scheduled cards available");
            return;
        }

        const newCard = nextCard || scheduledCards.current;
        nextCard = scheduledCards.nextCard;

        // 1. Fadeout animation
        await new Promise(r => cardFadeOut(r));

        // 2. Start skeleton placeholder (delayed to avoid flash)
        const skeletonTimer = setTimeout(() => {
            startLoading();
        }, 80);

        // 3. Set answer text (hidden)
        current = newCard;
        setAnswerText(current);

        // 4. Add current card to scheduler buffer
        rememberShownCard(current);

        // 5. Set current card id to scheduler (to avoid showing it twice)
        setLastCard(current)
        
        // 6. card fade in animation
        setTimeout(() => {
            new Promise(r => cardFadeIn(r));
        }, 80);

        // 7. Load image
        const finalSrc = await loadImage(newCard.img);

        // 8. Apply image
        clearTimeout(skeletonTimer);
        setTimeout(() => {
            setCardImage(finalSrc);
            stopLoading();
        }, 80);

        // 9. standard behavior OR skip mode 
        if (finalSrc === PLACEHOLDER) {
            showSkipMode();
        } else {
            showNormalMode();
        }

        // 10. Preload next (non-blocking)
        if (nextCard?.img) {
            loadImage(nextCard.img);
        }
    } catch(error) {
        console.error("nextCardFlow crashed:", error);
        stopLoading();
        showSkipMode();
    } finally {
        // 11. Unlock UI
        isTransitioning = false;
    }
}

// DECK CHANGE CALLBACK (reload next image on deck change)
setDeckChangeCallback(() => {
    // Invalidate next preloaded image
    nextCard = null;

    // recompute next preloaded image
    const scheduledCards = getScheduledCards(getSelectedDecks());
    if (scheduledCards?.nextCard?.img) {
        nextCard = scheduledCards.nextCard;

        // preload correct image
        loadImage(nextCard.img);
    }
});

// HIDDEN RESET BUTTON
multiClick(document.getElementById("appVersion"), () => {
    if (confirm("Reset all progress?")) {
        localStorage.removeItem(DATA_CARDS_STORAGE_KEY);
        location.reload();
    }
});

// =======================
// INIT EVENT LISTENERS
// =======================
function initEventListeners() {
    // HIDE DOWNLOAD BUTTON IN STANDALONE (PWA)
    if(isInStandalone){
        el.btnDownload.style.display = "none";
    }
    
    // "SHOW ANSWER" BUTTON
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
        nextCardFlow();
    });

    // SKIP BUTTON
    el.btnSkip.addEventListener("click", () => {
        if (isTransitioning) return;

        el.btnSkip.style.display = "none";
        nextCardFlow();
    });


    // REPORT BUG BUTTON
    el.btnReportBug.addEventListener("click", (e) => {
        e.preventDefault();

        let browser = getBrowserInfo();
        let reportBugFormId = "RGkL9P";
        let os = getOSInfo();

        Tally.openPopup(reportBugFormId, {
            layout: "modal",
            width: 376,
            hideTitle: true,
            overlay: true,
            emoji: {
                text: "🪲",
                animation: "none",
            },
            autoClose: 0,
            onSubmit: (payload) => {
                generateToast("submit-report-toast", "Merci pour votre retour ❤️", 3000, false);
                el.cardMenu.classList.remove("open");
                el.cardDropdown.classList.remove("open");
            },
            hiddenFields: {
                app_version: getCurrentVersion(),
                card_id: current?.id || "unknown",
                card_image_link: current?.img || "unknown",
                browser_name: browser.name,
                browser_version: browser.version,
                is_standalone: window.matchMedia("(display-mode: standalone)").matches,
                os_name: os.name,
                os_version: os.version,
                screen_size: `${innerWidth}x${innerHeight}`,
                language: navigator.language || "unknown"
            }
        });
    });

    // REPORT CARD BUTTON
    el.btnReportCard.addEventListener("click", (e) => {
        e.preventDefault();
        let reportCardFormId = "Bz0BMe";

        Tally.openPopup(reportCardFormId, {
            layout: "modal",
            width: 376,
            hideTitle: true,
            overlay: true,
            emoji: {
                text: "🔎",
                animation: "none",
            },
            autoClose: 0,
            onSubmit: (payload) => {
                generateToast("submit-report-toast", "Merci pour votre retour ❤️", 3000);
                el.cardMenu.classList.remove("open");
                el.cardDropdown.classList.remove("open");
            },
            hiddenFields: {
                app_version: getCurrentVersion(),
                card_id: current?.id || "unknown",
                card_image_link: current?.img || "unknown",
            }
        });
    });

    // DOWNLOAD BUTTON
    el.btnDownload.addEventListener("click", async () => {
        if (isIos()) {
            alert("Pour installer l'application :\n\n1. Appuyez sur le bouton “Partager”\n2. Puis sur “Ajouter à l'écran d'accueil”");
            return;
        }

        if (!deferredPrompt){
            console.warn("could not trigger manual download : deferredPrompt is null")
            alert("Pour installer l'application : utilisez le menu du navigateur ( ⋮ ) puis “Ajouter à l'écran d'accueil”")
            return;
        }

        await deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        deferredPrompt = null;
    });

    window.addEventListener("resize", () =>  {
        updateDeckScrollbar(el.deckContainer)
    });

    // When user comes back to tab
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            checkForUpdate();
        }
    });

    // Reload when new SW controls page
    navigator.serviceWorker.addEventListener("controllerchange", async () => {
        const isUpdating = sessionStorage.getItem("updating-app") === "true";

        if (!isUpdating) return;

        sessionStorage.removeItem("updating-app");

        // save newly ACTIVE version
        const latestVersion = await getAppVersion();
        localStorage.setItem(
            INSTALLED_VERSION_STORAGE_KEY,
            latestVersion
        );

        window.location.reload();
    });
}