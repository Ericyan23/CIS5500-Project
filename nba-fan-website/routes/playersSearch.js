// routes/playersSearch.js
const express = require('express');
const router = express.Router();
const db = require('../../../CIS5500-Project 2/nba-fan-website/db');

// GET /api/players-search/suggest?q=<query>
router.get('/suggest', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.json([]);
    }

    try {
        const result = await db.query(`
            SELECT DISTINCT player_name
            FROM player_background
            WHERE player_name ILIKE $1
            ORDER BY player_name ASC
            LIMIT 10;
        `, [`%${q}%`]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/players-search/details?player_name=<player_name>
router.get('/details', async (req, res) => {
    const { player_name } = req.query;
    if (!player_name) {
        return res.status(400).json({ error: 'player_name query param required' });
    }

    try {
        const playerBg = await db.query(`
            SELECT pb.player_name, pb.college, pb.country, pb.draft_year,
                   ps.age, ps.player_height, ps.player_weight
            FROM player_background pb
            LEFT JOIN player_seasons ps ON pb.player_name = ps.player_name
            WHERE pb.player_name = $1
            ORDER BY ps.season DESC
            LIMIT 1;
        `, [player_name]);

        if (playerBg.rows.length === 0) {
            return res.json({ player: null });
        }

        const player = playerBg.rows[0];

        // Original aggregated stats
        const statsQuery = await db.query(`
            SELECT 
                SUM(pts) AS pts,
                SUM(ast) AS ast,
                SUM(orb) AS orb,
                SUM(drb) AS drb
            FROM player_stats
            WHERE player = $1;
        `, [player_name]);

        const totalStats = statsQuery.rows[0] || {};
        const seasons = [{
            season: 'All Stats',
            pts: totalStats.pts || 0,
            ast: totalStats.ast || 0,
            orb: totalStats.orb || 0,
            drb: totalStats.drb || 0
        }];

        // **NEW QUERY**: Query the winning seasons stats
        const winningSeasonsQuery = await db.query(`
            WITH player_performance AS (
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
            ORDER BY pw.season;
        `, [player_name]);

        const winningSeasons = winningSeasonsQuery.rows || [];

        res.json({
            player,
            stats: null,
            seasons: seasons,
            winningSeasons: winningSeasons
        });
    } catch (error) {
        console.error('Error fetching player details:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
