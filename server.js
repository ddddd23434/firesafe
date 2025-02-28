const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к базе данных Neon
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// Проверяем подключение к базе и логируем результат
pool.connect()
    .then(client => {
        console.log("✅ Успешное подключение к базе данных Neon");
        client.release();
    })
    .catch(err => console.error("❌ Ошибка подключения к базе данных:", err));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Раздаём статику

// Рендерим `index.html`
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Проверяем запрос к базе (логируем результат)
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("🕒 Время в БД:", result.rows[0]);
        res.json({ time: result.rows[0] });
    } catch (err) {
        console.error("❌ Ошибка запроса к БД:", err);
        res.status(500).json({ error: "Ошибка подключения к базе" });
    }
});

// Получение всех маркеров
app.get("/marks", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM marks");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Ошибка получения данных:", err);
        res.status(500).send("Ошибка сервера");
    }
});

// Добавление нового маркера
app.post("/marks", async (req, res) => {
    const { shirota, dolgota, title, description } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO marks (shirota, dolgota, title, description) VALUES ($1, $2, $3, $4) RETURNING *",
            [shirota, dolgota, title, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Ошибка добавления данных:", err);
        res.status(500).send("Ошибка сервера");
    }
});

// Запуск сервера на localhost
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
