import db from "../config/db.js";

export const getPendingActivities = (req, res) => {
  const query =
    "SELECT COUNT(*) as pending_count FROM customer_activity WHERE case_resolved = 'Pending'";
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};

export const getResolvedActivities = (req, res) => {
  const query =
    "SELECT COUNT(*) as resolved_count FROM customer_activity WHERE case_resolved = 'Resolved'";
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};

export const getRecentActivities = (req, res) => {
  const query = `
    SELECT 
    ca.activity_type AS 'Activity type',
    c.name AS 'Customer name',
    ca.activity_date AS 'Date',
    IF(ca.case_resolved = 'Resolved', 'Resolved', 'Pending') AS 'Status'
  FROM 
    customer_activity ca
    JOIN customers c ON ca.customer_id = c.customer_id;
    `;

  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
};


export const getUpcomingActivities = (req, res) => {
  const query = `
    SELECT 
      ca.activity_type AS 'Activity type',
      c.name AS 'Customer name',
      ca.next_followup_date AS 'Next followup Date',
      ca.case_resolved AS 'Status'
    FROM 
      customer_activity ca
      JOIN customers c ON ca.customer_id = c.customer_id
    WHERE 
      ca.next_followup_date > CURDATE()
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
      ca.customer_activity_id AS 'Activity ID',
      c.name AS 'Customer Name',
      ca.activity_type AS 'Activity Type',
      ca.activity_date AS 'Date',
      CASE 
        WHEN ca.case_resolved = 'Resolved' THEN 'Resolved'
        ELSE 'Not Resolved'
      END AS 'Status'
    FROM 
      customer_activity ca
    JOIN 
      customers c ON ca.customer_id = c.customer_id;
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
          'activity_type',
          'query',
          'customer_response',
          'overall_response',
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

      // 3. Verify customer and admin exist
      const checkQueries = [
          'SELECT 1 FROM customers WHERE customer_id = ?',
          'SELECT 1 FROM admin WHERE id = ?'
      ];

      const checkValues = [
          req.body.customer_id,
          req.body.created_by
      ];

      for (let i = 0; i < checkQueries.length; i++) {
          const [rows] = await db.promise().query(checkQueries[i], [checkValues[i]]);
          if (rows.length === 0) {
              const fieldName = i === 0 ? 'customer_id' : 'created_by';
              return res.status(400).json({
                  success: false,
                  message: `Invalid reference: ${fieldName} does not exist`
              });
          }
      }

      // 4. Main insert query
      const query = `INSERT INTO customer_activity (
          customer_id,
          activity_date,
          activity_type,
          query,
          customer_response,
          overall_response,
          comments,
          case_resolved,
          resolution,
          next_followup_date,
          created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const [result] = await db.promise().query(query, [
          req.body.customer_id,
          req.body.activity_date,
          req.body.activity_type,
          req.body.query,
          req.body.customer_response,
          req.body.overall_response,
          req.body.comments || null,
          req.body.case_resolved || false,
          req.body.resolution || null,
          req.body.next_followup_date || null,
          req.body.created_by
      ]);

      // 5. Return success response
      res.status(201).json({
          success: true,
          message: 'Activity created successfully',
          data: {
              id: result.insertId,
              ...req.body,
              created_at: new Date(), 
              modified_by: null,
              modified_at: null
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

export const activityDropdown = (req, res) => {
  const query = "SELECT activity_type_id, type_name FROM activity_types";
  db.query(query, (error, results) => {
      if (error) return res.status(500).json({ error: error.message });
      res.status(200).json(results);
  });
}

export const dailyFollowups = (req, res) => {
  const query = `
    SELECT 
      ca.customer_activity_id AS 'Activity ID',
      c.name AS 'Customer Name',
      ca.activity_type AS 'Activity Type',
      ca.next_followup_date AS 'Next followup Date',
      ca.case_resolved AS 'Status'
    FROM 
      customer_activity ca
    JOIN 
      customers c ON ca.customer_id = c.customer_id
    WHERE 
      ca.next_followup_date = CURDATE();
  `;
  
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(results);
  });
}


export const getActivityById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM customer_activity WHERE customer_activity_id = ?";
  db.query(query, [id], (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    if (results.length === 0) return res.status(404).json({ message: "Activity not found." });
    res.status(200).json(results[0]);
  });
};

export const updateActivity = (req, res) => {
  const { id } = req.params;
  const { customer_response, overall_response, comments, resolution, case_resolved, next_followup_date } = req.body;

  // Constructing the dynamic SET clause
  let fields = [];
  let values = [];

  if (customer_response !== undefined) {
    fields.push("customer_response = ?");
    values.push(customer_response);
  }
  if (overall_response !== undefined) {
    fields.push("overall_response = ?");
    values.push(overall_response);
  }
  if (comments !== undefined) {
    fields.push("comments = ?");
    values.push(comments);
  }
  if (resolution !== undefined) {
    fields.push("resolution = ?");
    values.push(resolution);
  }
  if (case_resolved !== undefined) {
    fields.push("case_resolved = ?");
    values.push(case_resolved);
  }
  if (next_followup_date !== undefined) {
    fields.push("next_followup_date = ?");
    values.push(next_followup_date);
  }

  // If no fields to update, return early
  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields provided for update." });
  }

  // Add the id for the WHERE clause
  values.push(id);

  const query = `
    UPDATE customer_activity
    SET ${fields.join(", ")}
    WHERE customer_activity_id = ?
  `;

  db.query(query, values, (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    if (results.affectedRows === 0) return res.status(404).json({ message: "Activity not found." });
    res.status(200).json({ message: "Activity updated successfully!" });
  });
};

export const getCustomerActivity = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM customer_activity WHERE customer_id = ?";
  db.query(query, [id], (error, results) => {
    if (error) return res.status(500).json({ error: error.message });
    if (results.length === 0) return res.status(404).json({ message: "Activity not found." });
    res.status(200).json(results);
  });
};