import express from "express";
import cors from "cors";

// PRIMERO creas la app
const app = express();

// Define el puerto del servidor
const PORT = 3000;

// Permitir TODOS los orígenes (para desarrollo)
app.use(cors({
    origin:"*"
    }));

    // Middlewares
    app.use(express.json());

    // Ruta
    app.get("/api/mensaje", (req, res) => {
    res.send({ texto: "Hola desde el backend " });
    });

    //=================
    // JUEGO: ADIVINA EL NÚMERO
    // Número secreto inicial
    let numeroSecreto = Math.floor(Math.random() * 100) + 1;
    // Reiniciar el juego
    app.get("/api/start", (req, res) =>{
        numeroSecreto = Math.floor(Math.random() * 100) + 1;
        // Enviamos el numero secreto tambien al frontend para verlo en la consola del navegador
        res. json({
            mensaje: "Nuevo juego iniciado. Adivina un número entre 1 y 100.",
            numeroSecreto //solo para depuración
        });
});
// Endpoint para adivinar
app.post("/api/guess", (req, res) => {
    const intento = req.body.numero;

    // Validación básica
    if (!intento && intento !== 0) {
            return res.status(400).json({ mensaje: "Debes enviar un numero." });
                }
                    // Comparación con número secreto
                        if (intento < numeroSecreto) {
                            res.json({ mensaje: "El numero secreto es mayor"});
                        } else if (intento > numeroSecreto) {
                        res.json({ mensaje: "El numero secreto es menor"});
                        } else {
                        res.json({ mensaje: " ¡Correcto! Adivinaste el número." });
                        }
});

// ============================================================
// 🎮 JUEGO: ADIVINA EL POKÉMON
// ============================================================

// Variable global para guardar el Pokémon secreto (similar a numeroSecreto)
let pokemonSecreto = {
  nombre: "",
  imagen: "",
};

// GET /api/pokemon/start — Elige un Pokémon aleatorio y devuelve pistas
app.get("/api/pokemon/start", async (req, res) => {
  try {
    // ID aleatorio entre 1 y 386 (primera, segunda y tercera generación)
    const idAleatorio = Math.floor(Math.random() * 386) + 1;

    // Petición principal a PokeAPI
    const respuestaPokemon = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${idAleatorio}`
    );
    if (!respuestaPokemon.ok) throw new Error("Error al obtener el Pokémon");
    const datosPokemon = await respuestaPokemon.json();

    // Petición secundaria para obtener el color de la especie
    const respuestaEspecie = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${idAleatorio}`
    );
    if (!respuestaEspecie.ok) throw new Error("Error al obtener la especie");
    const datosEspecie = await respuestaEspecie.json();

    // Guardar nombre e imagen en variable global (NO se envían al frontend)
    pokemonSecreto.nombre = datosPokemon.name.toLowerCase();
    pokemonSecreto.imagen =
      datosPokemon.sprites?.other?.dream_world?.front_default ||
      datosPokemon.sprites?.front_default ||
      "";

    // Seleccionar máximo 4 movimientos aleatorios
    const movimientosTotales = datosPokemon.moves.map((m) => m.move.name);
    const movimientosAleatorios = movimientosTotales
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    // Responder SOLO con pistas (sin el nombre)
    res.json({
      id: datosPokemon.id,
      tipos: datosPokemon.types.map((t) => t.type.name),
      altura: datosPokemon.height,
      peso: datosPokemon.weight,
      color: datosEspecie.color?.name || "desconocido",
      movimientos: movimientosAleatorios,
    });
  } catch (error) {
    console.error("Error en /api/pokemon/start:", error.message);
    res.status(500).json({ error: "No se pudo obtener el Pokémon" });
  }
});

// POST /api/pokemon/guess — Recibe el intento del usuario y compara
app.post("/api/pokemon/guess", (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || typeof nombre !== "string") {
      return res.status(400).json({ error: "Debes enviar un nombre válido" });
    }

    if (!pokemonSecreto.nombre) {
      return res
        .status(400)
        .json({ error: "Primero inicia un juego con /api/pokemon/start" });
    }

    const intento = nombre.trim().toLowerCase();
    const correcto = intento === pokemonSecreto.nombre;
    const nombreFormateado =
      pokemonSecreto.nombre.charAt(0).toUpperCase() +
      pokemonSecreto.nombre.slice(1);

    res.json({
      correcto,
      mensaje: correcto
        ? `¡Correcto! Es ${nombreFormateado}`
        : `Incorrecto, el Pokémon era ${nombreFormateado}`,
      imagen: pokemonSecreto.imagen,
    });
  } catch (error) {
    console.error("Error en /api/pokemon/guess:", error.message);
    res.status(500).json({ error: "Error al procesar la respuesta" });
  }
});

// ============================================================
// 🎮 FIN — JUEGO: ADIVINA EL POKÉMON
// ============================================================

// Servidor
app.listen(PORT,()=>{
console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});