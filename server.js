import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Database Setup
const db = new Database("expenses.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    item TEXT,
    amount REAL,
    category TEXT,
    date TEXT,
    raw_text TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// API Routes
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  // Simple mock auth for demo purposes
  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, email.split("@")[0]);
    user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  }
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

app.get("/api/expenses/:userId", (req, res) => {
  const expenses = db.prepare("SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC").all(req.params.userId);
  res.json(expenses);
});

app.post("/api/expenses", (req, res) => {
  const { user_id, item, amount, category, date, raw_text } = req.body;
  const result = db.prepare(
    "INSERT INTO expenses (user_id, item, amount, category, date, raw_text) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(user_id, item, amount, category, date, raw_text);
  res.json({ id: result.lastInsertRowid });
});

app.delete("/api/expenses/:id", (req, res) => {
  db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
  res.sendStatus(200);
});

app.put("/api/users/:id", (req, res) => {
  const { name, email } = req.body;
  try {
    db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, req.params.id);
    const updatedUser = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(req.params.id);
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: "Failed to update user" });
  }
});

app.get("/api/analytics/:userId", (req, res) => {
  const userId = req.params.userId;
  const expenses = db.prepare("SELECT * FROM expenses WHERE user_id = ?").all(userId);
  
  // Basic analytics
  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categorySpending = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const monthlySpending = expenses.reduce((acc, e) => {
    if (e.date) {
      const month = e.date.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + e.amount;
    }
    return acc;
  }, {});

  res.json({
    totalSpending,
    categorySpending: Object.entries(categorySpending).map(([name, value]) => ({ name, value })),
    monthlySpending: Object.entries(monthlySpending).map(([name, value]) => ({ name, value })),
    recentExpenses: expenses.slice(0, 5)
  });
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
