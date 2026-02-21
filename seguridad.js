// seguridad.js
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * Muestra la tarjeta de expulsión y redirige al login tras 10 segundos
 * @param {HTMLElement} contenedor - El elemento donde se insertará el mensaje (main-content)
 * @param {Object} auth - La instancia de Firebase Auth
 */
export function mostrarExpulsion(contenedor, auth) {
  let seg = 10;

  contenedor.innerHTML = `
    <div class="expulsion-card">
      <h3>🚫 Sesión en uso</h3>
      <p>Se ha detectado que alguien más ingresó a tu cuenta desde otro dispositivo.</p>
      <div class="aviso-importante">
        ⚠️ <strong>Recuerda:</strong> Por seguridad, el acceso está permitido a <b>un solo dispositivo a la vez</b>.
      </div>
      <p style="margin-top:20px; font-size:1.1rem; color:#fff;">
        Cerrando sesión en <span id="segundos-restantes" style="font-weight:bold; color:#e63946; font-size:1.5rem;">10</span> segundos...
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