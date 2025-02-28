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

// Проверка подключения к БД
pool.connect()
    .then(() => console.log("✅ Успешное подключение к базе данных Neon"))
    .catch(err => console.error("❌ Ошибка подключения к базе данных:", err));

app.use(cors());
app.use(express.json());

// Раздача статики
app.use(express.static("public"));

// Главная страница
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Получение всех маркеров
app.get("/marks", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM marks");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Ошибка получения маркеров:", err);
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
        console.error("❌ Ошибка добавления маркера:", err);
        res.status(500).send("Ошибка сервера");
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
