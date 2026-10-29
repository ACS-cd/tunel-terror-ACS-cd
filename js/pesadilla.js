/* pesadilla.js · Sala 3 (ACS-cd) · Comportamientos "sobrenaturales"
   La sala funciona igual sin este archivo: todo lo de aquí es un extra.
   Para probar sin esperar: index.html?hora=3 (hora maldita) · ?susto=1 (destello a los 3 s) · ?susto=ver (la cara fija)
   · ?cursor=1 (el segundo cursor aparece a los 3 s). Se pueden combinar: ?susto=1&cursor=1 */
(() => {
    "use strict";

    const raiz = document.documentElement;
    const parametros = new URLSearchParams(location.search);
    const calma = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const enPergamino = document.body.classList.contains("pergamino");
    const enCamara = document.body.classList.contains("otro-lado");
    const $ = (id) => document.getElementById(id);

    // localStorage puede fallar (modo privado, file://...): nunca rompemos la página por eso
    const memoria = {
        leer(clave) { try { return localStorage.getItem(clave); } catch { return null; } },
        guardar(clave, valor) { try { localStorage.setItem(clave, valor); } catch { /* sin memoria */ } }
    };
    let nombre = memoria.leer("morgue-nombre") || "";

    /* ── Páginas secundarias: el registro y la cámara 13 ── */
    let visitas = parseInt(memoria.leer("morgue-visitas"), 10) || 0;
    if (enPergamino) {
        // A partir de la segunda visita, tu nombre ya está en el registro
        if (visitas >= 2) raiz.classList.add("registrado");
        const tu = document.querySelector(".tu .oculto");
        if (tu && nombre) tu.textContent = nombre;
        return;
    }
    if (enCamara) {
        if (nombre) {
            $("etiqueta").textContent = `: «${nombre.toUpperCase()}»`;
            $("registro-tu").textContent = nombre;
        }
        memoria.guardar("morgue-camara13", "1");
        return;
    }

    /* ════════ A partir de aquí, solo la sala (index.html) ════════ */

    /* ── Mensajes en el centro de la pantalla ── */
    const susurro = document.createElement("div");
    susurro.className = "susurro";
    susurro.setAttribute("aria-hidden", "true");
    document.body.append(susurro);
    let finSusurro, temporal = false;
    function susurrar(texto, duracion = 0) {
        clearTimeout(finSusurro);
        susurro.textContent = texto;
        susurro.classList.add("visible");
        temporal = duracion > 0;
        if (temporal) finSusurro = setTimeout(() => { susurro.classList.remove("visible"); temporal = false; }, duracion);
    }
    const conNombre = (frase) => (nombre ? `${nombre}, ${frase.charAt(0).toLowerCase()}${frase.slice(1)}` : frase);

    /* ── 1. Cuenta tus visitas ── */
    visitas += 1;
    memoria.guardar("morgue-visitas", String(visitas));
    const bajoACamara = memoria.leer("morgue-camara13") === "1";
    const marcador = $("visitas");
    if (marcador) {
        if (bajoACamara) marcador.textContent = conNombre("Has vuelto de la cámara 13. Eso no debería ser posible.");
        else if (visitas === 1) marcador.textContent = "Es tu primera visita. Él ya te estaba esperando.";
        else if (visitas === 2) marcador.textContent = conNombre("Has vuelto. Sabía que volverías.");
        else marcador.textContent = conNombre(`Es la ${visitas}.ª vez que entras. Él lleva la cuenta. Tú ya no.`);
    }

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
        if (titulo) titulo.textContent = nombre ? `Bienvenido a casa, ${nombre}` : "Bienvenido a casa";
    }

    /* ── 3. La pestaña te llama cuando te vas (y el ojo del icono se abre) ── */
    const tituloOriginal = document.title;
    const icono = $("icono");
    const ojoAbierto = icono ? icono.href : "";
    const ojoRojo = ojoAbierto.replace("%23ddd6c1", "%23d10f0f").replace("r='6'", "r='9'");
    const llamadas = ["Vuelve.", "¿Por qué te has ido?", "Te estoy esperando.", "Sé dónde estás.", "No mires atrás.", "Ya estoy aquí."];
    let llamada;
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            let i = 0;
            document.title = conNombre(llamadas[0]);
            if (icono) icono.href = ojoRojo;
            llamada = setInterval(() => {
                i = Math.min(i + 1, llamadas.length - 1);
                document.title = conNombre(llamadas[i]);
            }, 3500);
        } else {
            clearInterval(llamada);
            document.title = "Has vuelto.";
            if (icono) icono.href = ojoAbierto;
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

    /* ── 7. El acceso: tu nombre, la contraseña que se escribe sola y el botón que huye ── */
    const usuario = $("usuario");
    const clave = $("clave");
    const respuesta = $("respuesta");
    if (usuario && nombre) usuario.value = nombre;
    if (usuario && respuesta) {
        usuario.addEventListener("change", () => {
            const escrito = usuario.value.trim().slice(0, 20);
            if (!escrito) return;
            if (escrito.toLowerCase() === "caronte") {
                respuesta.textContent = "«caronte» ya está conectado. Lleva conectado desde 1987. Tú no eres caronte.";
                return;
            }
            nombre = escrito;
            memoria.guardar("morgue-nombre", nombre);
            respuesta.textContent = `Usuario «${nombre}» no encontrado… Creando registro… Registro creado. Fecha de baja: hoy.`;
            escribirClave();
        });
        usuario.closest("form").addEventListener("submit", (e) => e.preventDefault());
    }
    // La contraseña se escribe sola, letra a letra, y al final se deja ver
    let escribiendo = false;
    function escribirClave() {
        if (!clave || escribiendo) return;
        escribiendo = true;
        const palabra = "SACADMEDEAQUI";
        clave.type = "password";
        clave.value = "";
        let i = 0;
        const tecla = setInterval(() => {
            clave.value += palabra[i];
            i += 1;
            if (i === palabra.length) {
                clearInterval(tecla);
                setTimeout(() => { clave.type = "text"; }, 900);
                setTimeout(() => { clave.type = "password"; escribiendo = false; }, 2300);
            }
        }, 260 + Math.random() * 200);
    }

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

    /* ── 8. Si te quedas quieto, te habla; si intentas irte, también ── */
    const frasesQuieto = ["¿Sigues ahí?", "No te muevas. Así no te ve.", "Está detrás de la pantalla.", "Respira más bajo."];
    let quieto, vecesQuieto = 0;
    const reiniciarQuieto = () => {
        clearTimeout(quieto);
        if (!temporal) susurro.classList.remove("visible");
        quieto = setTimeout(() => {
            susurrar(conNombre(frasesQuieto[vecesQuieto % frasesQuieto.length]));
            vecesQuieto += 1;
        }, 35000);
    };
    ["pointermove", "keydown", "scroll", "touchstart"].forEach((ev) => addEventListener(ev, reiniciarQuieto, { passive: true }));
    reiniciarQuieto();
    let avisosSalida = 0;
    raiz.addEventListener("mouseleave", (e) => {
        if (e.clientY > 0 || avisosSalida >= 3) return; // solo cuando el ratón sale por arriba, hacia las pestañas
        avisosSalida += 1;
        susurrar(conNombre(["No te vayas.", "Todavía no.", "Si te vas, se queda tu sitio libre."][avisosSalida - 1]), 3000);
    });

    /* ── 9. Lo que copies de aquí no es lo que copiaste ── */
    document.addEventListener("copy", (e) => {
        if (!e.clipboardData) return;
        e.preventDefault();
        e.clipboardData.setData("text/plain", "No puedes llevarte nada de la morgue. Todo lo que sale de aquí vuelve. — caronte");
    });

    /* ── 10. Para quien abra la consola (F12) ── */
    console.log("%cTE VEO", "font: 48px Nosifer, fantasy; color: #d10f0f; text-shadow: 2px 2px #000;");
    console.log("%cNo deberías estar mirando aquí dentro. Él también tiene las herramientas de desarrollador abiertas.", "color: #a8e6a1; background: #000; padding: 4px; font-size: 14px;");

    /* ── 11. Sonido ambiente: al primer clic, la grabación empieza sola, muy bajito ── */
    const grabacion = document.querySelector("audio");
    addEventListener("pointerdown", (e) => {
        if (!grabacion || e.target === grabacion || !grabacion.paused) return;
        grabacion.volume = 0;
        grabacion.play().then(() => {
            const subida = setInterval(() => {
                grabacion.volume = Math.min(0.3, grabacion.volume + 0.01);
                if (grabacion.volume >= 0.3) clearInterval(subida);
            }, 250);
        }).catch(() => { /* el navegador no deja: no pasa nada */ });
    }, { once: true });

    if (calma) return; // lo que queda se mueve demasiado

    /* ── 12. Un segundo cursor que hace lo mismo que tú, dos segundos tarde ── */
    const fantasma = document.createElement("div");
    fantasma.className = "cursor-fantasma";
    fantasma.setAttribute("aria-hidden", "true");
    fantasma.innerHTML = `<svg viewBox="0 0 13 20" xmlns="http://www.w3.org/2000/svg"><path d="M0.5 0.5 L0.5 16 L4.6 12.2 L7.4 19 L10 17.9 L7.3 11.3 L12.3 11.3 Z" fill="#ddd6c1" stroke="#000" stroke-width="1"/></svg>`;
    document.body.append(fantasma);
    const rastro = [];
    addEventListener("pointermove", (e) => {
        if (e.pointerType === "mouse") rastro.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    }, { passive: true });
    setTimeout(() => {
        fantasma.classList.add("visible");
        (function seguir() {
            const objetivo = performance.now() - 2000;
            let punto;
            while (rastro.length && rastro[0].t <= objetivo) punto = rastro.shift();
            if (punto) fantasma.style.transform = `translate(${punto.x}px, ${punto.y}px)`;
            requestAnimationFrame(seguir);
        })();
    }, parametros.has("cursor") ? 3000 : 45000);

    /* ── 13. Un destello que casi nadie ve ── */
    const forzado = parametros.has("susto");
    if (!forzado && Math.random() > 0.12) return; // ~1 de cada 8 visitas
    const destello = document.createElement("div");
    destello.className = "destello";
    destello.setAttribute("aria-hidden", "true");
    // Cara dibujada en SVG: alargada, deformada, con las cuencas vacías y demasiados dientes
    const curva = (t, y0, yc, y1) => (1 - t) ** 2 * y0 + 2 * (1 - t) * t * yc + t ** 2 * y1;
    const dientes = [];
    for (let x = 46; x <= 154; x += 4) {
        const t = (x - 42) / 116;
        const arriba = curva(t, 172, 190, 170);
        const abajo = curva(t, 172, 238, 170);
        dientes.push(`M${x} ${arriba.toFixed(1)} L${(x + 0.8).toFixed(1)} ${(arriba + 9 + Math.random() * 9).toFixed(1)}`);
        dientes.push(`M${x + 2} ${abajo.toFixed(1)} L${(x + 1.4).toFixed(1)} ${(abajo - 7 - Math.random() * 8).toFixed(1)}`);
    }
    destello.innerHTML = `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="piel" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="#dcd8c9"/><stop offset=".6" stop-color="#8a8576"/><stop offset="1" stop-color="#14130f"/></radialGradient>
            <radialGradient id="cuenca"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#000"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
            <filter id="deforma"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="13"/><feDisplacementMap in="SourceGraphic" scale="16"/></filter>
        </defs>
        <g filter="url(#deforma)">
            <ellipse cx="100" cy="132" rx="60" ry="122" fill="url(#piel)"/>
            <ellipse cx="72" cy="98" rx="22" ry="31" fill="url(#cuenca)"/>
            <ellipse cx="131" cy="104" rx="19" ry="36" fill="url(#cuenca)"/>
            <circle cx="75" cy="103" r="1.4" fill="#fff"/><circle cx="128" cy="111" r="1.4" fill="#fff"/>
            <path d="M94 140 L91 152 M106 140 L109 152" stroke="#000" stroke-width="2.5"/>
            <path d="M42 172 Q100 190 158 170 Q100 238 42 172Z" fill="#050505"/>
            <path d="${dientes.join(" ")}" stroke="#cfc9b4" stroke-width="1.8" stroke-linecap="round"/>
        </g>
    </svg>`;
    document.body.append(destello);
    let audio;
    addEventListener("pointerdown", () => { try { audio ??= new AudioContext(); } catch { /* sin sonido */ } }, { once: true });
    if (parametros.get("susto") === "ver") { destello.classList.add("visible"); return; } // para revisarla con calma
    const espera = forzado ? 3000 : 25000 + Math.random() * 60000;
    setTimeout(() => {
        // Dos fotogramas: aparece, se va y vuelve un poco más cerca, como una cinta que salta
        destello.classList.add("visible");
        if (audio) chirrido(audio);
        setTimeout(() => destello.classList.remove("visible"), 90);
        setTimeout(() => destello.classList.add("visible", "cerca"), 160);
        setTimeout(() => destello.classList.remove("visible", "cerca"), 230);
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
