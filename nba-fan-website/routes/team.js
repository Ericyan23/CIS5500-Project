const express = require('express');
const router = express.Router();
const db = require('../db');

// Local team logos mapping
const teamLogos = {
    ATL: "/logos/atl.png",
    BOS: "/logos/bos.png",
    BRK: "/logos/brk.png",
    CHA: "/logos/cha.png",
    CHI: "/logos/chi.png",
    CHO: "/logos/cho.png",
    CLE: "/logos/cle.png",
    DAL: "/logos/dal.png",
    DEN: "/logos/den.png",
    DET: "/logos/det.png",
    GSW: "/logos/gsw.png",
    HOU: "/logos/hou.png",
    IND: "/logos/ind.png",
    LAC: "/logos/lac.png",
    LAL: "/logos/lal.png",
    MEM: "/logos/mem.png",
    MIA: "/logos/mia.png",
    MIL: "/logos/mil.png",
    MIN: "/logos/min.png",
    NOP: "/logos/nop.png",
    NYK: "/logos/nyk.png",
    OKC: "/logos/okc.png",
    ORL: "/logos/orl.png",
    PHI: "/logos/phi.png",
    PHO: "/logos/pho.png",
    POR: "/logos/por.png",
    SAC: "/logos/sac.png",
    SAS: "/logos/sas.png",
    TOR: "/logos/tor.png",
    UTA: "/logos/uta.png",
    WAS: "/logos/was.png",
};

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

// Get three-point percentages for all teams
router.get('/three-point-percentages/all', async (req, res) => {
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
                   ((avg_3pt_per_game / NULLIF(avg_total_shots_per_game, 0)) * 100) AS three_pt_percentages
            FROM team_average
        )
        SELECT team, season, three_pt_percentages
        FROM team_percentages
        ORDER BY team, season;
    `;

    try {
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching three-point percentages:', err.stack);
        res.status(500).send('Server Error');
    }
});

module.exports = router;