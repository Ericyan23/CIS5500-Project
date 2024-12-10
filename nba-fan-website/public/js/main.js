document.addEventListener("DOMContentLoaded", function() {
    let currentPage = 1;
    const pageSize = 10;

    function loadGameResults(page) {
        $.getJSON(`/api/game-results?page=${page}&pageSize=${pageSize}`, function(data) {
            const tableBody = $('#game-results-table tbody');
            tableBody.empty();
            data.forEach(game => {
                const row = `<tr>
                    <td>${new Date(game.date).toLocaleDateString()}</td>
                    <td>${game.season}</td>
                    <td>${game.home_team}</td>
                    <td>${game.home_score}</td>
                    <td>${game.away_team}</td>
                    <td>${game.away_score}</td>
                </tr>`;
                tableBody.append(row);
            });

            // Disable "Previous" button on the first page
            $('#prev-page').prop('disabled', page <= 1);
        }).fail(function() {
            alert("Error fetching game results.");
        });
    }

    loadGameResults(currentPage);

    $('#next-page').click(function() {
        currentPage++;
        loadGameResults(currentPage);
    });

    $('#prev-page').click(function() {
        if (currentPage > 1) {
            currentPage--;
            loadGameResults(currentPage);
        }
    });
});
