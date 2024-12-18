import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../config/db.js"

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
        // res.status(201).json({ user: user._id })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}