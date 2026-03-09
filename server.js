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
const db = new Database(path.join(__dirname, "expenses.db"));
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

// Seed guest user
try {
  const guestUser = db.prepare("SELECT * FROM users WHERE email = ?").get("guest@example.com");
  if (!guestUser) {
    db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run("guest@example.com", "guest-password", "Guest");
    console.log("Guest user seeded");
  }
} catch (err) {
  console.error("Failed to seed guest user:", err);
}

// API Routes
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Simple mock auth for demo purposes
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      console.log(`Creating new user for: ${email}`);
      db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password || "password", email.split("@")[0]);
      user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    }
    
    if (!user) {
      return res.status(500).json({ error: "Failed to create or find user" });
    }

    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

// Google OAuth Routes
app.get("/api/auth/google/url", (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  res.json({ url: `${rootUrl}?${qs.toString()}` });
});

app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  
  if (!code) {
    return res.status(400).send("No code provided");
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      console.error("Google token exchange error:", tokens);
      return res.status(400).send("Failed to exchange code for tokens");
    }

    // Get user info
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
    const googleUser = await userResponse.json();

    // Find or create user in DB
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(googleUser.email);
    if (!user) {
      db.prepare("INSERT INTO users (email, name) VALUES (?, ?)").run(googleUser.email, googleUser.name);
      user = db.prepare("SELECT * FROM users WHERE email = ?").get(googleUser.email);
    }

    // Send success message to parent window and close popup
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS',
                user: ${JSON.stringify({ id: user.id, email: user.email, name: user.name })}
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).send("Authentication failed");
  }
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
