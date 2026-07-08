import { cards as baseCards } from "../data/cards.js";
import { SELECTED_DECKS_STORAGE_KEY } from "./decks.js";

const BREAKING_VERSION_STORAGE_KEY = "flashy-breaking-version";
const SCHEME_VERSION_STORAGE_KEY = "flashy-scheme-version";
export const DATA_CARDS_STORAGE_KEY = "flashy-data-cards";

export let cards = [];

// Increment data scheme breaking updates
// WARNING : delete user progression (which is tied to every card as of v1.0.0)
const SCHEME_VERSION = "3"; 
// Increment on BREAKING changes for extended cache clear
// WARNING : 
const BREAKING_VERSION = "1"; 

export async function initState(){
    // Reset cache/localStorage TRAGETED entries 
    // on breaking versions (from SCHEME_VERSION and BREAKING_VERSION)
    await conditionalReset();

    let saved = null;
    try {
        saved = JSON.parse(localStorage.getItem(DATA_CARDS_STORAGE_KEY) || "null");
    } catch {
        // Failsafe to avoid corrupted data
        localStorage.removeItem(DATA_CARDS_STORAGE_KEY);
    }

    if (saved && Array.isArray(saved)) {
        cards = saved;
    } else {
        cards = baseCards.map(c => ({
            ...c,
            EF: 2.5,
            interval: 0,
            repetitions: 0,
            due: 0,
            score: 0
        }));

        save();
    }
}

export function save(){
    localStorage.setItem(DATA_CARDS_STORAGE_KEY, JSON.stringify(cards));
}

async function conditionalReset(){    
    // HARD RESET MIGRATION
    const savedBreaking = localStorage.getItem(BREAKING_VERSION_STORAGE_KEY);

    if (savedBreaking !== BREAKING_VERSION) {
        // Delete TARGETED caches
        // TODO (not needed now)

        // Save migration version
        localStorage.setItem(
            BREAKING_VERSION_STORAGE_KEY,
            BREAKING_VERSION
        );

        // Short timer to ensure cache is cleared before reload
        await new Promise(resolve => setTimeout(resolve, 100));

        window.location.reload();
        return;
    }

    // SCHEME DATA RESET
    const savedVersion = localStorage.getItem(SCHEME_VERSION_STORAGE_KEY);

    if (savedVersion !== SCHEME_VERSION) {
        // Remove data
        localStorage.removeItem(DATA_CARDS_STORAGE_KEY);
        // Remove saved selected chips
        localStorage.removeItem(SELECTED_DECKS_STORAGE_KEY);

        localStorage.setItem(
            SCHEME_VERSION_STORAGE_KEY,
            SCHEME_VERSION
        );

        window.location.reload();
    }
}