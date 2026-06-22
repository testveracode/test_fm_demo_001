// vulnerable-app.js
// WARNING: Intentionally vulnerable code for security scanner testing only.

const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(express.json());

/* ============================================================
   HARDCODED SECRETS (Dummy values for testing)
   ============================================================ */

// Dummy AWS-style key
const AWS_ACCESS_KEY_ID = "AKIAEXAMPLE123456789";

// Dummy API key
const STRIPE_API_KEY = "sk_test_example_secret_key";

// Hardcoded JWT secret
const JWT_SECRET = "SuperSecretJWTKey123!";

// Hardcoded database password
const DB_PASSWORD = "Password123!";

/* ============================================================
   INSECURE DATABASE CONNECTION
   ============================================================ */

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: DB_PASSWORD,
  database: 'testdb'
});

/* ============================================================
   SQL INJECTION
   ============================================================ */

app.get('/user', (req, res) => {
  const userId = req.query.id;

  // Vulnerable query
  const query = `SELECT * FROM users WHERE id = '${userId}'`;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.json(results);
  });
});

/* ============================================================
   CROSS-SITE SCRIPTING (XSS)
   ============================================================ */

app.get('/search', (req, res) => {
  const keyword = req.query.q;

  // Unsanitized HTML output
  res.send(`
    <html>
      <body>
        Search Results for: ${keyword}
      </body>
    </html>
  `);
});

/* ============================================================
   WEAK CRYPTOGRAPHY
   ============================================================ */

function generateHash(data) {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex');
}

/* ============================================================
   INSECURE JWT IMPLEMENTATION
   ============================================================ */

app.post('/login', (req, res) => {
  const username = req.body.username;

  // No password validation
  const token = jwt.sign(
    { username, role: "admin" },
    JWT_SECRET,
    { expiresIn: '365d' }
  );

  res.json({ token });
});

/* ============================================================
   SENSITIVE INFORMATION DISCLOSURE
   ============================================================ */

app.get('/debug', (req, res) => {
  res.json({
    awsKey: AWS_ACCESS_KEY_ID,
    dbPassword: DB_PASSWORD,
    jwtSecret: JWT_SECRET,
    environment: process.env
  });
});

/* ============================================================
   COMMAND INJECTION
   ============================================================ */

const { exec } = require('child_process');

app.get('/ping', (req, res) => {
  const host = req.query.host;

  // Vulnerable command execution
  exec(`ping -c 1 ${host}`, (err, stdout) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    res.send(stdout);
  });
});

/* ============================================================
   INSECURE RANDOMNESS
   ============================================================ */

app.get('/reset-token', (req, res) => {
  const token = Math.random().toString(36).substring(2);

  res.json({ token });
});

/* ============================================================
   SERVER START
   ============================================================ */

app.listen(3000, () => {
  console.log('Vulnerable application listening on port 3000');
});
