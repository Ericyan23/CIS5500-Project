const { Pool } = require('pg');
const config = require('../config/config.json');

const {
    rds_host,
    rds_port,
    rds_user,
    rds_password,
    rds_db
} = config;

const pool = new Pool({
    host: rds_host,
    port: rds_port,
    user: rds_user,
    password: rds_password,
    database: rds_db,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Set the search path to include 'nba' schema
pool.on('connect', (client) => {
    client.query('SET search_path TO nba, public;')
        .catch(err => {
            console.error('Error setting search path:', err);
        });
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
