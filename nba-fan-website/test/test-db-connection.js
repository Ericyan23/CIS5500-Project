const { Pool } = require('pg');
const config = require('../config/config.json');

const {
    rds_host,
    rds_port,
    rds_user,
    rds_password,
    rds_db
} = config;

(async () => {
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

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected successfully:', res.rows[0]);
    } catch (err) {
        console.error('Database connection error:', err.stack);
    } finally {
        pool.end();
    }
})();
