import express from "express"
import { getAllCustomers,getCustomerById,deleteCustomer,updateCustomer,createCustomer } from "../controllers/customerControllers.js"

const router = express.Router()

router.get('/',getAllCustomers)
router.get('/:id',getCustomerById)
router.delete('/:id',deleteCustomer)
router.put('/:id',updateCustomer)
router.post('/',createCustomer)

export default router