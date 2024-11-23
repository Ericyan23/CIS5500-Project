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
                    <td>${player.college || 'N/A'}</td>
                    <td>${player.country || 'N/A'}</td>
                    <td>${parseFloat(player.total_points || 0).toLocaleString()}</td>
                    <td>${parseFloat(player.avg_points_per_game || 0).toFixed(2)}</td>
                    <td>${parseFloat(player.offensive_rebounds || 0).toFixed(2)}</td>
                    <td>${parseFloat(player.defensive_rebounds || 0).toFixed(2)}</td>
                    <td>${parseFloat(player.total_assists || 0).toFixed(2)}</td>
                    <td>${parseFloat(player.total_steals || 0).toFixed(2)}</td>
                    <td>${parseFloat(player.total_blocks || 0).toFixed(2)}</td>
                    <td>${(parseFloat(player.fg_percentage || 0) * 100).toFixed(2)}%</td>
                    <td>${(parseFloat(player.three_pt_percentage || 0) * 100).toFixed(2)}%</td>
                    <td>${(parseFloat(player.free_throw_percentage || 0) * 100).toFixed(2)}%</td>
                    <td>${player.games_played || 0}</td>
                    <td>${player.total_shots_made || 0}</td>
                    <td>${parseFloat(player.avg_shot_distance || 0).toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching player performance data:', err));
});
