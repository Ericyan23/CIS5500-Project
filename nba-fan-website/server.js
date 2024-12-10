const express = require('express');
const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
const playersRouter = require('./routes/players');
const shootersRouter = require('./routes/shooters');
const playersPerformanceRouter = require('./routes/playersPerformance');
const gameResultsRouter = require('./routes/game_results');
const clutchPerformanceRouter = require('./routes/clutch_performance');
const teamRouter = require('./routes/team');
const playersSearchRouter = require('./routes/playersSearch');

app.use('/api/team', teamRouter);
app.use('/api/game-results', gameResultsRouter);
app.use('/api/shooters', shootersRouter);
app.use('/api/players', playersRouter);
app.use('/api/clutch-performance', clutchPerformanceRouter);
app.use('/api/playersPerformance', playersPerformanceRouter);
app.use('/api/players-search', playersSearchRouter);

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
