// js/seguridad.js
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ══════════════════════════════════════════════════════
//  CÓMO FUNCIONA EL CONTROL DE 1 DISPOSITIVO:
//
//  En Firestore guardamos:  { deviceId, claimedAt (ms) }
//
//  Al entrar a cualquier página protegida:
//  1. Leemos el documento actual.
//  2. Si el deviceId ya es el nuestro → solo actualizamos claimedAt y escuchamos.
//  3. Si el deviceId es de OTRO dispositivo:
//       → Sobreescribimos con nuestro deviceId (reclamamos la sesión).
//       → El otro dispositivo, al escuchar el cambio, se expulsa.
//  4. Si en algún momento el doc cambia y el deviceId ya no es el nuestro → expulsión.
// ══════════════════════════════════════════════════════

// ── ID único y persistente por navegador / pestaña ──
export const getDeviceId = () => {
    // Usamos sessionStorage para que cada pestaña sea el mismo "dispositivo"
    // pero distintos navegadores/dispositivos sean distintos.
    let id = localStorage.getItem("rip_deviceId");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("rip_deviceId", id);
    }
    return id;
};

// ── Pantalla de expulsión ──
export function manejarExpulsion(contenedor, auth) {
    if (!contenedor) return;
    contenedor.innerHTML = `
        <div class="expulsion-card">
            <h3 style="color:#e50914;font-size:1.5rem;margin-bottom:12px;">🚫 Sesión desplazada</h3>
            <p style="color:#ccc;">Tu cuenta fue abierta en otro dispositivo o navegador.</p>
            <div class="aviso-importante" style="margin:18px 0;">
                ⚠️ <strong>Recuerda:</strong> Solo se permite <b>un dispositivo activo</b> por cuenta a la vez.
            </div>
            <p style="color:#fff;font-size:1rem;">
                Cerrando sesión en <span id="seg-cuenta" style="color:#e50914;font-weight:700;">10</span>s...
            </p>
        </div>`;

    let seg = 10;
    const t = setInterval(async () => {
        seg--;
        const el = document.getElementById("seg-cuenta");
        if (el) el.textContent = seg;
        if (seg <= 0) {
            clearInterval(t);
            await signOut(auth);
            window.location.href = "index.html";
        }
    }, 1000);
}

// ── Vigilancia activa ──
export function vigilarSesion(auth, db, contenedorId) {
    const deviceId = getDeviceId();
    let unsub = null;
    let expulsado = false;

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            if (!window.location.pathname.includes("index.html"))
                window.location.href = "index.html";
            return;
        }

        const sessionRef = doc(db, "sessions", user.uid);

        // ── RECLAMAR la sesión (siempre que llegamos a una página) ──
        // Esto es lo que expulsa al dispositivo anterior:
        // cuando PC escribe su deviceId, el Celular lo detecta y se expulsa.
        try {
            await setDoc(sessionRef, {
                deviceId,
                claimedAt: Date.now()
            }); // SIN merge:true → sobreescritura completa, eso es lo que expulsa
        } catch (e) {
            console.warn("No se pudo reclamar sesión:", e);
        }

        // ── ESCUCHAR cambios en tiempo real ──
        if (unsub) unsub();
        unsub = onSnapshot(sessionRef, (snap) => {
            if (expulsado || !snap.exists()) return;
            const data = snap.data();
            // Si el deviceId cambió y ya no es el nuestro → alguien más reclamó → expulsión
            if (data.deviceId && data.deviceId !== deviceId) {
                expulsado = true;
                if (unsub) { unsub(); unsub = null; }
                const wrapper = document.getElementById(contenedorId);
                manejarExpulsion(wrapper, auth);
            }
        }, (err) => {
            console.warn("Error listener sesión:", err);
        });
    });
}

// ── Cerrar sesión ──
export async function globalLogout(auth) {
    await signOut(auth);
    window.location.href = "index.html";
}
