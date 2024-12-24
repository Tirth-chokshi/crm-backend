import express from 'express'
import { queryDropdown,responseDropdown } from '../controllers/queryControllers.js'
const router = express.Router()

router.get('/dropdown',queryDropdown)
router.get('/response',responseDropdown)

export default router