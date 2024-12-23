import db from "../config/db.js"


export const getPendingActivities = (req, res) => {
    const query = "SELECT COUNT(*) as pending_count FROM customer_activities WHERE is_resolved = 0"
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
}

export const getResolvedActivities = (req, res) => {
    const query = "SELECT COUNT(*) as resolved_count FROM customer_activities WHERE is_resolved = 1"
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
}


export const getRecentActivities = (req, res) => {
    const query = 
    `
    SELECT 
    at.type_name AS 'Activity type',
    c.name AS 'Customer name',
    ca.activity_date AS 'Date',
    IF(ca.is_resolved = 1, 'Resolved', 'Pending') AS 'Status'
  FROM 
    customer_activities ca
    JOIN customers c ON ca.customer_id = c.customer_id
    JOIN activity_types at ON ca.activity_type_id = at.activity_type_id;
    `

    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
}

export const getActivityTypesTable = (req, res) => {
    const query = "SELECT * FROM  customer_activities"
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
}

export const getUpcomingActivities = (req, res) => {
    const query = 
    `
    SELECT 
  at.type_name AS 'Activity type',
  c.name AS 'Customer name',
  ca.next_followup_date AS 'Date'
FROM 
  customer_activities ca
  JOIN customers c ON ca.customer_id = c.customer_id
  JOIN activity_types at ON ca.activity_type_id = at.activity_type_id
WHERE 
  ca.next_followup_date >= CURDATE()
ORDER BY 
  ca.next_followup_date ASC;
    `
    db.query(query, (error, results) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json(results);
    });
}
