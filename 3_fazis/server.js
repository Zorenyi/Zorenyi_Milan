const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());

// Összes osztály lekérése
app.get("/osztalyok", async (req, res) => {
    try {
        const [eredmeny] = await pool.query(
            "SELECT * FROM osztalyok"
        );

        res.status(200).json(eredmeny);
    } catch (error) {
        console.error("MYSQL HIBA:", error);

        res.status(500).json({
            hiba: "Adatbázis hiba történt."
        });
    }
});

// Új osztály létrehozása
app.post("/osztalyok", async (req, res) => {
    try {
        const { nev, szak, evfolyam } = req.body;

        if (!nev || !szak || !evfolyam) {
            return res.status(400).json({
                hiba: "Minden adat megadása kötelező."
            });
        }

        const [eredmeny] = await pool.query(
            "INSERT INTO osztalyok (nev, szak, evfolyam) VALUES (?, ?, ?)",
            [nev, szak, evfolyam]
        );

        res.status(201).json({
            id: eredmeny.insertId,
            nev: nev,
            szak: szak,
            evfolyam: evfolyam
        });
    } catch (error) {
        console.error("MYSQL HIBA:", error);

        res.status(500).json({
            hiba: "Adatbázis hiba történt."
        });
    }
});

// Összes diák lekérése osztálynévvel együtt
app.get("/diakok", async (req, res) => {
    try {
        const [eredmeny] = await pool.query(`
            SELECT
                diakok.id,
                diakok.nev,
                diakok.email,
                diakok.osztaly_id,
                osztalyok.nev AS osztaly_nev
            FROM diakok
            INNER JOIN osztalyok
                ON diakok.osztaly_id = osztalyok.id
        `);

        res.status(200).json(eredmeny);
    } catch (error) {
        console.error("MYSQL HIBA:", error);

        res.status(500).json({
            hiba: "Adatbázis hiba történt."
        });
    }
});

// Új diák létrehozása
app.post("/diakok", async (req, res) => {
    try {
        const { nev, email, osztaly_id } = req.body;

        if (!nev || !email || !osztaly_id) {
            return res.status(400).json({
                hiba: "Minden adat megadása kötelező."
            });
        }

        const [osztaly] = await pool.query(
            "SELECT id FROM osztalyok WHERE id = ?",
            [osztaly_id]
        );

        if (osztaly.length === 0) {
            return res.status(400).json({
                hiba: "A megadott osztály nem létezik."
            });
        }

        const [eredmeny] = await pool.query(
            "INSERT INTO diakok (nev, email, osztaly_id) VALUES (?, ?, ?)",
            [nev, email, osztaly_id]
        );

        res.status(201).json({
            id: eredmeny.insertId,
            nev: nev,
            email: email,
            osztaly_id: osztaly_id
        });
    } catch (error) {
        console.error("MYSQL HIBA:", error);

        res.status(500).json({
            hiba: "Adatbázis hiba történt."
        });
    }
});

// Egy osztály diákjainak lekérése
app.get("/osztalyok/:id/diakok", async (req, res) => {
    try {
        const osztalyId = req.params.id;

        const [eredmeny] = await pool.query(
            "SELECT * FROM diakok WHERE osztaly_id = ?",
            [osztalyId]
        );

        res.status(200).json(eredmeny);
    } catch (error) {
        console.error("MYSQL HIBA:", error);

        res.status(500).json({
            hiba: "Adatbázis hiba történt."
        });
    }
});

// Osztály törlése
app.delete("/osztalyok/:id", async (req, res) => {
    try {
        const osztalyId = req.params.id;

        // Megnézzük, létezik-e az osztály
        const [osztaly] = await pool.query(
            "SELECT id FROM osztalyok WHERE id = ?",
            [osztalyId]
        );

        if (osztaly.length === 0) {
            return res.status(404).json({
                hiba: "Az osztály nem létezik."
            });
        }

        // Megnézzük, vannak-e diákok az osztályban
        const [diakok] = await pool.query(
            "SELECT id FROM diakok WHERE osztaly_id = ?",
            [osztalyId]
        );

        if (diakok.length > 0) {
            return res.status(409).json({
                hiba: "Az osztály nem törölhető, mert vannak benne diákok."
            });
        }

        // Osztály törlése
        await pool.query(
            "DELETE FROM osztalyok WHERE id = ?",
            [osztalyId]
        );

        res.status(204).send();
    } catch (error) {
        console.error("MYSQL HIBA:", error);

        res.status(500).json({
            hiba: "Adatbázis hiba történt."
        });
    }
});

app.listen(3001, () => {
    console.log("Szerver elindult a 3001-es porton.");
});