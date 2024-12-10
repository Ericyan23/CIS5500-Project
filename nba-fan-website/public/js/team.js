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

function fetchTeamStats(team) {
    $('#team-stats-title').text(`Team Stats for ${team}`);
    $.getJSON(`/api/team/${team}`, function (stats) {
        const tableBody = $('#team-stats-table tbody');
        tableBody.empty();

        if (stats.length === 0) {
            tableBody.append('<tr><td colspan="3" class="text-center">No stats available for this team.</td></tr>');
        } else {
            stats.forEach(stat => {
                const row = `
                    <tr>
                        <td>${stat.season}</td>
                        <td>${stat.three_pt_percentages}%</td>
                    </tr>`;
                tableBody.append(row);
            });
        }
    }).fail(function () {
        alert('Error fetching team stats.');
    });
}