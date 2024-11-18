document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/games')
        .then(response => response.json())
        .then(games => {
            const gamesTableBody = document.querySelector('#games-table tbody');
            games.forEach(game => {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td>${new Date(game.date).toLocaleDateString()}</td>
          <td>${game.away_team}</td>
          <td>${game.away_score}</td>
          <td>${game.home_team}</td>
          <td>${game.home_score}</td>
        `;
                gamesTableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching games:', err));
});
