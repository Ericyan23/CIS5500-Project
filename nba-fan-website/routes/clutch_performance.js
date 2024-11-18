const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    const season = req.query.season;

    const query = `
        WITH player_clutch_shots_performance AS (
            SELECT s.player_name, s.zone_abb, g.season,
                   COUNT(s.shot_id) AS total_shots,
                   SUM(s.shot_made) AS shots_made
            FROM shots_made s
            JOIN game_results g ON s.game_id = g.game_id
            WHERE s.quarter >= 4
            GROUP BY s.player_name, s.zone_abb, g.season
        )
        SELECT player_name, zone_abb, season, shots_made, total_shots,
               ROUND((shots_made * 1.0 / total_shots) * 100, 2) AS clutch_shot_percentage
        FROM player_clutch_shots_performance
        WHERE season = COALESCE($1, (SELECT MAX(season) FROM game_results))
        ORDER BY player_name, zone_abb;
    `;

    try {
        const result = await db.query(query, [season || null]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching clutch performance data:', err.stack);
        res.status(500).json({ error: 'Database query error', details: err.stack });
    }
});

router.get('/seasons', async (req, res) => {
    try {
        const result = await db.query('SELECT DISTINCT season FROM game_results ORDER BY season DESC');
        const seasons = result.rows.map(row => row.season);
        res.json(seasons);
    } catch (err) {
        console.error('Error fetching seasons:', err.stack);
        res.status(500).json({ error: 'Database query error', details: err.stack });
    }
});

module.exports = router;