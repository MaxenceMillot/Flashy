import { initState, cards } from "./state.js";
import { getNext, gradeCard } from "./scheduler.js";
import { render, showAnswer, fadeOutIn, el } from "./ui.js";
import { renderDecks, getSelectedDecks } from "./decks.js";
import { initZoom } from "./zoom.js";

let current = null;
let nextCard = null;

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service_worker.js")
        .then(() => console.log("Service Worker registered"))
        .catch(err => console.error("SW registration failed:", err));
}

// INIT
initState();
renderDecks(cards, el.deckContainer);
initZoom(el.img);

function next(){
    fadeOutIn(() => {
        const result = getNext(getSelectedDecks());
        if(!result) return;

        current = result.current;
        nextCard = result.nextCard;

        render(current);
    });
}

// EVENTS
el.btnShow.addEventListener("click", showAnswer);

el.gradeButtons.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if(!btn) return;

    const grade = Number(btn.dataset.grade);

    gradeCard(current, grade);
    next();
});

document.getElementById("resetBtn").addEventListener("click", () => {
    if(confirm("Reset all progress?")){
        localStorage.removeItem("cards");
        location.reload();
    }
});

// START
next();