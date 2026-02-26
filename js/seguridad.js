// ── Vigilar sesión en páginas protegidas ──
export function vigilarSesion(auth, db, contenedorId) {
    const deviceId = getDeviceId();
    const tiempoCargaPagina = Date.now(); // Marca de tiempo al cargar
    let unsub = null;
    let expulsado = false;

    auth.onAuthStateChanged((user) => {
        if (!user) {
            if (!window.location.pathname.includes("index.html"))
                window.location.href = "index.html";
            return;
        }

        const sessionRef = doc(db, "sessions", user.uid);

        if (unsub) { unsub(); unsub = null; }

        unsub = onSnapshot(sessionRef, (snap) => {
            if (expulsado) return;
            if (!snap.exists()) return;

            const data = snap.data();

            // EXPLICACIÓN DEL FIX:
            // 1. Verificamos que el ID sea distinto.
            // 2. Verificamos que el cambio en Firestore sea RECIENTE (posterior a nuestra carga).
            // Esto evita que el dispositivo nuevo se expulse a sí mismo con datos viejos.
            const esOtroDispositivo = data.deviceId && data.deviceId !== deviceId;
            const esCambioNuevo = data.claimedAt && data.claimedAt > tiempoCargaPagina;

            if (esOtroDispositivo && esCambioNuevo) {
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