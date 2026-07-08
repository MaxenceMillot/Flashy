import { cards, save } from "./state.js";

let lastCard = null;
let recentSpecies = [];
const RECENT_BUFFER_SIZE = 3;

export function setLastCard(card = null){
    lastCard = card;
}

export function getScheduledCards(selectedDecks, reservedCard = null){
    const now = Date.now();

    let pool = cards.filter(c =>
        selectedDecks.includes(c.deck) && c.due <= now
    );

    if(pool.length === 0){
        pool = cards.filter(c => selectedDecks.includes(c.deck));
    }

    if(pool.length === 0) return null;

    // Avoid recently shown species AND last shown card
    let available = pool.filter(
        c => !recentSpecies.includes(
            c.text.trim().toLowerCase()
        ) &&
        c.id !== lastCard?.id &&
        c.id !== reservedCard?.id
    );

    // Fallback if pool becomes too small
    if (available.length <= 3) {
        available = pool.filter(
            c =>
                c.id !== lastCard?.id &&
                c.id !== reservedCard?.id
        );

        if (available.length === 0) {
            available = pool;
        }
    }

    const current = available[Math.floor(Math.random() * available.length)];
    const preloadPool = available.filter(
        c =>
            c.id !== current.id &&
            c.id !== lastCard?.id &&
            c.id !== reservedCard?.id
    );
    const preload = preloadPool.length > 0
        ? preloadPool[Math.floor(Math.random() * preloadPool.length)]
        : current;

    return {current, nextCard: preload};
}

export function gradeCard(card, q){
    if(q <= 2){
        card.repetitions = 0;
        card.interval = 1;
    }
    else if(q === 3){
        card.repetitions = Math.max(0, card.repetitions - 1);
        card.interval = 1;
    }
    else if(q === 5){
        card.repetitions++;
        if(card.repetitions === 1) card.interval = 2;
        else if(card.repetitions === 2) card.interval = 6;
        else card.interval = Math.round(card.interval * card.EF * 1.2);
    }

    card.EF = card.EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02));
    if(card.EF < 1.3) card.EF = 1.3;

    card.due = Date.now() + card.interval * 86400000;

    save();
}

export function rememberShownCard(card) {
    recentSpecies.push(card.text.trim().toLowerCase());

    while (recentSpecies.length > RECENT_BUFFER_SIZE) {
        recentSpecies.shift();
    }
}