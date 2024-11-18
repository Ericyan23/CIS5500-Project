document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name'); // Fetch name from query string
    if (playerName) {
        fetch(`/api/players/${encodeURIComponent(playerName)}`)
            .then(response => response.json())
            .then(player => {
                if (player) {
                    // Populate player details
                    document.getElementById('player-name').textContent = player.player_name;
                    document.getElementById('player-info').innerHTML = `
                        <p>College: ${player.college || 'N/A'}</p>
                        <p>Country: ${player.country}</p>
                        <p>Draft Year: ${player.draft_year || 'N/A'}</p>
                    `;

                    // Fetch player stats
                    fetch(`/api/players/stats/${encodeURIComponent(player.player_name)}`)
                        .then(response => response.json())
                        .then(stats => {
                            const statsTable = document.getElementById('stats-table');
                            if (stats.length > 0) {
                                statsTable.innerHTML = `
                                    <thead>
                                        <tr>
                                            <th>Team</th>
                                            <th>PTS</th>
                                            <th>AST</th>
                                            <th>REB</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${stats.map(stat => `
                                            <tr>
                                                <td>${stat.team}</td>
                                                <td>${stat.pts}</td>
                                                <td>${stat.ast}</td>
                                                <td>${stat.drb + stat.orb}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>`;
                            } else {
                                statsTable.innerHTML = '<p>No stats available for this player.</p>';
                            }
                        })
                        .catch(err => console.error('Error fetching player stats:', err));
                } else {
                    document.getElementById('player-info').innerHTML = '<p>Player not found.</p>';
                }
            })
            .catch(err => console.error('Error fetching player:', err));
    }
});
