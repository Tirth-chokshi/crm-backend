import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../config/db.js"
import dotenv from "dotenv"
import crypto from "crypto"
import nodemailer from "nodemailer"

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
                { expiresIn: "12h" } 
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

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        
        // Update admin with reset token
        const query = `UPDATE admin SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`;
        db.query(query, [resetToken, resetTokenExpiry, email], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Error updating reset token", error: err.message });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "No account found with that email" });
            }
            
            // Create email transporter with corrected configuration
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            
            // Send reset email with better HTML formatting
            const resetUrl = `${process.env.FRONTEND_URL}/reset_password/${resetToken}`;
            await transporter.sendMail({
                from: `"CRM System" <${process.env.SMTP_FROM}>`,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Password Reset Request</h2>
                        <p>You requested a password reset for your CRM account.</p>
                        <p>Please click the button below to reset your password:</p>
                        <div style="margin: 20px 0;">
                            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
                        </div>
                        <p><strong>Note:</strong> This link will expire in 1 hour.</p>
                        <p>If you didn't request this reset, please ignore this email.</p>
                    </div>
                `
            });
            
            res.status(200).json({ message: "Password reset email sent" });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Find admin with valid reset token
        const query = `
            SELECT id FROM admin 
            WHERE reset_token = ? 
            AND reset_token_expiry > NOW()
        `;
        
        db.query(query, [token], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Error finding admin", error: err.message });
            }
            
            if (results.length === 0) {
                return res.status(400).json({ message: "Invalid or expired reset token" });
            }
            
            // Hash new password and update admin
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateQuery = `
                UPDATE admin 
                SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
                WHERE id = ?
            `;
            
            db.query(updateQuery, [hashedPassword, results[0].id], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({ message: "Error updating password", error: updateErr.message });
                }
                
                res.status(200).json({ message: "Password updated successfully" });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error)
    }
};