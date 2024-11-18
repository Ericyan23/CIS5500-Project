const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        console.log('Received request for game results');
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (page - 1) * pageSize;

        console.log(`Fetching results with page=${page}, pageSize=${pageSize}, offset=${offset}`);

        const query = `
            SELECT date, season, home_team, home_score, away_team, away_score
            FROM game_results
            WHERE season BETWEEN 2021 AND 2324
            ORDER BY date DESC
            LIMIT $1 OFFSET $2;
        `;

        const result = await db.query(query, [pageSize, offset]);
        console.log('Query successful, returning results');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching game results:', err.stack);
        res.status(500).json({ error: 'Database query error', details: err.stack });
    }
});

module.exports = router;

