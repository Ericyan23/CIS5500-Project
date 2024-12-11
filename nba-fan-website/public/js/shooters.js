document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const nameInput = document.getElementById('nameInput');
    const seasonSelect = document.getElementById('seasonSelect');
    const zoneSelect = document.getElementById('zoneSelect');
    const searchButton = document.getElementById('search-button');
    const tableBody = document.querySelector('#shot-zone-table tbody');

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
        
    // Fetch and populate seasons dropdown
    async function loadSeasons() {
        try {
            const response = await fetch('/api/shooters/seasons'); // Fetch seasons from the backend
            if (!response.ok) throw new Error('Failed to fetch seasons');
            const seasons = await response.json();

            // Populate dropdown
            seasonSelect.innerHTML = '<option value="">All Seasons</option>'; // Default option
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

    // Fetch and populate zones dropdown
    async function loadZones() {
        try {
            const response = await fetch('/api/shooters/zones'); // Fetch zones from the backend
            if (!response.ok) throw new Error('Failed to fetch zones');
            const zones = await response.json();

            // Populate dropdown
            zoneSelect.innerHTML = '<option value="">All Zones</option>'; // Default option
            zones.forEach(zone => {
                const option = document.createElement('option');
                option.value = zone;
                option.textContent = zone;
                zoneSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Error fetching zones:', err);
        }
    }

    // Fetch and display filtered shot performance data
    async function fetchShotPerformance(playerName = '', season = '', zone = '') {
        try {
            // Construct query parameters
            const queryParams = new URLSearchParams();
            if (playerName) queryParams.append('player_name', playerName);
            if (season) queryParams.append('season', season);
            if (zone) queryParams.append('zone_abb', zone);

            const endpoint = `/api/shooters/search-shot-performance?${queryParams.toString()}`;
            console.log('Fetching data from endpoint:', endpoint); // Debugging

            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch shot performance');

            const data = await response.json();
            console.log('Fetched data:', data); // Debugging

            populateTable(data); // Populate table with fetched data
        } catch (err) {
            console.error('Error fetching shot performance data:', err);
        }
    }

    // Populate the table with fetched data
    function populateTable(data) {
        tableBody.innerHTML = ''; // Clear previous data

        if (data.length === 0) {
            console.log('No results found'); // Debugging
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="text-center">No results found</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.player_name}</td>
                <td>${row.season}</td>
                <td>${row.zone_abb}</td>
                <td>${row.total_shots}</td>
                <td>${row.shooting_percentage}%</td>
                <td>${row.clutch_shots_made}%</td>
                <td>${row.total_clutch_shots}%</td>
                <td>${row.clutch_shot_percentage}%</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Event Listener: Handle button click to fetch data based on the selected filters
    searchButton.addEventListener('click', () => {
        const playerName = nameInput.value.trim(); // Get entered player name
        const season = seasonSelect.value; // Get selected season
        const zone = zoneSelect.value; // Get selected zone
        fetchShotPerformance(playerName, season, zone); // Fetch filtered data
    });

    // Load dropdown options on page load
    loadSeasons(); // Populate seasons dropdown
    loadZones(); // Populate zones dropdown
    // DO NOT CALL `fetchShotPerformance()` on page load
});
