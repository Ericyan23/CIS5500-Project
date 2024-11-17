document.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    const playerName = document.getElementById('player-name').value.trim();
    if (playerName) {
        fetch(`/api/players/${encodeURIComponent(playerName)}`)
            .then(response => response.json())
            .then(player => {
                if (player) {
                    // Redirect to player profile page
                    window.location.href = `player.html?name=${encodeURIComponent(player.player_name)}`;
                } else {
                    document.getElementById('search-results').innerHTML = '<p>Player not found.</p>';
                }
            })
            .catch(err => console.error('Error fetching player:', err));
    }
});
