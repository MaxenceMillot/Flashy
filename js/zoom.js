export function initZoom(imgElement){
    const overlay = document.createElement("div");
    overlay.className = "zoom-overlay";

    const zoomImg = document.createElement("img");

    overlay.appendChild(zoomImg);
    document.body.appendChild(overlay);

    imgElement.addEventListener("click", () => {
        const src = imgElement.src;
        if(!src || src.includes("placeholder")) return;

        zoomImg.src = src;

        if(src.toLowerCase().endsWith(".png")){
            zoomImg.classList.add("has-bg");
        } else {
            zoomImg.classList.remove("has-bg");
        }

        overlay.classList.add("active");
    });

    overlay.addEventListener("click", () => {
        overlay.classList.remove("active");
    });
}