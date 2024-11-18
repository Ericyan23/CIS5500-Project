const express = require('express');
const router = express.Router();
const db = require('../db');

// Get recent game results
router.get('/', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM game_results ORDER BY date DESC LIMIT 10'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching games:', err.stack);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
