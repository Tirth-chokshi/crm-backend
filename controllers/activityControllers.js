import db from "../config/db.js";

export const getPendingActivities = (req, res) => {
  const query =
    "SELECT COUNT(*) as pending_count FROM customer_activities WHERE is_resolved = 0";
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};

export const getResolvedActivities = (req, res) => {
  const query =
    "SELECT COUNT(*) as resolved_count FROM customer_activities WHERE is_resolved = 1";
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};

export const getRecentActivities = (req, res) => {
  const query = `
    SELECT 
    at.type_name AS 'Activity type',
    c.name AS 'Customer name',
    ca.activity_date AS 'Date',
    IF(ca.is_resolved = 1, 'Resolved', 'Pending') AS 'Status'
  FROM 
    customer_activities ca
    JOIN customers c ON ca.customer_id = c.customer_id
    JOIN activity_types at ON ca.activity_type_id = at.activity_type_id;
    `;

  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};

export const getActivityTypesTable = (req, res) => {
  const query = "SELECT * FROM  customer_activities";
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};

export const getUpcomingActivities = (req, res) => {
  const query = `
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
    `;
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};

export const getMainActivity = (req, res) => {
  const query = `
    SELECT 
    ca.activity_id AS 'Activity ID',
    c.name AS 'Customer Name',
    at.type_name AS 'Activity Type',
    ca.activity_date AS 'Date',
    IF(ca.is_resolved = 1, 'Resolved', 'Not Resolved') AS 'Status'
FROM 
    customer_activities ca
JOIN 
    customers c ON ca.customer_id = c.customer_id
JOIN 
    activity_types at ON ca.activity_type_id = at.activity_type_id;
    `;
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};

export const createActivity = async (req, res) => {
    try {
        // 1. Required fields validation
        const requiredFields = [
            'customer_id',
            'activity_date',
            'activity_type_id',
            'query_type_id',
            'customer_response_type_id',
            'overall_response_type_id',
            'created_by'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // 2. Data type validation
        if (!Date.parse(req.body.activity_date)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid activity_date format'
            });
        }

        // 3. Verify foreign keys exist
        const checkQueries = [
            'SELECT 1 FROM customers WHERE customer_id = ?',
            'SELECT 1 FROM activity_types WHERE activity_type_id = ?',
            'SELECT 1 FROM query_types WHERE query_type_id = ?',
            'SELECT 1 FROM response_types WHERE response_type_id = ?',
            'SELECT 1 FROM admin WHERE id = ?'
        ];

        const checkValues = [
            req.body.customer_id,
            req.body.activity_type_id,
            req.body.query_type_id,
            req.body.customer_response_type_id,
            req.body.created_by
        ];

        for (let i = 0; i < checkQueries.length; i++) {
            const [rows] = await db.promise().query(checkQueries[i], [checkValues[i]]);
            if (rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid reference: ${requiredFields[i]} does not exist`
                });
            }
        }

        // 4. Main insert query
        const query = `INSERT INTO customer_activities (
            customer_id,
            activity_date,
            activity_type_id,
            query_type_id,
            customer_response_type_id,
            overall_response_type_id,
            comments,
            is_resolved,
            resolution,
            next_followup_date,
            created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.promise().query(query, [
            req.body.customer_id,
            req.body.activity_date,
            req.body.activity_type_id,
            req.body.query_type_id,
            req.body.customer_response_type_id,
            req.body.overall_response_type_id,
            req.body.comments || null,
            req.body.is_resolved || false,
            req.body.resolution || null,
            req.body.next_followup_date || null,
            req.body.created_by
        ]);

        // 5. Return success response
        res.status(201).json({
            success: true,
            message: 'Activity created successfully',
            data: {
                activity_id: result.insertId,
                ...req.body
            }
        });

    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating activity',
            error: error.message
        });
    }
};