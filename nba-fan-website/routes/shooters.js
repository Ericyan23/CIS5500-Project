const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/top-shooters', async (req, res) => {
    try {
        const query = `
            SELECT s.player_name, g.season,
                ROUND((SUM(p."3P") * 1.0 / NULLIF(SUM(p."3PA"), 0)) * 100, 2) AS three_point_percentage
            FROM shots_made s
            JOIN player_stats p ON s.game_id = p.game_id
            JOIN game_results g ON s.game_id = g.game_id
            WHERE p."3P" IS NOT NULL AND p."3PA" IS NOT NULL
            GROUP BY s.player_name, g.season
            ORDER BY three_point_percentage DESC
            LIMIT 10;
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching top shooters:', err.stack);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
