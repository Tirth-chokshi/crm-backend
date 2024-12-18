import express from 'express'
import { register,login } from '../controllers/adminControllers.js'
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Admin dashboard')
})

router.post('/register',register)
router.post('/login',login)

export default router