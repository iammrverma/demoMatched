require('dotenv').config();
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const helmet = require("helmet"); // Import helmet for security
const rateLimit = require("express-rate-limit"); // Import rate-limit for rate limiting
const morgan = require("morgan"); // Import morgan for logging
console.log(
  process.env.PORT,
  process.env.SECRET_KEY,
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DB_NAME
);
const app = express();
const PORT = process.env.PORT;//|| 3000;
const SECRET_KEY = process.env.SECRET_KEY;// || "your_secret_key";
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION;//"1h";

// Use Helmet for basic security
app.use(helmet());

// Rate limiting middleware to limit repeated requests to public APIs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutestrunc
  max: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Use morgan for logging
app.use(morgan("combined"));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,// || "localhost",
  user: process.env.DB_USER,// || "root",
  password: process.env.DB_PASSWORD,// || "mysql@3t",
  database: process.env.DB_NAME,// || "matched",
});

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

function handleError(res, err, message = "Internal server error") {
  console.error(message, err);
  res.status(500).json({ error: message });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = user;
    next();
  });
}

function requireDepartment(department) {
  return (req, res, next) => {
    if (req.user.department !== department) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    next();
  };
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/api/verifyAccess", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await query("SELECT department, password FROM users WHERE email = ?", [email]);
    if (result.length > 0) {
      const { department, password: hashedPassword } = result[0];
      const match = await bcrypt.compare(password, hashedPassword);
      if (match) {
        const token = jwt.sign({ email, department }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
        res.json({ accessGranted: true, department, token });
      } else {
        res.status(401).json({ accessGranted: false, error: "Invalid email or password" });
      }
    } else {
      res.status(401).json({ accessGranted: false, error: "Invalid email or password" });
    }
  } catch (err) {
    handleError(res, err);
  }
});

app.post("/api/changePassword", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { email } = req.user;

  try {
    const result = await query("SELECT password FROM users WHERE email = ?", [email]);
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const storedPassword = result[0].password;
    const match = await bcrypt.compare(currentPassword, storedPassword);
    if (!match) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET password = ? WHERE email = ?", [hashedNewPassword, email]);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    handleError(res, err);
  }
});

app.post("/api/users", authenticateToken, requireDepartment("cfo"), async (req, res) => {
  const { userDepartment, mailid, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query("INSERT INTO users (department, email, password) VALUES (?, ?, ?)", [userDepartment, mailid, hashedPassword]);
    res.json({ success: true, message: "User added successfully", id: result.insertId });
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/api/entries", authenticateToken, requireDepartment("cfo"), async (req, res) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayDate = `${year}-${month}-${day}`;

  try {
    await query("START TRANSACTION");

    await query(`
      INSERT INTO past_entries (department, mailid, type, amount, entry_date, acc_number)
      SELECT department, mailid, type, amount, entry_date, acc_number
      FROM entries
      WHERE DATE(entry_date) < ?
    `, [todayDate]);

    await query("DELETE FROM entries WHERE DATE(entry_date) < ?", [todayDate]);

    await query("COMMIT");

    const todayEntries = await query("SELECT * FROM entries WHERE DATE(entry_date) = ?", [todayDate]);

    res.json(todayEntries);
  } catch (err) {
    await query("ROLLBACK");
    handleError(res, err);
    console.log(err);
  }
});

app.post("/api/entries", authenticateToken, async (req, res) => {
  const { department } = req.user;
  if (department !== "finance" && department !== "accounts") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { mailid, type, amount, entry_date, accountNumber } = req.body;
  try {
    const result = await query("INSERT INTO entries (department, mailid, type, amount, entry_date, acc_number) VALUES (?, ?, ?, ?, ?, ?)", [department, mailid, type, amount, entry_date, accountNumber]);
    res.json({ success: true, message: "Entry added successfully", id: result.insertId });
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/api/users", authenticateToken, requireDepartment("cfo"), async (req, res) => {
  try {
    const result = await query("SELECT * FROM users");
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

app.delete("/api/user", authenticateToken, requireDepartment("cfo"), async (req, res) => {
  const { userId } = req.body;
  try {
    const result = await query("DELETE FROM users WHERE id = ?", [userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://16.171.64.239:${PORT}`);
});
