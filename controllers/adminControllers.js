import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../config/db.js"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const query = `SELECT * FROM admin WHERE email = ?`
        db.query(query, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error finding admin", error: err.message });
            }
            if (results.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const admin = results[0];
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }
            const token = jwt.sign(
                { id: admin.id, username: admin.username, email: admin.email },
                JWT_SECRET,
                { expiresIn: "1h" } 
            );
            // req.session.adminId = admin.id;
            res.status(200).json({
                message: "Login successful",
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email
                },
            });
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
          }
        
          const hashedPassword = await bcrypt.hash(password, 10);

          const query = `INSERT INTO admin (username, email, password) VALUES (?, ?, ?)`
          db.query(query, [username, email, hashedPassword],(err) =>{
            if(err){
                return res.status(500).json({ message: 'Error registering admin', error: err.message })
            }
            res.status(201).json({ message: 'Admin registered successfully' })
          } )
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getProfile = async (req, res) => {
    try {
        const adminId = req.admin.id
        const query = `SELECT * FROM admin WHERE id = ?`
        db.query(query, [adminId], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Error finding admin', error: err.message })
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'Admin not found' })
            }
            const admin = results[0]
            res.status(200).json({ admin })
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const adminDropdown = (req, res) => {
    const query = "SELECT id, username FROM admin";
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
}