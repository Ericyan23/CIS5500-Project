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
        WITH team_average AS (
            SELECT team, season,
                ROUND(AVG(three_points_attempted), 2) AS avg_3pt_per_game,
                ROUND(AVG(total_shots), 2) AS avg_total_shots_per_game
            FROM team_shots_mv
            GROUP BY team, season
        ),
        team_percentages AS (
            SELECT team, season,
               ROUND(((avg_3pt_per_game / NULLIF(avg_total_shots_per_game, 0)) * 100), 2) AS three_pt_percentages
            FROM team_average
        )
        SELECT team, season, three_pt_percentages
        FROM team_percentages
        WHERE team = $1
        ORDER BY team, season;
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