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

    
     // Debug: Check if the table is being selected
     const tableBody = document.querySelector('#shooters-table tbody');
     if (tableBody) {
         console.log('Table body found:', tableBody);
     } else {
         console.error('Table body with ID #shooters-table not found.');
     }

    // Fetch player shooting performance by shot zones
    fetch('/api/shooters/shot-zones')
        .then(response => response.json())
        .then(shotZones => {
            const tableBody = document.querySelector('#shot-zone-table tbody');
            shotZones.forEach(zone => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${zone.player_name}</td>
                    <td>${zone.season}</td>
                    <td>${zone.zone_abb}</td>
                    <td>${zone.total_shots}</td>
                    <td>${zone.shooting_percentage}%</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(err => console.error('Error fetching shot zones:', err));   
});
