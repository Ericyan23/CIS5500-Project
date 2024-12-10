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

        // Get aggregated stats from player_stats
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

        res.json({
            player,
            stats: null,
            seasons: seasons
        });
    } catch (error) {
        console.error('Error fetching player details:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
