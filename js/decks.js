export const SELECTED_DECKS_STORAGE_KEY = "flashy-selected-decks";
const deckNames = {
    flowers: "Fleurs & Plantes",
    orchids: "Orchidées",
    foliages: "Feuillages"
};
const deckConfig = {
    flowers: {
        label: "Fleurs & Plantes",
        icon: "flower-2"
    },
    orchids: {
        label: "Orchidées",
        icon: "sprout"
    },
    foliages: {
        label: "Feuillages",
        icon: "leaf"
    }
};

let selectedDecks = new Set();
let onDeckChange = null;

export function getDeckLabel(deck) {
    return deckNames[deck] || deck;
}

export function getSelectedDecks() {
    return Array.from(selectedDecks);
}

export function setDeckChangeCallback(cb) {
    onDeckChange = cb;
}

export function initDeckSelector(cards, container){
    const savedDecks = loadSelectedDecks();
    const decks = [...new Set(cards.map(c => c.deck))];

    // Keep decks that still exist
    selectedDecks = new Set(
        [...savedDecks].filter(deck => decks.includes(deck))
    );
    // Fallback if nothing valid remains
    if (selectedDecks.size === 0) {
        selectedDecks = new Set([decks[0]]);
        saveSelectedDecks();

    }

    container.innerHTML = "";

    decks.forEach((deck) => {
        const chip = document.createElement("button");
         // Only first chip is "selected"
        chip.className = selectedDecks.has(deck)
            ? "chip selected"
            : "chip";
        chip.dataset.deck = deck;

        const config = deckConfig[deck] || { label: deck, icon: "tag" };

        chip.innerHTML = `
            <i data-lucide="${config.icon}" class="chip-icon"></i>
            <span>${config.label}</span>
        `;

        chip.addEventListener("click", () => {
            toggleDeck(deck, chip);
        });

        container.appendChild(chip);
    });

    lucide.createIcons();

    updateStateUI();

    requestAnimationFrame(() => {
        updateDeckScrollbar(container);
    });
}

export function updateDeckScrollbar(container) {
    const isScrollable = container.scrollWidth > container.clientWidth;
    container.classList.toggle("scrollable", isScrollable);
}

function toggleDeck(deck, chip) {
    // Prevent removing last remaining deck
    if (selectedDecks.size === 1 && selectedDecks.has(deck)) {
        return;
    }

    if (selectedDecks.has(deck)) {
        selectedDecks.delete(deck);
        chip.classList.remove("selected");
    } else {
        selectedDecks.add(deck);
        chip.classList.add("selected");
        
         // Center selected chip
        chip.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
        });
    }

    saveSelectedDecks();
    updateStateUI();

    if (onDeckChange) {
        onDeckChange([...selectedDecks]);
    }
}

function saveSelectedDecks() {
    localStorage.setItem(
        SELECTED_DECKS_STORAGE_KEY,
        JSON.stringify([...selectedDecks])
    );
}

function loadSelectedDecks() {
    try {
        return new Set(
            JSON.parse(localStorage.getItem(SELECTED_DECKS_STORAGE_KEY) || "[]")
        );
    } catch {
        return new Set();
    }
}

function updateStateUI() {
    const chips = document.querySelectorAll(".deck-filters .chip");

    chips.forEach(chip => {
        const deck = chip.dataset.deck;

        // Disable if it's the last selected
        if (selectedDecks.size === 1 && selectedDecks.has(deck)) {
            chip.classList.add("disabled");
        } else {
            chip.classList.remove("disabled");
        }
    });

    const deckContainer = document.getElementById("deckContainer");

    if (deckContainer) {
        updateDeckScrollbar(deckContainer);
    }
}