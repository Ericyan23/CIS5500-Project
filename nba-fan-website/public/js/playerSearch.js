// public/js/playerSearch.js
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('player-search-input');
    const autocompleteList = document.getElementById('autocomplete-list');
    const playerDetails = document.getElementById('player-details');
    let typingTimeout = null;

    // Handle input for autocomplete suggestions
    searchInput.addEventListener('input', () => {
        clearTimeout(typingTimeout);
        const query = searchInput.value.trim();
        if (query.length > 1) {
            typingTimeout = setTimeout(() => {
                fetch(`/api/players-search/suggest?q=${encodeURIComponent(query)}`)
                    .then(res => res.json())
                    .then(data => showAutocomplete(data))
                    .catch(err => console.error(err));
            }, 300);
        } else {
            autocompleteList.innerHTML = '';
        }
    });

    function showAutocomplete(players) {
        autocompleteList.innerHTML = '';
        players.forEach(player => {
            const div = document.createElement('div');
            div.textContent = player.player_name;
            div.addEventListener('click', () => {
                searchInput.value = player.player_name;
                autocompleteList.innerHTML = '';
                fetchPlayerDetails(player.player_name);
            });
            autocompleteList.appendChild(div);
        });
    }

    // Handle form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            fetchPlayerDetails(query);
        }
    });

    function fetchPlayerDetails(name) {
        fetch(`/api/players-search/details?player_name=${encodeURIComponent(name)}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text); });
                }
                return response.json();
            })
            .then(data => renderPlayerDetails(data))
            .catch(err => console.error(err));
    }

    function renderPlayerDetails(data) {
        playerDetails.innerHTML = '';
        if (!data || !data.player) {
            playerDetails.textContent = 'No player details available.';
            return;
        }

        const player = data.player;
        const seasons = data.seasons || [];
        const winningSeasons = data.winningSeasons || [];

        const card = document.createElement('div');
        card.classList.add('player-card');

        // Player Info
        const info = document.createElement('div');
        info.classList.add('player-info');

        const img = document.createElement('img');
        const normalizedName = player.player_name.trim().toLowerCase().replace(/\s+/g, '-');
        img.src = `images/players/${normalizedName}.jpg`;
        img.onerror = function() {
            img.src = 'images/players/default.jpg';
        };
        info.appendChild(img);

        const playerText = document.createElement('div');
        playerText.innerHTML = `
            <h2>${player.player_name}</h2>
            <p>Age: ${player.age || 'N/A'}</p>
            <p>Height: ${player.player_height || 'N/A'}</p>
            <p>Weight: ${player.player_weight || 'N/A'}</p>
            <p>College: ${player.college || 'N/A'}</p>
            <p>Country: ${player.country || 'N/A'}</p>
            <p>Draft Year: ${player.draft_year || 'Undrafted'}</p>
        `;
        info.appendChild(playerText);
        card.appendChild(info);

        // Original Chart
        const chartContainer = document.createElement('div');
        chartContainer.style.marginTop = '30px';
        const canvas = document.createElement('canvas');
        canvas.id = 'statsChart';
        chartContainer.appendChild(canvas);
        card.appendChild(chartContainer);

        // **NEW SECOND CHART CONTAINER**
        const secondChartContainer = document.createElement('div');
        secondChartContainer.style.marginTop = '50px';
        const canvas2 = document.createElement('canvas');
        canvas2.id = 'winningStatsChart';
        secondChartContainer.appendChild(canvas2);
        card.appendChild(secondChartContainer);

        playerDetails.appendChild(card);

        // Prepare data for the first chart (All Stats)
        const labels = seasons.map(s => s.season);
        const ptsData = seasons.map(s => parseFloat(s.pts) || 0);
        const astData = seasons.map(s => parseFloat(s.ast) || 0);
        const rebData = seasons.map(s => (parseFloat(s.orb) || 0) + (parseFloat(s.drb) || 0));

        new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Points', data: ptsData, backgroundColor: 'red' },
                    { label: 'Assists', data: astData, backgroundColor: 'blue' },
                    { label: 'Rebounds', data: rebData, backgroundColor: 'green' },
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Aggregated Stats for ${player.player_name}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Prepare data for the second chart (Winning Seasons Stats)
        // We group by season and aggregate avg_points, avg_assists, avg_rebounds
        const winningSeasonsLabels = winningSeasons.map(ws => ws.season);
        const winningPtsData = winningSeasons.map(ws => parseFloat(ws.avg_points) || 0);
        const winningAstData = winningSeasons.map(ws => parseFloat(ws.avg_assists) || 0);
        const winningRebData = winningSeasons.map(ws => parseFloat(ws.avg_rebounds) || 0);

        new Chart(canvas2.getContext('2d'), {
            type: 'line',
            data: {
                labels: winningSeasonsLabels,
                datasets: [
                    { label: 'Avg Points (Wins)', data: winningPtsData, borderColor: 'red', fill: false },
                    { label: 'Avg Assists (Wins)', data: winningAstData, borderColor: 'blue', fill: false },
                    { label: 'Avg Rebounds (Wins)', data: winningRebData, borderColor: 'green', fill: false },
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Average Stats in Winning Games by Season for ${player.player_name}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
