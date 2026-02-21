// seguridad.js
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export function manejarExpulsion(contenedor, auth) {
    let seg = 10;
    contenedor.innerHTML = `
        <div class="expulsion-card">
            <h3>🚫 Sesión en uso</h3>
            <p>Se ha detectado que alguien más ingresó a tu cuenta desde otro dispositivo.</p>
            <div class="aviso-importante">
                ⚠️ <strong>Recuerda:</strong> Por seguridad, el acceso está permitido a <b>un solo dispositivo a la vez</b>.
            </div>
            <p style="margin-top:20px; font-size:1.1rem; color:#fff;">
                Cerrando sesión en <span id="segundos-restantes">10</span> segundos...
            </p>
        </div>
    `;
    
    const t = setInterval(async () => {
        seg--;
        const span = document.getElementById("segundos-restantes");
        if (span) span.innerText = seg;
        if (seg <= 0) {
            clearInterval(t);
            await signOut(auth);
            window.location.href = "index.html";
        }
    }, 1000);
}

export async function globalLogout(auth) {
    await signOut(auth);
    window.location.href = "index.html";
}