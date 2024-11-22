const express = require('express');
const router = express.Router();

const db = require('../db');

// Get players performance
router.get('/', async (req, res) => {
    const name = req.query.name || '';
    const seasonLow = req.query.season_low || '2000-01';
    const seasonHigh = req.query.season_high || '2022-23';
    const ageLow = parseInt(req.query.age_low || 20);
    const ageHigh = parseInt(req.query.age_high || 30);
    const weightLow = parseInt(req.query.weight_low || 80);
    const weightHigh = parseInt(req.query.weight_high || 100);
    const avgPointsLow = parseFloat(req.query.avg_points_low || 10);
    const avgPointsHigh = parseFloat(req.query.avg_points_high || 100);
    const rankCategory = req.query.rank_category || '';
    const country = req.query.country || '';
    const college = req.query.college || '';
    const draftYear = req.query.draft_year || null;

    try {
        let filters = [];
        let values = [ageLow, ageHigh, weightLow, weightHigh, seasonLow, seasonHigh, avgPointsLow, avgPointsHigh];

        if (name) {
            filters.push(`psn.player_name = $${values.length + 1}`);
            values.push(name);
        }
        if (rankCategory) {
            filters.push(`rank_category = $${values.length + 1}`);
            values.push(rankCategory);
        }
        if (country) {
            filters.push(`pb.country = $${values.length + 1}`);
            values.push(country);
        }
        if (college) {
            filters.push(`pb.college = $${values.length + 1}`);
            values.push(college);
        }
        if (draftYear) {
            filters.push(`pb.draft_year = $${values.length + 1}`);
            values.push(draftYear);
        }

        const whereClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';

        const query = `
            WITH player_points AS (
                SELECT
                    psn.player_name,
                    psn.season,
                    pb.college,
                    pb.country,
                    SUM(ps.pts) AS total_points,
                    AVG(ps.pts) AS avg_points_per_game,
                    CASE
                        WHEN SUM(ps.fga) > 0 THEN SUM(ps.fg) / SUM(ps.fga)
                        ELSE 0
                    END AS fg_percentage,
                    CASE
                        WHEN SUM(ps."3PA") > 0 THEN SUM(ps."3P") / SUM(ps."3PA")
                        ELSE 0
                    END AS three_pt_percentage,
                    COUNT(DISTINCT gr.game_id) AS games_played,
                    COUNT(DISTINCT sm.shot_id) AS total_shots_made,
                    AVG(sm.shot_distance) AS avg_shot_distance
                FROM
                    player_stats ps
                JOIN
                    game_results gr ON ps.game_id = gr.game_id
                JOIN
                    player_seasons psn ON ps.player = psn.player_name
                    JOIN
                    player_background pb ON psn.player_name = pb.player_name
                LEFT JOIN
                    shots_made sm ON ps.game_id = sm.game_id AND ps.player = sm.player_name
                WHERE
                    gr.result = 1
                    AND psn.age BETWEEN $1 AND $2
                    AND psn.player_weight BETWEEN $3 AND $4
                    AND psn.season BETWEEN $5 AND $6
                    ${whereClause}
                GROUP BY
                    psn.player_name, psn.season, pb.college, pb.country
                HAVING AVG(ps.pts) BETWEEN $7 AND $8
            )
            SELECT *
            FROM player_points
            ORDER BY total_points DESC;
        `;

        const result = await db.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error executing query:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
