#1. Player Shooting Performance by Shot Zone
# Measure and compare shooting accuracy across different shot zones (e.g., mid-range, three-point, paint) between seasons for selected players.

query = """ SELECT s.player_name, r.season,s.zone_abb,
      COUNT(*) AS total_shots,
      ROUND((SUM(s.shot_made) * 1.0 / COUNT(*)) * 100, 2) AS shooting_percentage
FROM shots_made s JOIN game_results r ON s.game_id = r.game_id
GROUP BY s.player_name, r.season, s.zone_abb
ORDER BY s.player_name, r.season,s.zone_abb;
""" 

#2. Three-Point Percentage
# Track each player's shooting efficiency beyond the three-point line across seasons.
query = """SELECT s.player_name, g.season,
      ROUND((SUM(p."3P") * 1.0 / NULLIF(SUM(p."3PA"), 0)) * 100, 2) AS three_point_percentage
FROM shots_made s
JOIN player_stats p ON s.game_id = p.game_id
JOIN game_results g ON s.game_id = g.game_id
WHERE p."3P" IS NOT NULL AND p."3PA" IS NOT NULL
GROUP BY s.player_name, g.season
ORDER BY g.season, three_point_percentage DESC;
"""

