const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/top-shooters', async (req, res) => {
    try {
        const query = `
            WITH filtered_game_results AS (
                SELECT game_id, season
                FROM game_results
                WHERE season BETWEEN 1819 AND 2223
            ),
            player_game_3P AS (
                SELECT s.player_name, g.season, fp.total_3P, fp.total_3PA
                FROM shots_made s
                JOIN mv_filtered_player_stats fp ON s.game_id = fp.game_id
                JOIN filtered_game_results g ON s.game_id = g.game_id
            ),
            player_season_3P AS (
                SELECT
                    player_name,
                    season,
                    SUM(total_3P) AS season_total_3P,
                    SUM(total_3PA) AS season_total_3PA
                FROM player_game_3P
                GROUP BY player_name, season
            )
            SELECT
                player_name,
                season,
                ROUND((season_total_3P * 1.0 / NULLIF(season_total_3PA, 0)) * 100, 2) AS three_point_percentage
            FROM player_season_3P
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
            WITH player_clutch_shots_performance AS (
            SELECT s.player_name, s.zone_abb, g.season,
           COUNT(s.shot_id) AS total_clutch_shots,
           SUM(s.shot_made) AS clutch_shots_made
            FROM shots_made s
            JOIN game_results g ON s.game_id = g.game_id
            WHERE s.quarter >= 4
            GROUP BY s.player_name, s.zone_abb, g.season
        )
        SELECT s.player_name, 
            r.season, 
            s.zone_abb,
            COUNT(*) AS total_shots,
            ROUND((SUM(s.shot_made) * 1.0 / COUNT(*)) * 100, 2) AS shooting_percentage,
            COALESCE(pcl.clutch_shots_made, 0) AS clutch_shots_made,
            COALESCE(pcl.total_clutch_shots, 0) AS total_clutch_shots,
            COALESCE(ROUND((pcl.clutch_shots_made * 1.0 / NULLIF(pcl.total_clutch_shots, 0)) * 100, 2), 0) AS clutch_shot_percentage
        FROM shots_made s
        JOIN game_results r ON s.game_id = r.game_id
        LEFT JOIN player_clutch_shots_performance pcl 
            ON s.player_name = pcl.player_name 
            AND r.season = pcl.season 
            AND s.zone_abb = pcl.zone_abb
        WHERE ($1::text IS NULL OR s.player_name ILIKE $1)
        AND ($2::integer IS NULL OR r.season = $2::integer)
        AND ($3::text IS NULL OR s.zone_abb = $3)
        GROUP BY s.player_name, r.season, s.zone_abb, pcl.clutch_shots_made, pcl.total_clutch_shots
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
