import db from "../config/db.js"

export const queryDropdown = (req, res) => {
    const query = "SELECT query_type_id , query_name FROM query_types";
    db.query(query, (error, results) => {
            if (error) return res.status(500).json({ error: error.message });
            res.status(200).json(results);
    });
}

export const responseDropdown = (req, res) => {
    const query = "SELECT response_type_id, response_name FROM response_types";
    db.query(query, (error, results) => {
            if (error) return res.status(500).json({ error: error.message });
            res.status(200).json(results);
    });
}