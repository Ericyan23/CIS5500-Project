document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('name'); 
    if (playerName) {
        fetch(`/api/players/${encodeURIComponent(playerName)}`)
            .then(response => response.json())
            .then(player => {
                if (player) {
                    
                    document.getElementById('player-name').textContent = player.player_name;
                    document.getElementById('player-info').innerHTML = `
                        <p><strong>College:</strong> ${player.college || 'N/A'}</p>
                        <p><strong>Country:</strong> ${player.country}</p>
                        <p><strong>Draft Year:</strong> ${player.draft_year || 'N/A'}</p>
                    `;
                    document.querySelector('h2').textContent = `Discover How ${player.player_name} Shines in Victories: Tracking Points, Assists, and Rebounds Across Seasons`;
                    fetch(`/api/players/stats/${encodeURIComponent(player.player_name)}`)
                        .then(response => response.json())
                        .then(stats => {
                            if (stats.length > 0) {
                                const seasons = stats.map(stat => stat.season);
                                const points = stats.map(stat => stat.avg_points);
                                const assists = stats.map(stat => stat.avg_assists);
                                const rebounds = stats.map(stat => stat.avg_rebounds);
                                const ctx = document.getElementById('stats-chart').getContext('2d');
                                new Chart(ctx, {
                                    type: 'line',
                                    data: {
                                        labels: seasons,
                                        datasets: [
                                            {
                                                label: 'Average Points',
                                                data: points,
                                                borderColor: 'rgba(255, 99, 132, 1)',
                                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                                borderWidth: 2,
                                                fill: true
                                            },
                                            {
                                                label: 'Average Assists',
                                                data: assists,
                                                borderColor: 'rgba(54, 162, 235, 1)',
                                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                                borderWidth: 2,
                                                fill: true
                                            },
                                            {
                                                label: 'Average Rebounds',
                                                data: rebounds,
                                                borderColor: 'rgba(75, 192, 192, 1)',
                                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                                borderWidth: 2,
                                                fill: true
                                            }
                                        ]
                                    },
                                    options: {
                                        responsive: true,
                                        plugins: {
                                            tooltip: {
                                                enabled: true,
                                                callbacks: {
                                                    label: function(context) {
                                                        return `${context.dataset.label}: ${context.raw}`;
                                                    }
                                                }
                                            },
                                            legend: {
                                                display: true,
                                                position: 'top',
                                            }
                                        },
                                        scales: {
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'Season'
                                                }
                                            },
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Statistics'
                                                }
                                            }
                                        }
                                    }
                                });
                            } else {
                                document.getElementById('stats-chart').outerHTML = '<p>No stats available for this player.</p>';
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