import { useEffect, useState } from "react";

// ── Estilos globales ───────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Outfit', sans-serif;
      background: #0f1117;
      min-height: 100vh;
      padding: 1.5rem;
      color: #e8e6e1;
    }
    input, button { font-family: 'Outfit', sans-serif; }
    input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
    input:focus { outline: none; }

    /* ── Azul: juego de números ── */
    .card-blue { border: 1px solid #0C447C; background: #060f1a; }
    .card-blue .c-header { background: #042C53; border-bottom: 1px solid #0C447C; }
    .card-blue .c-icon { background: #0C447C; color: #85B7EB; }
    .card-blue .c-status { background: #060f1a; border-left: 3px solid #378ADD; color: #85B7EB; }
    .card-blue .c-input { background: #060f1a; border: 1px solid #0C447C; color: #e8e6e1; }
    .card-blue .c-input:focus { border-color: #378ADD; }
    .card-blue .btn-accent { background: #185FA5; color: #B5D4F4; border: 1px solid #0C447C; }
    .card-blue .btn-accent:hover { background: #378ADD; }
    .card-blue .btn-ghost { background: transparent; color: #85B7EB; border: 1px solid #0C447C; }
    .card-blue .btn-ghost:hover { background: #042C53; }
    .card-blue .title { color: #B5D4F4; }
    .card-blue .subtitle { color: #378ADD; }

    /* ── Rojo: juego pokémon ── */
    .card-red { border: 1px solid #791F1F; background: #130808; }
    .card-red .c-header { background: #501313; border-bottom: 1px solid #791F1F; }
    .card-red .c-icon { background: #791F1F; color: #F09595; }
    .card-red .c-status { background: #130808; border-left: 3px solid #E24B4A; color: #F09595; }
    .card-red .c-input { background: #130808; border: 1px solid #791F1F; color: #e8e6e1; }
    .card-red .c-input:focus { border-color: #E24B4A; }
    .card-red .btn-accent { background: #A32D2D; color: #F7C1C1; border: 1px solid #791F1F; }
    .card-red .btn-accent:hover { background: #E24B4A; }
    .card-red .btn-ghost { background: transparent; color: #F09595; border: 1px solid #791F1F; }
    .card-red .btn-ghost:hover { background: #501313; }
    .card-red .title { color: #F7C1C1; }
    .card-red .subtitle { color: #E24B4A; }
    .card-red .hint-chip { background: #1c0d0d; border: 1px solid #791F1F; }
    .card-red .hint-label { color: #F09595; }
    .card-red .hint-value { color: #F7C1C1; }
    .card-red .tipo-tag { background: #791F1F; color: #F7C1C1; }
    .card-red .divider { color: #791F1F; }

    /* ── Resultado Pokémon ── */
    .result-correct { background: #04342C; border: 1px solid #085041; }
    .result-correct .result-msg { color: #9FE1CB; }
    .result-wrong { background: #501313; border: 1px solid #791F1F; }
    .result-wrong .result-msg { color: #F7C1C1; }

    /* ── Botones base ── */
    button { cursor: pointer; border-radius: 8px; font-weight: 500; font-size: 0.85rem; padding: 9px 16px; transition: background 0.15s; border: none; }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
  `}</style>
);

// ── Componente principal ───────────────────────────────────────────────────
function App() {

  // ── Conexión backend ────────────────────────────────────────────────────
  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    fetch("/api/mensaje")
      .then(r => r.json())
      .then(d => setMensaje(d.texto))
      .catch(console.error);
  }, []);

  // ── Juego: Adivina el número ────────────────────────────────────────────
  const [mensajeJuego, setMensajeJuego] = useState("Haz clic en Reiniciar para comenzar");
  const [numero, setNumero] = useState("");

  const reiniciarJuego = async () => {
    const r = await fetch("/api/start");
    const d = await r.json();
    setMensajeJuego(d.mensaje);
    setNumero("");
  };

  const enviarIntento = async () => {
    if (numero === "") return;
    const r = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero: Number(numero) }),
    });
    const d = await r.json();
    setMensajeJuego(d.mensaje);
  };

  // ── Juego: Adivina el Pokémon ───────────────────────────────────────────
  const [pokemonData, setPokemonData]           = useState(null);
  const [nombrePokemon, setNombrePokemon]       = useState("");
  const [resultadoPokemon, setResultadoPokemon] = useState("");
  const [imagenPokemon, setImagenPokemon]       = useState("");
  const [cargandoPokemon, setCargandoPokemon]   = useState(false);
  const [esCorrectoP, setEsCorrectoP]           = useState(false);

  const iniciarPokemon = async () => {
    try {
      setCargandoPokemon(true);
      setResultadoPokemon("");
      setImagenPokemon("");
      setNombrePokemon("");
      setPokemonData(null);
      const r = await fetch("/api/pokemon/start");
      if (!r.ok) throw new Error();
      const d = await r.json();
      setPokemonData(d);
    } catch {
      setResultadoPokemon("Error al conectar con el servidor");
    } finally {
      setCargandoPokemon(false);
    }
  };

  const adivinarPokemon = async () => {
    if (!nombrePokemon.trim()) return;
    try {
      const r = await fetch("/api/pokemon/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombrePokemon }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setEsCorrectoP(d.correcto);
      setResultadoPokemon(d.mensaje);
      setImagenPokemon(d.imagen);
    } catch {
      setResultadoPokemon("Error al conectar con el servidor");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      <GlobalStyle />

      {/* Cabecera */}
      <div style={{ textAlign: "center", marginBottom: "2rem", paddingTop: "1rem" }}>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 700, color: "#e8e6e1", letterSpacing: "-0.5px" }}>
          🎮 Mini Juegos
        </h1>
        {mensaje && (
          <span style={{
            display: "inline-block", marginTop: 8,
            background: "#042C53", color: "#85B7EB",
            fontSize: 12, padding: "3px 14px", borderRadius: 99, fontWeight: 500,
          }}>
            {mensaje}
          </span>
        )}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.5rem",
        maxWidth: 900,
        margin: "0 auto",
      }}>

        {/* ══════════════════════════════════════════════
            TARJETA AZUL — Adivina el número
        ══════════════════════════════════════════════ */}
        <div className="card-blue" style={{ borderRadius: 14, overflow: "hidden" }}>

          {/* Header */}
          <div className="c-header" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
            <div className="c-icon" style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              🔢
            </div>
            <div>
              <p className="title" style={{ fontWeight: 500, fontSize: "1rem" }}>Adivina el número</p>
              <p className="subtitle" style={{ fontSize: 12, marginTop: 1 }}>Entre 1 y 100</p>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "1.25rem" }}>
            <div className="c-status" style={{ borderRadius: 8, padding: "0.75rem 1rem", fontSize: "0.85rem", marginBottom: "1rem", minHeight: 44, lineHeight: 1.5 }}>
              {mensajeJuego}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem" }}>
              <input
                className="c-input"
                type="number"
                value={numero}
                onChange={e => setNumero(e.target.value)}
                onKeyDown={e => e.key === "Enter" && enviarIntento()}
                placeholder="Escribe un número..."
                style={{ flex: 1, borderRadius: 8, padding: "9px 12px", fontSize: "0.9rem" }}
              />
              <button
                className="btn-accent"
                onClick={enviarIntento}
                disabled={numero === ""}
              >
                Intentar
              </button>
            </div>

            <button
              className="btn-ghost"
              onClick={reiniciarJuego}
              style={{ width: "100%" }}
            >
              🔄 Reiniciar juego
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            TARJETA ROJA — Adivina el Pokémon
        ══════════════════════════════════════════════ */}
        <div className="card-red" style={{ borderRadius: 14, overflow: "hidden" }}>

          {/* Header */}
          <div className="c-header" style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
            <div className="c-icon" style={{ width: 38, height: 38, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              ⚡
            </div>
            <div>
              <p className="title" style={{ fontWeight: 500, fontSize: "1rem" }}>Adivina el Pokémon</p>
              <p className="subtitle" style={{ fontSize: 12, marginTop: 1 }}>Gen I–III · 386 Pokémon</p>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "1.25rem" }}>

            {/* Estado vacío / cargando */}
            {!pokemonData && (
              <div className="c-status" style={{ borderRadius: 8, padding: "0.75rem 1rem", fontSize: "0.85rem", marginBottom: "1rem", minHeight: 44 }}>
                {cargandoPokemon ? "⏳ Cargando Pokémon..." : "Presiona \"Nuevo Pokémon\" para comenzar"}
              </div>
            )}

            {/* Chips de pistas */}
            {pokemonData && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "1rem" }}>
                {[
                  { label: "ID",     value: `#${String(pokemonData.id).padStart(3, "0")}` },
                  { label: "Color",  value: pokemonData.color },
                  { label: "Altura", value: `${pokemonData.altura / 10} m` },
                  { label: "Peso",   value: `${pokemonData.peso / 10} kg` },
                ].map(({ label, value }) => (
                  <div key={label} className="hint-chip" style={{ borderRadius: 8, padding: "8px 10px" }}>
                    <p className="hint-label" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</p>
                    <p className="hint-value" style={{ fontSize: "0.88rem", fontWeight: 500, fontFamily: "'Space Mono', monospace" }}>{value}</p>
                  </div>
                ))}

                {/* Tipos — span 2 */}
                <div className="hint-chip" style={{ borderRadius: 8, padding: "8px 10px", gridColumn: "span 2",}}>
                  <p className="hint-label" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Tipos</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {pokemonData.tipos.map(t => (
                      <span key={t} className="tipo-tag" style={{ padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 500 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Movimientos — span 2 */}
                <div className="hint-chip" style={{ borderRadius: 8, padding: "8px 10px", gridColumn: "span 2" }}>
                  <p className="hint-label" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>Movimientos</p>
                  <p className="hint-value" style={{ fontSize: "0.82rem", fontWeight: 400, fontFamily: "'Space Mono', monospace", lineHeight: 1.6 }}>
                    {pokemonData.movimientos.join(" · ")}
                  </p>
                </div>
              </div>
            )}

            {/* Input para adivinar */}
            {pokemonData && (
              <>
                <p className="divider" style={{ textAlign: "center", fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>
                  — TU RESPUESTA —
                </p>
                <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem" }}>
                  <input
                    className="c-input"
                    type="text"
                    value={nombrePokemon}
                    onChange={e => setNombrePokemon(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && adivinarPokemon()}
                    placeholder="Nombre del Pokémon..."
                    style={{ flex: 1, borderRadius: 8, padding: "9px 12px", fontSize: "0.9rem" }}
                  />
                  <button
                    className="btn-accent"
                    onClick={adivinarPokemon}
                    disabled={!nombrePokemon.trim()}
                  >
                    ⚡ Adivinar
                  </button>
                </div>
              </>
            )}

            {/* Botón nuevo Pokémon */}
            <button
              className="btn-ghost"
              onClick={iniciarPokemon}
              disabled={cargandoPokemon}
              style={{ width: "100%", marginBottom: resultadoPokemon ? "1rem" : 0 }}
            >
              🔀 Nuevo Pokémon
            </button>

            {/* ── Resultado: imagen grande + texto centrado ── */}
            {resultadoPokemon && (
              <div
                className={esCorrectoP ? "result-correct" : "result-wrong"}
                style={{ borderRadius: 12, padding: "1.25rem 1rem", textAlign: "center" }}
              >
                {imagenPokemon && (
                  <img
                    src={imagenPokemon}
                    alt="Pokémon revelado"
                    style={{
                      width: 140,
                      height: 140,
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto 0.75rem",
                    }}
                  />
                )}
                <p
                  className="result-msg"
                  style={{ fontWeight: 500, fontSize: "0.95rem", lineHeight: 1.5 }}
                >
                  {resultadoPokemon}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </>
  );
}

export default App;