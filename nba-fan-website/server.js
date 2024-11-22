const express = require('express');
const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
const playersRouter = require('./routes/players');
const teamsRouter = require('./routes/teams');
const gamesRouter = require('./routes/games');
const shootersRouter = require('./routes/shooters');
const playersPerformanceRouter = require('./routes/playersPerformance');

app.use('/api/shooters', shootersRouter);
app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/playersPerformance', playersPerformanceRouter); // 修复这里

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
