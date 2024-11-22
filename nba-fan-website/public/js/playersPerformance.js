document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/playersPerformance')
        .then(response => response.json())
        .then(players => {
            const tableBody = document.querySelector('#player-data');
            players.forEach(player => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${player.player_name}</td>
                    <td>${player.season}</td>
                    <td>${player.college}</td>
                    <td>${player.country}</td>
                    <td>${parseFloat(player.total_points).toLocaleString()}</td>
                    <td>${parseFloat(player.avg_points_per_game).toFixed(2)}</td>
                    <td>${(parseFloat(player.fg_percentage) * 100).toFixed(2)}%</td>
                    <td>${(parseFloat(player.three_pt_percentage) * 100).toFixed(2)}%</td>
                    <td>${player.games_played}</td>
                    <td>${player.total_shots_made}</td>
                    <td>${parseFloat(player.avg_shot_distance).toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching player performance data:', err));
});
