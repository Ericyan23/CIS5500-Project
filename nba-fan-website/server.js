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

app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/games', gamesRouter);

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
