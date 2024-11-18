document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/shooters/top-shooters')
        .then(response => response.json())
        .then(shooters => {
            const tableBody = document.querySelector('#shooters-table tbody');
            shooters.forEach(shooter => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${shooter.player_name}</td>
                    <td>${shooter.season}</td>
                    <td>${shooter.three_point_percentage}%</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching top shooters:', err));
});
