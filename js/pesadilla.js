/* pesadilla.js · Sala 3 (ACS-cd) · Comportamientos "sobrenaturales"
   La sala funciona igual sin este archivo: todo lo de aquí es un extra.
   Para probar sin esperar: index.html?hora=3 (hora maldita) · index.html?susto=1 (destello seguro). */
(() => {
    "use strict";

    const raiz = document.documentElement;
    const parametros = new URLSearchParams(location.search);
    const calma = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const enPergamino = document.body.classList.contains("pergamino");
    const $ = (id) => document.getElementById(id);

    // localStorage puede fallar (modo privado, file://...): nunca rompemos la página por eso
    const memoria = {
        leer(clave) { try { return localStorage.getItem(clave); } catch { return null; } },
        guardar(clave, valor) { try { localStorage.setItem(clave, valor); } catch { /* sin memoria */ } }
    };

    /* ── 1. Cuenta tus visitas ── */
    let visitas = parseInt(memoria.leer("morgue-visitas"), 10) || 0;
    if (!enPergamino) {
        visitas += 1;
        memoria.guardar("morgue-visitas", String(visitas));
        const marcador = $("visitas");
        if (marcador) {
            marcador.textContent = visitas === 1
                ? "Es tu primera visita. Él ya te estaba esperando."
                : visitas === 2
                    ? "Has vuelto. Sabía que volverías."
                    : `Es la ${visitas}.ª vez que entras. Él lleva la cuenta. Tú ya no.`;
        }
    }
    // En el registro, a partir de la segunda visita, tu nombre ya se ve
    if (enPergamino && visitas >= 2) raiz.classList.add("registrado");

    if (enPergamino) return; // el resto solo tiene sentido en la sala

    /* ── 2. Sabe qué hora es ── */
    const ahora = new Date();
    const hora = parametros.has("hora") ? parseInt(parametros.get("hora"), 10) % 24 : ahora.getHours();
    const reloj = `${String(hora).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
    const avisoHora = $("hora");
    if (avisoHora) {
        if (hora === 3) avisoHora.textContent = `Son las ${reloj}. Es su hora. No tenías que entrar ahora.`;
        else if (hora >= 22 || hora < 6) avisoHora.textContent = `Son las ${reloj}. Deberías estar durmiendo. Él no duerme.`;
        else avisoHora.textContent = `Son las ${reloj}. Ahí fuera aún es de día. Aquí dentro siempre son las 3:00.`;
    }
    if (hora === 3) {
        raiz.classList.add("hora-maldita");
        const titulo = document.querySelector("header h1");
        if (titulo) titulo.textContent = "Bienvenido a casa";
    }

    /* ── 3. La pestaña te llama cuando te vas ── */
    const tituloOriginal = document.title;
    const llamadas = ["Vuelve.", "¿Por qué te has ido?", "Te estoy esperando.", "Sé dónde estás.", "No mires atrás.", "Ya estoy aquí."];
    let llamada;
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            let i = 0;
            document.title = llamadas[0];
            llamada = setInterval(() => {
                i = Math.min(i + 1, llamadas.length - 1);
                document.title = llamadas[i];
            }, 3500);
        } else {
            clearInterval(llamada);
            document.title = "Has vuelto.";
            setTimeout(() => { document.title = tituloOriginal; }, 2500);
            cambiarUnTexto(); // mientras no mirabas, algo ha cambiado
        }
    });

    /* ── 4. Los textos cambian cuando dejas de mirarlos ── */
    const pendientes = new Set(document.querySelectorAll("[data-despues]"));
    function cambiar(el) {
        if (!pendientes.has(el)) return;
        pendientes.delete(el);
        el.textContent = el.dataset.despues;
    }
    function cambiarUnTexto() {
        // Solo cambia uno que esté fuera de la pantalla: nunca lo ves cambiar
        for (const el of pendientes) {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > innerHeight) { cambiar(el); return; }
        }
    }
    if ("IntersectionObserver" in window) {
        const vistos = new WeakSet();
        const observador = new IntersectionObserver((entradas) => {
            for (const e of entradas) {
                if (e.isIntersecting) vistos.add(e.target);
                else if (vistos.has(e.target)) { cambiar(e.target); observador.unobserve(e.target); }
            }
        });
        pendientes.forEach((el) => observador.observe(el));
    }

    /* ── 5. La incidencia #0317 cuenta el tiempo que llevas aquí ── */
    const hace = $("hace");
    if (hace) {
        const inicio = Date.now();
        setInterval(() => {
            const min = Math.floor((Date.now() - inicio) / 60000);
            hace.textContent = min === 0 ? "Hace 0 minutos." : min === 1 ? "Hace 1 minuto. Sigues aquí." : `Hace ${min} minutos. ¿Por qué sigues aquí?`;
        }, 5000);
    }

    /* ── 6. Los ojos de la oscuridad te siguen ── */
    const ojos = document.querySelector(".ojos");
    if (ojos) {
        addEventListener("pointermove", (e) => {
            const r = ojos.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy) || 1;
            ojos.style.setProperty("--px", `${(dx / d) * 4}px`);
            ojos.style.setProperty("--py", `${(dy / d) * 2.5}px`);
        }, { passive: true });
    }

    /* ── 7. El botón «Entrar» huye del ratón ── */
    const boton = $("entrar");
    if (boton) {
        let x = 0, y = 0, huidas = 0;
        const frases = { 4: "No", 8: "Déjame", 12: "Para", 16: "Vale. Pulsa." };
        addEventListener("pointermove", (e) => {
            if (huidas >= 16) return; // se cansa de huir
            const r = boton.getBoundingClientRect();
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            if (Math.hypot(e.clientX - cx, e.clientY - cy) > 95) return;
            const angulo = Math.atan2(cy - e.clientY, cx - e.clientX) + (Math.random() - 0.5) * 1.2;
            const margen = Math.max(0, boton.parentElement.clientWidth / 2 - r.width);
            x = Math.max(-margen, Math.min(margen, x + Math.cos(angulo) * 150));
            y = Math.max(-60, Math.min(60, y + Math.sin(angulo) * 70));
            boton.style.transform = `translate(${x}px, ${y}px)`;
            huidas += 1;
            if (frases[huidas]) boton.textContent = frases[huidas];
        }, { passive: true });
        boton.addEventListener("click", () => {
            boton.textContent = "Demasiado tarde";
            boton.disabled = true;
            const tras = $("tras-boton");
            if (tras) tras.hidden = false;
            raiz.classList.add("ha-entrado");
        });
    }

    /* ── 8. Si te quedas quieto, te pregunta ── */
    const susurro = document.createElement("div");
    susurro.className = "susurro";
    susurro.setAttribute("aria-hidden", "true");
    document.body.append(susurro);
    const frasesQuieto = ["¿Sigues ahí?", "No te muevas. Así no te ve.", "Está detrás de la pantalla.", "Respira más bajo."];
    let quieto, vecesQuieto = 0;
    const reiniciarQuieto = () => {
        clearTimeout(quieto);
        susurro.classList.remove("visible");
        quieto = setTimeout(() => {
            susurro.textContent = frasesQuieto[vecesQuieto % frasesQuieto.length];
            vecesQuieto += 1;
            susurro.classList.add("visible");
        }, 35000);
    };
    ["pointermove", "keydown", "scroll", "touchstart"].forEach((ev) => addEventListener(ev, reiniciarQuieto, { passive: true }));
    reiniciarQuieto();

    /* ── 9. Un destello que casi nadie ve ── */
    if (calma) return;
    const forzado = parametros.has("susto");
    if (!forzado && Math.random() > 0.12) return; // ~1 de cada 8 visitas
    const destello = document.createElement("div");
    destello.className = "destello";
    destello.setAttribute("aria-hidden", "true");
    // Cara dibujada en SVG: ojos vacíos y una sonrisa demasiado ancha
    destello.innerHTML = `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <defs><radialGradient id="piel" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#e9e4d4"/><stop offset="1" stop-color="#5a5446"/></radialGradient></defs>
        <ellipse cx="100" cy="125" rx="72" ry="105" fill="url(#piel)"/>
        <ellipse cx="70" cy="105" rx="17" ry="24" fill="#000"/><ellipse cx="130" cy="105" rx="17" ry="24" fill="#000"/>
        <circle cx="72" cy="108" r="2.5" fill="#fff"/><circle cx="128" cy="108" r="2.5" fill="#fff"/>
        <path d="M38 165 Q100 235 162 165 Q100 200 38 165Z" fill="#000"/>
        <path d="M52 172 L58 182 L64 176 L70 188 L78 180 L86 192 L94 182 L100 194 L106 182 L114 192 L122 180 L130 188 L136 176 L142 182 L148 172" fill="none" stroke="#ddd6c1" stroke-width="2"/>
    </svg>`;
    document.body.append(destello);
    let audio;
    addEventListener("pointerdown", () => { try { audio ??= new AudioContext(); } catch { /* sin sonido */ } }, { once: true });
    const espera = forzado ? 3000 : 25000 + Math.random() * 60000;
    setTimeout(() => {
        destello.classList.add("visible");
        if (audio) chirrido(audio);
        setTimeout(() => destello.classList.remove("visible"), 110);
    }, espera);

    // Golpe de ruido blanco con un tono grave debajo (solo si ya has hecho clic: el navegador no deja sonar antes)
    function chirrido(ctx) {
        const dur = 0.35;
        const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const datos = buffer.getChannelData(0);
        for (let i = 0; i < datos.length; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / datos.length);
        const ruido = ctx.createBufferSource();
        ruido.buffer = buffer;
        const tono = ctx.createOscillator();
        tono.type = "sawtooth";
        tono.frequency.setValueAtTime(70, ctx.currentTime);
        tono.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + dur);
        const volumen = ctx.createGain();
        volumen.gain.setValueAtTime(0.5, ctx.currentTime);
        volumen.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        ruido.connect(volumen);
        tono.connect(volumen);
        volumen.connect(ctx.destination);
        ruido.start();
        tono.start();
        tono.stop(ctx.currentTime + dur);
    }
})();
