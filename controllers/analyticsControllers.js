import db from "../config/db.js"

export const getTopCustomers = (req, res) => {
    const query = `
    SELECT 
        ca.customer_id, 
        c.name AS customer_name, 
        COUNT(ca.customer_activity_id) AS total_activities
    FROM 
        customer_activity ca
        LEFT JOIN customers c ON ca.customer_id = c.customer_id
    GROUP BY 
        ca.customer_id, 
        c.name
    ORDER BY 
        total_activities DESC;
    `;
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
}

export const actiivityTypeDistribution = (req, res) => {
    const query = `
    SELECT 
        ca.activity_type, 
        COUNT(ca.customer_activity_id) AS total_activities
    FROM 
        customer_activity ca
    GROUP BY 
        ca.activity_type;
    `;
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
}