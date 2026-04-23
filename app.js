let saved = JSON.parse(localStorage.getItem("cards"));

if (typeof cards === "undefined") {
    alert("cards.js not loaded!");
}

if (saved) {
    cards = saved;
} else {
    cards = cards.map(c => ({
        ...c,
        EF: 2.5,
        interval: 0,
        repetitions: 0,
        due: 0,
        score: 0
    }));
}

// ------------------
let current = null;
let now = Date.now();
let weakMode = false;
let weakPool = [];

// ------------------
function save(){
    localStorage.setItem("cards", JSON.stringify(cards));
}

// ------------------
function goHome(){
    document.getElementById("stats").style.display = "none";
    document.getElementById("study").style.display = "block";
}

// ------------------
function getSelectedDecks(){
    let boxes = document.querySelectorAll(".decks input");
    return [...boxes].filter(b => b.checked).map(b => b.value);
}

// ------------------
function getNext(){
    let pool;

    if(weakMode){
        pool = weakPool.filter(c => c.due <= now);
        if(pool.length === 0) pool = weakPool;
    } else {
        let decks = getSelectedDecks();
        pool = cards.filter(c =>
            decks.includes(c.deck) && c.due <= now
        );
        if(pool.length === 0) pool = cards;
    }

    current = pool[Math.floor(Math.random()*pool.length)];
    render();
}

// ------------------
function render(){
    const card = document.querySelector(".card");
    const answer = document.getElementById("answer");

    answer.classList.remove("show");
    answer.innerText = "";
    answer.style.visibility = "hidden";

    card.classList.remove("show");
    void card.offsetWidth;

    document.getElementById("img").src = current.img;

    setTimeout(() => {
        card.classList.add("show");
    }, 20);
}

// ------------------
function showAnswer(){
    const answer = document.getElementById("answer");
    answer.innerText = current.text;
    answer.style.visibility = "visible";
    answer.classList.add("show");
}

// ------------------
function grade(q){

    // ==========================
    // FUTURE UPGRADE HOOK
    // (2-axis system: correctness + difficulty)
    // ==========================
    /*
    const correctness = (q >= 3); // partial+ = correct-ish
    const effort = q; // 1–5 scale independent

    // later:
    // - separate memory strength
    // - separate retrieval effort
    */

    if(q <= 2){ // Failed
        current.repetitions = 0;
        current.interval = 1;
    }
    else if(q === 3){ // Partial
        current.repetitions = Math.max(0, current.repetitions - 1);
        current.interval = 1;
    }
    else if(q === 4){ // Hard
        current.repetitions++;
        if(current.repetitions === 1) current.interval = 1;
        else if(current.repetitions === 2) current.interval = 4;
        else current.interval = Math.round(current.interval * current.EF);
    }
    else if(q === 5){ // Easy
        current.repetitions++;
        if(current.repetitions === 1) current.interval = 2;
        else if(current.repetitions === 2) current.interval = 6;
        else current.interval = Math.round(current.interval * current.EF * 1.2);
    }

    // ==========================
    // EF UPDATE (SM-2 core)
    // ==========================
    current.EF = current.EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02));
    if(current.EF < 1.3) current.EF = 1.3;

    current.due = Date.now() + current.interval * 86400000;

    save();
    now = Date.now();
    getNext();
}
// ------------------
function startWeakTest(){

    weakPool = [...cards]
        .sort((a,b)=> (a.EF*a.repetitions + a.interval) - (b.EF*b.repetitions + b.interval))
        .slice(0, Math.max(5, Math.floor(cards.length * 0.25)));

    weakMode = true;

    alert("🎯 Weak mode started (" + weakPool.length + " cards)");

    document.getElementById("stats").style.display = "none";
    document.getElementById("study").style.display = "block";

    getNext();
}

// ------------------
function toggleStats(){
    let el = document.getElementById("stats");
    let study = document.getElementById("study");

    if(el.style.display==="block"){
        el.style.display="none";
        study.style.display="block";
    } else {
        study.style.display="none";
        el.style.display="block";
        renderStats();
    }
}

// ------------------
function getScore(c){
    return c.EF * (c.interval+1) - (3 - c.repetitions);
}

// ------------------
function renderStats(){
    let el = document.getElementById("stats");

    let sorted = [...cards].sort((a,b)=>getScore(a)-getScore(b));

    let worst = sorted.slice(0,5);
    let best = sorted.slice(-5).reverse();

    let enriched = cards.map(c => ({
        ...c,
        errorRate: c.repetitions === 0 ? 1 : (1 / c.EF)
    }));

    let mostError = [...enriched].sort((a,b)=>b.errorRate-a.errorRate).slice(0,5);

    el.innerHTML = "<h3>📊 Learning statistics</h3>";

    el.innerHTML += `
    <div class="stat-card">
        <b>How scoring works</b><br><br>
        EF = ease factor<br>
        Interval = days<br>
        Repetitions = success streak<br><br>
        Lower score = harder card
    </div>
    `;

    el.innerHTML += "<h4>🟢 Most known cards</h4>";
    best.forEach(c=>{
        el.innerHTML += `<div class="stat-card"><b>${c.text}</b></div>`;
    });

    el.innerHTML += "<h4>🔴 Most difficult cards</h4>";
    worst.forEach(c=>{
        el.innerHTML += `<div class="stat-card"><b>${c.text}</b></div>`;
    });

    el.innerHTML += "<h4>⚠️ Most error-prone cards</h4>";
    mostError.forEach(c=>{
        el.innerHTML += `<div class="stat-card"><b>${c.text}</b></div>`;
    });
}

// ------------------
function resetProgress(){
    if(!confirm("Reset all progress?")) return;
    localStorage.removeItem("cards");
    location.reload();
}

// ------------------
getNext();

// ------------------
// SWIPE FUNCTIONS
// ------------------
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener("touchend", e => {
    let dx = e.changedTouches[0].screenX - touchStartX;
    let dy = e.changedTouches[0].screenY - touchStartY;

    // horizontal swipe
    if(Math.abs(dx) > Math.abs(dy)){

        if(dx > 50){
            grade(4); // swipe right = good
        }

        if(dx < -50){
            grade(2); // swipe left = hard
        }
    }

    // vertical swipe
    if(dy < -60){
        showAnswer(); // swipe up = reveal
    }
});