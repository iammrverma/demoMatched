const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const { log, error } = require("console");

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
  password: "mysql@3t",
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

//endpoint to verify whether a user is in database or not and return its department
app.post("/api/verifyAccess", (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT department FROM users WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    if (result.length > 0) {
      const { department } = result[0];
      const token = jwt.sign({ email, department }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
      res.json({ accessGranted: true, department, token });
    } else {
      res.status(401).json({ accessGranted: false, error: "Invalid email or password" });
    }
  });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = user;
    next();
  });
}
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

//Endpont to post entriees restricted to finance and accounts
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

//Endpoint to change pasword
app.post("/api/changePassword", authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { email } = req.user;

  // First, verify the current password
  const sqlSelect = "SELECT password FROM users WHERE email = ?";
  db.query(sqlSelect, [email], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const storedPassword = result[0].password;
    if (currentPassword !== storedPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update the password in the database
    const sqlUpdate = "UPDATE users SET password = ? WHERE email = ?";
    db.query(sqlUpdate, [newPassword, email], (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json({ success: true, message: "Password changed successfully" });
    });
  });
});

//Endpoint to get users all users
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

// Endpoint to delete user from data base 
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

app.post("/api/users", authenticateToken, (req, res) => {
  const { department } = req.user;
  const { userDepartment, mailid, password } = req.body;

  if (department === "cfo") {
    const sql = "INSERT INTO users (department, email, password) VALUES (?, ?, ?)";
    db.query(sql, [userDepartment, mailid, password], (err, result) => {
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


app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
