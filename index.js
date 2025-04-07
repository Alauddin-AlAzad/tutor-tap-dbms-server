// server/index.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://tutortap-bd.web.app',
    'https://tutortap-bd.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Alauddinnn@12',
  database: process.env.DB_NAME || 'tutor_db'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL as id', db.threadId);
});

app.get('/', (req, res) => {
  res.send('Hello from TutorTap MySQL Server!');
});

// Get all tutors (no search or category filtering)
app.get('/tutors', (req, res) => {
  const query = 'SELECT * FROM tutors';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get tutor by ID
app.get('/tutor/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM tutors WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// Get tutors by email
app.get('/tutors/:email', (req, res) => {
  const email = req.params.email;
  const query = 'SELECT * FROM tutors WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a tutor
app.post('/tutors', (req, res) => {
  const tutorData = req.body;
  const query = 'INSERT INTO tutors SET ?';
  db.query(query, tutorData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, insertId: result.insertId });
  });
});

// Update tutor
app.put('/tutors/:id', (req, res) => {
  const id = req.params.id;
  const tutorData = req.body;
  const query = 'UPDATE tutors SET ? WHERE id = ?';
  db.query(query, [tutorData, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Delete tutor
app.delete('/tutors/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM tutors WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Book a tutor
app.post('/booked-tutors', (req, res) => {
  const data = req.body;
  const query = 'INSERT INTO booked_tutors (student_email, tutor_id, booking_time) VALUES (?, ?, NOW())';
  db.query(query, [data.userEmail, data.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const updateQuery = 'UPDATE tutors SET review = review + 1 WHERE id = ?';
    db.query(updateQuery, [data.id], () => {});
    res.json({ success: true });
  });
});

// Get booked tutors by student email
app.get('/booked-tutors', (req, res) => {
  const email = req.query.email;
  const query = `
    SELECT b.id, b.booking_time, t.name, t.subject, t.photo_url
    FROM booked_tutors b
    JOIN tutors t ON b.tutor_id = t.id
    WHERE b.student_email = ?`;
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get total bookings (used for statistics)
app.get('/totalUser', (req, res) => {
  const query = 'SELECT COUNT(*) AS total FROM booked_tutors';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ result: results[0].total });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});