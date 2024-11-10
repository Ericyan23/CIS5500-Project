# Player Shooting Performance by Shot Zone
# Measure and compare shooting accuracy across different shot zones (e.g., mid-range, three-point, paint) between seasons for selected players.

query = """ SELECT s.player_name, r.season,s.zone_abb,
      COUNT(*) AS total_shots,
      ROUND((SUM(s.shot_made) * 1.0 / COUNT(*)) * 100, 2) AS shooting_percentage
FROM shots_made s JOIN game_results r ON s.game_id = r.game_id
GROUP BY s.player_name, r.season, s.zone_abb
ORDER BY s.player_name, r.season,s.zone_abb;
""" 
