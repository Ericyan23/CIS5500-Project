document.addEventListener("DOMContentLoaded", function() {
    populateSeasonDropdown();
    loadClutchPerformance();

    function populateSeasonDropdown() {
        $.getJSON('/api/clutch-performance/seasons', function(seasons) {
            const seasonSelect = $('#season-select');
            seasonSelect.empty();

            seasons.forEach(season => {
                seasonSelect.append(new Option(season, season));
            });

            if (seasons.length > 0) {
                seasonSelect.val(seasons[0]);
            }
        });
    }

    function loadClutchPerformance() {
        const selectedSeason = $('#season-select').val();
        const queryParam = selectedSeason ? `?season=${selectedSeason}` : '';

        $.getJSON(`/api/clutch-performance${queryParam}`, function(data) {
            const tableBody = $('#clutch-performance-table tbody');
            tableBody.empty();

            data.forEach(player => {
                const row = `<tr>
                    <td>${player.player_name}</td>
                    <td>${player.zone_abb}</td>
                    <td>${player.season}</td>
                    <td>${player.shots_made}</td>
                    <td>${player.total_shots}</td>
                    <td>${player.clutch_shot_percentage}%</td>
                </tr>`;
                tableBody.append(row);
            });
        }).fail(function() {
            alert("Error fetching clutch performance data.");
        });
    }
});