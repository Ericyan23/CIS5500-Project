const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all teams
router.get('/', async (req, res) => {
    const query = `
        SELECT DISTINCT ps.team AS team_abbreviation
        FROM player_stats ps
        JOIN game_results gr ON ps.game_id = gr.game_id
        WHERE ps.team IS NOT NULL
        ORDER BY ps.team;
    `;

    try {
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching teams:', err.stack);
        res.status(500).send('Server Error');
    }
});

// Get stats for a specific team
router.get('/:team', async (req, res) => {
    const { team } = req.params;

    const query = `
        SELECT gr.season, ps.team,
               ROUND(SUM(ps.fg) / NULLIF(SUM(ps.fga), 0) * 100, 2) AS field_goal_percentage,
               ROUND(SUM(ps."3P") / NULLIF(SUM(ps."3PA"), 0) * 100, 2) AS three_point_percentage
        FROM player_stats ps
        JOIN game_results gr ON ps.game_id = gr.game_id
        WHERE ps.team = $1
        GROUP BY gr.season, ps.team
        ORDER BY gr.season DESC;
    `;

    try {
        const result = await db.query(query, [team]);
        res.json(result.rows);
    } catch (err) {
        console.error(`Error fetching stats for team ${team}:`, err.stack);
        res.status(500).send('Server Error');
    }
});

module.exports = router;