import express from "express"
import { getTotalCustomers,getAllCustomers,getCustomerById,deleteCustomer,updateCustomer,createCustomer,bulkUploadCustomers } from "../controllers/customerControllers.js"

const router = express.Router()

router.get('/',getAllCustomers)
 // you have to put specific route first to make them work /total comes before then /:id
router.get('/total',getTotalCustomers)
router.get('/:id',getCustomerById)
router.delete('/:id',deleteCustomer)
router.put('/:id',updateCustomer)
router.post('/',createCustomer)
router.post('/bulk',bulkUploadCustomers)

export default router