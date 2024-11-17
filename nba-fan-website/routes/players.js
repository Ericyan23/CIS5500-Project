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

module.exports = router;

// Get player stats
router.get('/stats/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const result = await db.query(
            'SELECT * FROM player_stats WHERE player = $1',
            [name]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching player stats:', err.message);
        res.status(500).send('Server Error');
    }
});

// Get player stats
router.get('/stats/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const result = await db.query(
            'SELECT season, team, pts, ast, drb, orb FROM player_stats WHERE player = $1',
            [name]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching player stats:', err.message);
        res.status(500).send('Server Error');
    }
});

// Get player stats
router.get('/stats/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const result = await db.query(
            'SELECT season, team, pts, ast, drb, orb FROM player_stats WHERE player = $1',
            [name]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching player stats:', err.message);
        res.status(500).send('Server Error');
    }
});

