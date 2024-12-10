document.addEventListener('DOMContentLoaded', () => {
    const rowsPerPage = 10;
    let currentPage = 1;
    let playersData = []; // Store fetched players data

    // Fetch the player data from the API
    fetch('/api/playersPerformance')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(players => {
            playersData = players; // Store data for pagination
            renderTable(currentPage); // Render the first page
        })
        .catch(err => console.error('Error fetching player performance data:', err));

    // Function to render the table for a specific page
    function renderTable(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const playersForPage = playersData.slice(start, end);

        const tableBody = document.querySelector('#player-data');
        tableBody.innerHTML = ''; // Clear existing rows

        playersForPage.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.player_name}</td>
                <td>${player.season}</td>
                <td>${parseInt(player.total_points || 0).toLocaleString()}</td>
                <td>${player.season_points_rank}</td>
                <td>${player.shot_distance_rank}</td>
                <td>${parseInt(player.cumulative_points || 0).toLocaleString()}</td>
                <td>${player.rank_category}</td>
                <td>${parseFloat(player.avg_season_points || 0).toFixed(2)}</td>
                <td>${player.season_rank}</td>
            `;
            tableBody.appendChild(row);
        });

        // Update pagination controls
        document.querySelector('#page-number').textContent = `Page ${currentPage}`;
        document.querySelector('#prev-button').disabled = currentPage === 1;
        document.querySelector('#next-button').disabled = end >= playersData.length;
    }

    // Event listeners for pagination buttons
    document.querySelector('#prev-button').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable(currentPage);
        }
    });

    document.querySelector('#next-button').addEventListener('click', () => {
        if (currentPage * rowsPerPage < playersData.length) {
            currentPage++;
            renderTable(currentPage);
        }
    });
});
