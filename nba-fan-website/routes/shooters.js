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

// Search route to filter shot performance by name, season, and zone
router.get('/search-shot-performance', async (req, res) => {
    const { player_name, season, zone_abb } = req.query;
    console.log('Received query parameters:', { player_name, season, zone_abb })
    try {
        const query = `
            SELECT s.player_name, r.season, s.zone_abb,
                COUNT(*) AS total_shots,
                ROUND((SUM(s.shot_made) * 1.0 / COUNT(*)) * 100, 2) AS shooting_percentage
            FROM shots_made s
            JOIN game_results r ON s.game_id = r.game_id
            WHERE ($1::text IS NULL OR s.player_name ILIKE $1)
              AND ($2::integer IS NULL OR r.season = $2::integer)
              AND ($3::text IS NULL OR s.zone_abb = $3)
            GROUP BY s.player_name, r.season, s.zone_abb
            ORDER BY s.player_name, r.season, s.zone_abb;
        `;

        console.log('Executing SQL query:', query);
        console.log('Query parameters:', [player_name || null, season || null, zone_abb || null]);

        const result = await db.query(query, [
            player_name || null,
            season || null,
            zone_abb || null,
        ]);

        console.log('Query result:', result.rows);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching filtered shot performance:', err.stack);
        res.status(500).send('Server Error');
    }
});

// Fetch distinct seasons
router.get('/seasons', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT season
            FROM game_results
            ORDER BY season DESC;
        `;
        const result = await db.query(query);
        const seasons = result.rows.map(row => row.season);
        res.json(seasons);
    } catch (err) {
        console.error('Error fetching seasons:', err.stack);
        res.status(500).send('Server Error');
    }
});

// Fetch distinct shot zones
router.get('/zones', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT zone_abb
            FROM shots_made
            ORDER BY zone_abb;
        `;
        const result = await db.query(query);
        res.json(result.rows.map(row => row.zone_abb));
    } catch (err) {
        console.error('Error fetching shot zones:', err.stack);
        res.status(500).send('Server Error');
    }
});



module.exports = router;
