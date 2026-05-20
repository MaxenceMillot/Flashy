import { cards as baseCards } from "../data/cards.js";

export let cards = [];

// Increment data scheme breaking updates
// WARNING : delete user progression (which is tied to every card as of v1.0.0)
const SCHEME_VERSION = "1"; 
// Increment on BREAKING changes for extended cache clear
// WARNING : 
const BREAKING_VERSION = "1"; 

export async function initState(){
    // Reset cache/localStorage TRAGETED entries 
    // on breaking versions (from SCHEME_VERSION and BREAKING_VERSION)
    await conditionalReset();

    const saved = null;
    try {
        saved = JSON.parse(localStorage.getItem("cards") || "null");
    } catch {
        // Failsafe to avoid corrupted data
        localStorage.removeItem("cards");
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
    localStorage.setItem("cards", JSON.stringify(cards));
}

async function conditionalReset(){    
    // HARD RESET MIGRATION
    const savedBreaking = localStorage.getItem("flashy-breaking-version");

    if (savedBreaking !== BREAKING_VERSION) {
        // Delete TARGETED caches
        if ("caches" in window) {
            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(key => key.startsWith("flashy-v"))
                    .map(key => caches.delete(key))
            );
        }

        // Save migration version
        localStorage.setItem(
            "flashy-breaking-version",
            BREAKING_VERSION
        );

        // Short timer to ensure cache is cleared before reload
        await new Promise(resolve => setTimeout(resolve, 100));

        window.location.reload();
        return;
    }

    // SCHEME DATA RESET
    const savedVersion = localStorage.getItem("flashy-scheme-version");

    if (savedVersion !== SCHEME_VERSION) {
        localStorage.removeItem("cards");

        localStorage.setItem(
            "flashy-scheme-version",
            SCHEME_VERSION
        );

        window.location.reload();
    }
}