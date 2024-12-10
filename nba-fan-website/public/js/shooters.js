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
     //const tableBody = document.querySelector('#shooters-table tbody');
     //if (tableBody) {
     //    console.log('Table body found:', tableBody);
     //} else {
     //    console.error('Table body with ID #shooters-table not found.');
     //}

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

      // DOM Elements
      const nameInput = document.getElementById('nameInput');
      const seasonSelect = document.getElementById('seasonSelect');
      const zoneSelect = document.getElementById('zoneSelect');
      const searchButton = document.getElementById('search-button');
      const tableBody = document.querySelector('#shot-zone-table tbody');
  
      // Fetch and populate seasons dropdown
      async function loadSeasons() {
          try {
              const response = await fetch('/api/shooters/seasons'); // Fetch seasons from the backend
              if (!response.ok) throw new Error('Failed to fetch seasons');
              const seasons = await response.json();
              console.log('Loaded seasons:', seasons);
              // Populate dropdown
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
              console.log('Loaded zones:', zones); // Debugging
  
              // Populate dropdown
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
  
      // Fetch all shot performance data or filter by season
      async function fetchShotPerformance(season = '') {       
          const queryParams = new URLSearchParams();
  
          if (name) queryParams.append('player_name', name);
          if (season) queryParams.append('season', season);
          if (zone) queryParams.append('zone_abb', zone);
  
          const endpoint = queryParams.toString()
              ? `/api/shooters/search-shot-performance?${queryParams.toString()}`
              : '/api/shooters/shot-zones'; // Main route if no filters are selected
  
          console.log('Fetching data from endpoint:', endpoint); // Debugging
  
          try {
              const response = await fetch(endpoint); // Fetch data
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
              `;
              tableBody.appendChild(tr);
          });
      }
  
      // Event Listener: Handle button click to fetch data based on the selected season
      searchButton.addEventListener('click', () => {
          const name = nameInput.value || ''; // Get entered player name
          const season = seasonSelect.value || ''; // Get selected season
          const zone = zoneSelect.value || ''; // Get selected zone
          fetchShotPerformance(name, season, zone); // Fetch filtered data
      });
  
      // Load seasons and fetch all data on page load
      loadSeasons(); // Populate dropdown
      loadZones(); // Populate zones dropdown
      fetchShotPerformance(); // Fetch all data initially
  
});