import express from 'express'
import { register } from '../controllers/adminControllers.js'
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Admin dashboard')
})

router.post('/register',register)

export default router