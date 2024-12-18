import express from 'express'
import { register,login,getProfile } from '../controllers/adminControllers.js'
import { verifyToken } from '../middleware/token.js'
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Admin dashboard')
})

router.get('/profile',verifyToken,getProfile)
router.post('/register',register)
router.post('/login',login)

export default router