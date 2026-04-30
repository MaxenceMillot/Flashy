export function renderDecks(cards, container){
    const decks = [...new Set(cards.map(c => c.deck))];

    container.innerHTML = "";

    decks.forEach(deck => {
        const label = document.createElement("label");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = deck;
        input.checked = true;

        input.addEventListener("change", updateState);

        label.appendChild(input);
        label.append(" " + getDeckLabel(deck));

        container.appendChild(label);
    });

    updateState();
}

const deckNames = {
    flowers: "Fleurs & Plantes",
    orchids: "Orchidées",
    foliages: "Feuillage"
};

export function getDeckLabel(deck) {
    return deckNames[deck] || deck;
}

function updateState(){
    const boxes = document.querySelectorAll(".decks input");
    const checked = [...boxes].filter(b => b.checked);

    boxes.forEach(b => b.disabled = false);

    if(checked.length === 1){
        checked[0].disabled = true;
    }
}

export function getSelectedDecks(){
    return [...document.querySelectorAll(".decks input")]
        .filter(b => b.checked)
        .map(b => b.value);
}