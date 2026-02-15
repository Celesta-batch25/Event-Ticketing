import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve frontend files

// --- Database Setup (SQLite) ---
const db = new sqlite3.Database('./participants.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize Schema
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS attendees (
            id TEXT PRIMARY KEY,
            fullName TEXT,
            email TEXT,
            role TEXT,
            ticketType TEXT,
            status TEXT,
            aiPersona TEXT,
            checkInTime TEXT
        )
    `);
});

// --- API Routes ---

// 1. Register a new attendee
app.post('/api/register', (req, res) => {
    const { id, fullName, email, role, ticketType, status, aiPersona, checkInTime } = req.body;
    
    const sql = `INSERT INTO attendees (id, fullName, email, role, ticketType, status, aiPersona, checkInTime) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [id, fullName, email, role, ticketType, status, aiPersona, checkInTime];

    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'success', data: req.body });
    });
});

// 2. Get all attendees (for Admin Dashboard)
app.get('/api/attendees', (req, res) => {
    const sql = "SELECT * FROM attendees";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'success', data: rows });
    });
});

// 3. Check-in an attendee
app.post('/api/checkin', (req, res) => {
    const { id, checkInTime } = req.body;
    
    // First check if user exists and current status
    db.get("SELECT * FROM attendees WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Attendee not found' });
            return;
        }
        if (row.status === 'Checked In') {
            res.status(409).json({ error: 'Already checked in', attendee: row });
            return;
        }

        // Proceed to update
        const sql = `UPDATE attendees SET status = ?, checkInTime = ? WHERE id = ?`;
        db.run(sql, ['Checked In', checkInTime, id], function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            // Return updated object
            res.json({ 
                message: 'success', 
                data: { ...row, status: 'Checked In', checkInTime } 
            });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`To access from other devices, use http://YOUR_LOCAL_IP:${PORT}`);
});
