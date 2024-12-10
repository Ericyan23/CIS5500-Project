document.addEventListener('DOMContentLoaded', () => {
    const spinnerContainer = document.getElementById('spinner-container'); // Loading spinner container

    // Show spinner
    function showSpinner() {
        spinnerContainer.style.display = 'flex';
    }

    // Hide spinner
    function hideSpinner() {
        spinnerContainer.style.display = 'none';
    }

    // Fetch top shooters data
    function fetchTopShooters() {
        showSpinner(); // Show spinner before data fetch
        fetch('/api/shooters/top-shooters')
            .then(response => response.json())
            .then(shooters => {
                const tableBody = document.querySelector('#shooters-table tbody');
                tableBody.innerHTML = ''; // Clear previous data
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
            .catch(err => console.error('Error fetching top shooters:', err))
            .finally(() => hideSpinner()); // Hide spinner after data fetch
    }

    // Fetch shot performance
    function fetchShotPerformance() {
        showSpinner(); // Show spinner before data fetch
        fetch('/api/shooters/shot-zones')
            .then(response => response.json())
            .then(shotZones => {
                const tableBody = document.querySelector('#shot-zone-table tbody');
                tableBody.innerHTML = ''; // Clear previous data
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
            .catch(err => console.error('Error fetching shot zones:', err))
            .finally(() => hideSpinner()); // Hide spinner after data fetch
    }

    // Initial data fetch
    fetchTopShooters(); // Fetch top shooters data on load
});
