const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all players
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM player_background LIMIT 10');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching players:', err.stack);
        res.status(500).send('Server Error');
    }
});

// Get player by name
router.get('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const result = await db.query(
            'SELECT * FROM player_background WHERE player_name = $1',
            [name]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching player:', err.message);
        res.status(500).send('Server Error');
    }
});

// Get player stats
router.get('/stats/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const result = await db.query(
            `WITH player_performance AS (
                SELECT
                    ps.player,
                    LEFT(CAST(ps.game_id AS VARCHAR), 4) AS season,
                    ps.team,
                    ps.game_id,
                    COALESCE(ps.pts, 0) AS pts,
                    COALESCE(ps.ast, 0) AS ast,
                    COALESCE(ps.orb, 0) + COALESCE(ps.drb, 0) AS total_rebounds
                FROM player_stats ps
            ),
            winning_games AS (
                SELECT
                    game_id, home_team, away_team, home_score, away_score,
                    CASE WHEN home_score > away_score THEN home_team ELSE away_team END AS winning_team
                FROM game_results
            ),
            player_wins AS (
                SELECT
                    pp.player,
                    pp.season,
                    pp.team,
                    pp.pts,
                    pp.ast,
                    pp.total_rebounds
                FROM player_performance pp
                JOIN winning_games wg
                ON pp.team = wg.winning_team AND pp.game_id = wg.game_id
            )
            SELECT
                pw.player AS player_name,
                pw.season,
                ROUND(AVG(pw.pts), 2) AS avg_points,
                ROUND(AVG(pw.ast), 2) AS avg_assists,
                ROUND(AVG(pw.total_rebounds), 2) AS avg_rebounds
            FROM player_wins pw
            WHERE player = $1
            GROUP BY pw.player, pw.season, pw.team
            ORDER BY pw.season;`,
            [name]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching player stats:', err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;
