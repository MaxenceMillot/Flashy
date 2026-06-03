export function generateToast(type, text, timeout=0, closebutton=false){
    if (document.querySelector(`.toast.${type}`)) {
        return;
    }

    let toast = document.createElement("div");
    if(type){
        toast.className = `${type} toast`;
    }else{
        toast.className = "toast";
    }

    toast.innerHTML = `
        <span>${text}</span>
    `;
    
    if(closebutton){
        toast.innerHTML += `
            <div class="toast-actions">
                <button id="dismiss">✕</button>
            </div>
        `;
        document.getElementById("dismiss")
            .addEventListener("click", () => {
                toast.remove();
            });
    }
    document.body.appendChild(toast);

    if(timeout>0){
        setTimeout(() => {
                toast.remove();
            }, timeout);
    }
}

export async function showUpdateToast(worker) {
    if (document.querySelector(".update-toast")) return;
    const newVersion = await getAppVersion();
    let toast = document.createElement("div");
    toast.className = "update-toast toast";

    toast.innerHTML = `
        <span>Mise à jour disponible (v${newVersion})</span>
        <div class="toast-actions">
            <button id="refreshApp">Activer</button>
            <button id="dismissUpdate">✕</button>
        </div>
    `;

    document.body.appendChild(toast);

    document.getElementById("refreshApp")
        .addEventListener("click", () => {
            sessionStorage.setItem("updating-app", "true");

            toast.classList.add("updating");
            toast.innerHTML = `
                <span>⏳ Activation</span>
            `;

            navigator.serviceWorker.getRegistration()
                .then((registration) => {

                    if (!registration?.waiting) {
                        sessionStorage.removeItem("updating-app");
                        window.location.reload();
                        return;
                    }

                    registration.waiting.postMessage("SKIP_WAITING");
                });
        });

    document.getElementById("dismissUpdate")
        .addEventListener("click", () => {
            toast.remove();
        });
}