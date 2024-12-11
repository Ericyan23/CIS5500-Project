const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    const seasonLow = req.query.season_low || '2000-01';
    const seasonHigh = req.query.season_high || '2022-23';
    const rankCategory = req.query.rank_category || '';

    try {
        const query = `
            WITH ranked_stats AS (
                SELECT
                    pp.player_name,
                    pp.season,
                    pp.total_points,
                    ROW_NUMBER() OVER (PARTITION BY pp.season ORDER BY pp.total_points DESC) AS season_points_rank,
                    RANK() OVER (PARTITION BY pp.season ORDER BY pp.avg_shot_distance DESC) AS shot_distance_rank,
                    SUM(pp.total_points) OVER (PARTITION BY pp.season ORDER BY pp.total_points DESC) AS cumulative_points,
                    pp.avg_shot_distance
                FROM player_points_mv pp
            ),
            final_selection AS (
                SELECT
                    rs.player_name,
                    rs.season,
                    rs.total_points,
                    rs.season_points_rank,
                    rs.shot_distance_rank,
                    rs.cumulative_points,
                    CASE
                        WHEN rs.season_points_rank <= 5 THEN 'Top 5'
                        WHEN rs.season_points_rank BETWEEN 6 AND 10 THEN 'Top 10'
                        ELSE 'Others'
                    END AS rank_category,
                    AVG(rs.total_points) OVER (PARTITION BY rs.season) AS avg_season_points,
                    ROW_NUMBER() OVER (PARTITION BY rs.season ORDER BY rs.cumulative_points DESC) AS season_rank
                FROM ranked_stats rs
            )
            SELECT *
            FROM final_selection
            WHERE season BETWEEN $1 AND $2
              AND ($3 = '' OR rank_category = $3)
            ORDER BY season, season_rank;
        `;
        const values = [seasonLow, seasonHigh, rankCategory];
        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error executing query:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
