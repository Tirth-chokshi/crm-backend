import db from '../config/db.js';

// Create a new customer
export const createCustomer = (req, res) => {
    const { name, mobile, email } = req.body;
    const createdAt = new Date();
    const modifiedAt = new Date();
    const query = 'INSERT INTO customers (name, mobile, email, created_at, modified_at) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, mobile, email, createdAt, modifiedAt], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ message: 'Customer created successfully!', customerId: results.insertId });
    });
};

// Get all customers
export const getAllCustomers = (req, res) => {
    const query = 'SELECT * FROM customers WHERE is_active = TRUE';
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
};

// Get customer by ID
export const getCustomerById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM customers WHERE customer_id = ? AND is_active = TRUE';
    db.query(query, [id], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Customer not found.' });
        res.status(200).json(results[0]);
    });
};

// Update customer
export const updateCustomer = (req, res) => {
    const { id } = req.params;
    const { name, mobile, email } = req.body;
    const modifiedAt = new Date();
    const query = 'UPDATE customers SET name = ?, mobile = ?, email = ?, modified_at = ? WHERE customer_id = ?';
    db.query(query, [name, mobile, email, modifiedAt, id], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Customer not found.' });
        res.status(200).json({ message: 'Customer updated successfully!' });
    });
};

// Delete customer (deactivate)
export const deleteCustomer = (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE customers SET is_active = FALSE WHERE customer_id = ?';
    db.query(query, [id], (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Customer not found.' });
        res.status(200).json({ message: 'Customer deactivated successfully!' });
    });
};
