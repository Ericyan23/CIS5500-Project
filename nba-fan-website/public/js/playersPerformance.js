document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/playersPerformance')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(players => {
            console.log('Fetched players data:', players);
            const tableBody = document.querySelector('#player-data');
            players.forEach(player => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${player.player_name}</td>
                    <td>${player.season}</td>
                    <td>${parseInt(player.total_points || 0).toLocaleString()}</td>
                    <td>${player.season_points_rank}</td>
                    <td>${player.shot_distance_rank}</td>
                    <td>${parseInt(player.cumulative_points || 0).toLocaleString()}</td>
                    <td>${player.rank_category}</td>
                    <td>${parseFloat(player.avg_season_points || 0).toFixed(2)}</td>
                    <td>${player.season_rank}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching player performance data:', err));
});
