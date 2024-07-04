const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // Import bcrypt

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key"; // Use a secure key
const TOKEN_EXPIRATION = "1h"; // Token expiration time

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MySQL database connection configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql@3t", // Mysql@1
  database: "matched",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("No token found");
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log("Token verification failed", err);
      return res.status(403).json({ error: "Forbidden" });
    }
    console.log("Token verified, user:", user);
    req.user = user;
    next();
  });
}

// Endpoint to verify whether a user is in the database or not and return their department
app.post("/api/verifyAccess", (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT department, password FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
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
  });
});

// Endpoint to change password
app.post("/api/changePassword", authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { email } = req.user;

  // First, verify the current password
  const sqlSelect = "SELECT password FROM users WHERE email = ?";
  db.query(sqlSelect, [email], async (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const storedPassword = result[0].password;
    const match = await bcrypt.compare(currentPassword, storedPassword);
    if (!match) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const sqlUpdate = "UPDATE users SET password = ? WHERE email = ?";
    db.query(sqlUpdate, [hashedNewPassword, email], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json({ success: true, message: "Password changed successfully" });
    });
  });
});

// Endpoint to add a new user (restricted to CFO)
app.post("/api/users", authenticateToken, async (req, res) => {
  const { department } = req.user;
  const { userDepartment, mailid, password } = req.body;

  if (department === "cfo") {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const sql = "INSERT INTO users (department, email, password) VALUES (?, ?, ?)";
    db.query(sql, [userDepartment, mailid, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json({ success: true, message: "User added successfully", id: result.insertId });
    });
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
});

// Endpoint to fetch entries (restricted to CFO)
app.get("/api/entries", authenticateToken, (req, res) => {
  const { department } = req.user;
  if (department === "cfo") {
    const sql = "SELECT * FROM entries";
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json(result);
    });
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
});

// Endpoint to post entries restricted to finance and accounts
app.post("/api/entries", authenticateToken, (req, res) => {
  const { department } = req.user;
  if (department !== "finance" && department !== "accounts") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { mailid, type, amount, entry_date, accountNumber } = req.body;
  const sql = "INSERT INTO entries (department, mailid, type, amount, entry_date, acc_number) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [department, mailid, type, amount, entry_date, accountNumber], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ success: true, message: "Entry added successfully", id: result.insertId });
  });
});

// Endpoint to get all users (restricted to CFO)
app.get("/api/users", authenticateToken, (req, res) => {
  const { department } = req.user;
  if (department == "cfo") {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      res.json(result);
    });
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
});

// Endpoint to delete user from database (restricted to CFO)
app.delete("/api/user", authenticateToken, (req, res) => {
  const { department } = req.user;
  const { userId } = req.body; 

  if (department === "cfo") {
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true, message: "User deleted successfully" });
    });
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
