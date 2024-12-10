document.addEventListener('DOMContentLoaded', () => {
    let players = [];
    let currentPage = 1;
    const itemsPerPage = 10;

    const seasonLowInput = document.getElementById('season-low');
    const seasonHighInput = document.getElementById('season-high');
    const rankCategoryInput = document.getElementById('rank-category');
    const applyFiltersButton = document.getElementById('apply-filters');

    // Function to fetch data with filters
    function fetchData() {
        const seasonLow = seasonLowInput.value.trim() || '2000-01';
        const seasonHigh = seasonHighInput.value.trim() || '2022-23';
        const rankCategory = rankCategoryInput.value.trim() || '';

        console.log('Fetching data with filters:', { seasonLow, seasonHigh, rankCategory });
        
        fetch(`/api/playersPerformance?season_low=${encodeURIComponent(seasonLow)}&season_high=${encodeURIComponent(seasonHigh)}&rank_category=${encodeURIComponent(rankCategory)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Data received:', data);
                players = data;
                currentPage = 1;
                displayPage(currentPage);
            })
            .catch(err => console.error('Error fetching player performance data:', err));
    }

    // Function to display a page of data
    function displayPage(page) {
        const tableBody = document.querySelector('#player-data');
        tableBody.innerHTML = ''; // Clear previous data

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, players.length);

        for (let i = startIndex; i < endIndex; i++) {
            const player = players[i];
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
        }

        // Update pagination buttons
        document.querySelector('.btn-previous').disabled = page === 1;
        document.querySelector('.btn-next').disabled = endIndex >= players.length;
    }

    // Pagination button event listeners
    document.querySelector('.btn-previous').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    document.querySelector('.btn-next').addEventListener('click', () => {
        if (currentPage * itemsPerPage < players.length) {
            currentPage++;
            displayPage(currentPage);
        }
    });

    // Apply filters button
    applyFiltersButton.addEventListener('click', () => {
        console.log('Apply Filters button clicked!');
        fetchData();
    });

    // Initial fetch (so user sees data without clicking Apply Filters)
    fetchData();
});
