const express = require('express');
const path = require('path');
const mysql2 = require('mysql2');
const app = express();

// Database connection
const database = mysql2.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "San61mani@61",
    database: "users"
});

database.connect((error) => {
    if (error) {
        return console.error("Error connecting to MySQL:", error);
    }
    console.log("MySQL database is connected....");
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Get the next reference ID (max ID + 1)
app.get('/getnextid', (req, res) => {
    const SQL = "SELECT MAX(id) + 1 AS nextId FROM detail";
    
    database.query(SQL, (err, result) => {
        if (err) {
            console.error("Error fetching next ID:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        // If no records exist, start with 1
        const nextId = result[0].nextId || 1;
        res.json({ nextId });
    });
});

// CREATE operation
app.post('/handleform', (req, res) => {
    const { ref_id, type, friend, friendnumber, name, yournumber, pincode, address } = req.body;

    const SQL_COMMAND = `
        INSERT INTO detail 
        (id, type, friend, friendnumber, name, yournumber, pincode, address) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    database.query(SQL_COMMAND, 
        [ref_id, type, friend, friendnumber, name, yournumber, pincode, address], 
        (err, result) => {
            if (err) {
                console.error("Error inserting data:", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }

            // Get the next available ID
            database.query("SELECT MAX(id) + 1 AS nextId FROM detail", (err, idResult) => {
                if (err) {
                    console.error("Error getting next ID:", err);
                    return res.status(500).json({ success: false, error: "Database error" });
                }

                const nextId = idResult[0].nextId || 1;
                res.json({ 
                    success: true,
                    newId: ref_id,
                    nextId: nextId
                });
            });
        }
    );
});

// READ operation - Get single record
app.get('/fetchdata', (req, res) => {
    const id = req.query.id;
    
    if (!id) {
        return res.status(400).json({ error: "ID is required" });
    }

    const SQL_COMMAND = "SELECT * FROM detail WHERE id = ?";
    
    database.query(SQL_COMMAND, [id], (err, result) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: "No data found for the given ID" });
        }

        res.json(result[0]);
    });
});

// UPDATE operation
app.put('/updatedata', (req, res) => {
    const { ref_id, type, friend, friendnumber, name, yournumber, pincode, address } = req.body;
    
    if (!ref_id) {
        return res.status(400).json({ success: false, error: "Reference ID is required for update" });
    }

    const SQL_COMMAND = `
        UPDATE detail 
        SET type=?, friend=?, friendnumber=?, name=?, yournumber=?, pincode=?, address=? 
        WHERE id=?
    `;
    
    database.query(SQL_COMMAND, 
        [type, friend, friendnumber, name, yournumber, pincode, address, ref_id], 
        (err, result) => {
            if (err) {
                console.error("Error updating data:", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }

            if (result.affectedRows === 0) {
                return res.json({ success: false, error: "No record found with that ID" });
            }

            res.json({ success: true });
        }
    );
});

// DELETE operation
app.delete('/deletedata', (req, res) => {
    const id = req.query.id;
    
    if (!id) {
        return res.status(400).json({ success: false, error: "ID is required for deletion" });
    }

    const SQL_COMMAND = "DELETE FROM detail WHERE id = ?";
    
    database.query(SQL_COMMAND, [id], (err, result) => {
        if (err) {
            console.error("Error deleting data:", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.json({ success: false, error: "No record found with that ID" });
        }

        // After deletion, get the next available ID
        database.query("SELECT MAX(id) + 1 AS nextId FROM detail", (err, idResult) => {
            if (err) {
                console.error("Error getting next ID:", err);
                return res.status(500).json({ success: false, error: "Database error" });
            }

            const nextId = idResult[0].nextId || 1;
            res.json({ 
                success: true,
                nextId: nextId
            });
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

app.get('/cancel', (req, res) => {
    res.render('cancel');
});

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});