const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/top-shooters', async (req, res) => {
    try {
        const query = `
            WITH filtered_player_stats AS (
            SELECT game_id, SUM("3P") AS total_3P, SUM("3PA") AS total_3PA
            FROM player_stats
            WHERE "3P" IS NOT NULL AND "3PA" IS NOT NULL
            GROUP BY game_id)
            SELECT s.player_name, g.season,
            ROUND((SUM(fp.total_3P) * 1.0 / NULLIF(SUM(fp.total_3PA), 0)) * 100, 2) AS three_point_percentage
            FROM shots_made s
            JOIN filtered_player_stats fp ON s.game_id = fp.game_id
            JOIN game_results g ON s.game_id = g.game_id
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

// Player Shooting Performance by Shot Zone
router.get('/shot-zones', async (req, res) => {
    try {
        const query = `
            SELECT s.player_name, r.season, s.zone_abb,
                COUNT(*) AS total_shots,
                ROUND((SUM(s.shot_made) * 1.0 / COUNT(*)) * 100, 2) AS shooting_percentage
            FROM shots_made s
            JOIN game_results r ON s.game_id = r.game_id
            GROUP BY s.player_name, r.season, s.zone_abb
            ORDER BY s.player_name, r.season, s.zone_abb;
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching player shot zones:', err.stack);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
