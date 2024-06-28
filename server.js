const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MySQL database connection configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql@3t", // "Mysql@1",
  database: "matched",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Middleware to protect routes
function checkAccess(req, res, next) {
  const department = req.headers["x-department"];
  const email = req.headers["x-email"];

  let tableName;
  switch (department) {
    case "finance":
      tableName = "finance_access";
      break;
    case "accounts":
      tableName = "accounts_access";
      break;
    case "cfo":
      tableName = "cfo_access";
      break;
    default:
      return res.redirect("/");
  }

  const sql = `SELECT * FROM ${tableName} WHERE mailid = ?`;
  db.query(sql, [email], (err, result) => {
    if (err || result.length === 0) {
      return res.redirect("/");
    }
    req.department = department; // Store department in request object for future use
    next();
  });
}

// Endpoint to verify access
app.post("/api/verifyAccess", (req, res) => {
  const { department, email } = req.body;

  let tableName;
  switch (department) {
    case "finance":
      tableName = "finance_access";
      break;
    case "accounts":
      tableName = "accounts_access";
      break;
    case "cfo":
      tableName = "cfo_access";
      break;
    default:
      return res.status(400).json({ error: "Invalid department" });
  }

  const sql = `SELECT * FROM ${tableName} WHERE mailid = ?`;
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    if (result.length > 0) {
      res.json({ accessGranted: true, department });
    } else {
      res.json({ accessGranted: false });
    }
  });
});

// Endpoint to fetch entries (restricted to CFO)
app.get("/api/entries", checkAccess, (req, res) => {
  const { department } = req;
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

app.post("/api/entries", checkAccess, (req, res) => {
  const { department } = req;
  if (department === "finance" || department === "accounts") {
    const {
      department,
      mailid,
      type,
      amount,
      entry_date,
      name,
      accountNumber,
    } = req.body;
    if (!name || !accountNumber) {
      res.status(400).json({ error: "Name and account number are required" });
      return;
    }
    const sql =
      "INSERT INTO entries (department, mailid, type, amount, entry_date, name, acc_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [department, mailid, type, amount, entry_date, name, accountNumber],
      (err, result) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        res.json({
          success: true,
          message: "Entry added successfully",
          id: result.insertId,
        });
      }
    );
  } else {
    res.status(403).json({ error: "Unauthorized" });
  }
});

// Endpoint to request access
app.post("/api/requestAccess", (req, res) => {
  const { department, email } = req.body;
  const sql = "INSERT INTO access_requests (department, mailid) VALUES (?, ?)";
  db.query(sql, [department, email], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ success: true, message: "Access request submitted successfully" });
  });
});

app.post("/api/acceptAccess",  (req, res) => {
  // const { department } = req;
  const { requestDepartment , requestMailid } = req.body;
  const tableName = `${requestDepartment}_access`;
  const sql = `INSERT INTO ${tableName} (mailid) VALUES (?)`;
  db.query(sql, [requestMailid], (err, result) => {
    if (err){
      console.error("Error executing query", err);
      res.status(500).json({error: "Internal server error"});
      return;
    }
    res.json({ success:true, message:"Request accepted successfully"});
  });
});
app.post("/api/deleteAccessRequest", (req, res) => {
  const { requestId } = req.body;
  const sql = "DELETE FROM access_requests WHERE id = ?"; // Corrected table name

  db.query(sql, [requestId], (err, result) => {
    if (err) {
      console.error("Error deleting request:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json({ success: true, message: "Request deleted successfully" });
  });
});

app.get("/api/accessRequests", checkAccess, (req, res) => {
  const { department } = req;
  if (department === "cfo") {
    const sql = "SELECT * FROM access_requests";
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

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
