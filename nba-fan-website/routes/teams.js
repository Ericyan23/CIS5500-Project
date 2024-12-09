const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all teams
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT DISTINCT team_abbreviation FROM player_seasons');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching teams:', err.stack);
        res.status(500).send('Server Error');
    }
});

// Get team details
router.get('/:team_abbreviation', async (req, res) => {
    try {
        const { team_abbreviation } = req.params;
        const result = await db.query(
            'SELECT * FROM player_seasons WHERE team_abbreviation = $1',
            [team_abbreviation]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching team details:', err.stack);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
