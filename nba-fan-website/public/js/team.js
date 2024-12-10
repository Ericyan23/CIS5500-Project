document.addEventListener("DOMContentLoaded", function () {
    fetchTeams();

    function fetchTeams() {
        $.getJSON('/api/team', function (teams) {
            const teamsList = $('#teams-list');
            teamsList.empty();

            teams.forEach(team => {
                const teamCard = `
                    <div class="col-md-3 mb-3">
                        <div class="card">
                            <div class="card-body text-center">
                                <img src="${team.logo_url}" 
                                     alt="${team.team_abbreviation} Logo" 
                                     class="img-fluid mb-3" 
                                     style="max-height: 100px; object-fit: contain;">
                                <h5 class="card-title">${team.team_abbreviation}</h5>
                                <button class="btn btn-primary" onclick="fetchTeamStats('${team.team_abbreviation}')">View Team</button>
                            </div>
                        </div>
                    </div>
                `;
                teamsList.append(teamCard);
            });
        }).fail(function () {
            alert('Error fetching teams.');
        });
    }
});

let teamChartInstance = null;

function fetchTeamStats(team) {
    $.getJSON(`/api/team/${team}`, function (stats) {
        // Update modal title
        $('#teamModalTitle').text(`Team Stats for ${team}`);

        // Prepare data for the chart
        const labels = stats.map(s => s.season);
        const data = stats.map(s => s.three_pt_percentages);

        // If there's an existing chart, destroy it
        if (teamChartInstance) {
            teamChartInstance.destroy();
        }

        const ctx = document.getElementById('teamChart').getContext('2d');
        teamChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Three-Point Attempt Rate (3PAR) %',
                    data: data,
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,0.2)',
                    fill: true,
                    tension: 0.1,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                }]
            },
            options: {
                responsive: true,
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
                            text: '3PAR (%)'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Three-Point Attempt Rate Over Seasons - ${team}`
                    },
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });

        // Show the modal
        $('#teamModal').modal('show');

        if (stats.length === 0) {
            // If no stats, show a message
            $('#teamModalTitle').text(`No stats available for team ${team}`);
        }
    }).fail(function () {
        alert('Error fetching team stats.');
    });
}
