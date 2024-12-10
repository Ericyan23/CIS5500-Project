document.addEventListener('DOMContentLoaded', () => {
    const seasonSelect = document.getElementById('seasonSelect');
    const fetchDataButton = document.getElementById('clutch-form').addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        fetchClutchPerformance();
    });
    const tableBody = document.querySelector('#clutch-performance-table tbody');

    // Fetch and populate season dropdown
    async function loadSeasons() {
        try {
            const response = await fetch('/api/clutch-performance/seasons');
            const seasons = await response.json();
            seasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season;
                option.textContent = season;
                seasonSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Error fetching seasons:', err);
        }
    }

    // Fetch and display clutch performance data
    async function fetchClutchPerformance() {
        const season = seasonSelect.value || ''; // Default to the latest season
        try {
            const response = await fetch(`/api/clutch-performance?season=${season}`);
            if (!response.ok) throw new Error('Failed to fetch clutch performance');
            const data = await response.json();
            console.log('Fetched data:', data); // Log the data to check the response
            populateTable(data);
        } catch (err) {
            console.error('Error fetching clutch performance data:', err);
        }
    }
    
    // Populate the table with fetched data
    function populateTable(data) {
        tableBody.innerHTML = ''; // Clear previous data
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.player_name}</td>
                <td>${row.zone_abb}</td>
                <td>${row.season}</td>
                <td>${row.shots_made}</td>
                <td>${row.total_shots}</td>
                <td>${row.clutch_shot_percentage}%</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Load seasons on page load and set event listener for fetching data
    loadSeasons();
    fetchDataButton.addEventListener('click', fetchClutchPerformance);
});