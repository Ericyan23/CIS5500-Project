document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/teams')
        .then(response => response.json())
        .then(teams => {
            const teamsList = document.getElementById('teams-list');
            teams.forEach(team => {
                const col = document.createElement('div');
                col.className = 'col-md-3';
                col.innerHTML = `
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">${team.team_abbreviation}</h5>
              <a href="team.html?team=${encodeURIComponent(team.team_abbreviation)}" class="btn btn-primary">View Team</a>
            </div>
          </div>
        `;
                teamsList.appendChild(col);
            });
        })
        .catch(err => console.error('Error fetching teams:', err));
});
