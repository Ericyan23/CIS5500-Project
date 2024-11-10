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
#3. Free-Throw Percentage
#Analyze player performance at the free-throw line and compare changes between seasons.
query = """SELECT p.player, g.season,
      ROUND(SUM(p.ft) * 1.0 / NULLIF(SUM(p.fta), 0), 2) AS free_throw_percentage
FROM player_stats p
JOIN game_results g ON p.game_id = g.game_id
WHERE p.ft IS NOT NULL AND p.fta IS NOT NULL
GROUP BY p.player, g.season
HAVING SUM(p.fta) > 0
ORDER BY g.season, free_throw_percentage DESC;
"""

#4. Rebound Statistics, Assist Counts, Steal Totals, Block Counts
# Evaluate the number of offensive and defensive rebounds, the number of assists, the number of steals, the number of blocks secured by each player across seasons.
query = """SELECT p.player, g.season,
      SUM(p.orb) AS offensive_rebounds,
      SUM(p.drb) AS defensive_rebounds,
      SUM(p.orb + p.drb) AS total_rebounds,
      SUM(p.ast) AS total_assists,
      SUM(p.stl) AS total_steals,
      SUM(p.blk) AS total_blocks
FROM player_stats p
JOIN game_results g ON p.game_id = g.game_id
WHERE p.orb IS NOT NULL AND p.drb IS NOT NULL AND p.ast IS NOT NULL AND p.stl IS NOT NULL AND p.blk IS NOT NULL
GROUP BY p.player, g.season
ORDER BY g.season, total_rebounds DESC, total_assists DESC, total_steals DESC, total_blocks DESC;
"""

#5. Player Clutch Performance Analysis
# Evaluate players' clutch performance by analyzing shot accuracy across different court zones in high-stakes game situations (i.e. last quarter of the game)
query = """WITH player_clutch_shots_perfornace AS (
   SELECT s.player_name, s.zone_abb, g.season,
          COUNT(s.shot_id) AS total_shots,
          SUM(s.shot_made) AS shots_made
   FROM shots_made s
   JOIN game_results g ON s.game_id = g.game_id
   WHERE s.quarter >= 4
   GROUP BY s.player_name, s.zone_abb, g.season)
SELECT player_name, zone_abb, season, shots_made, total_shots,
      ROUND((shots_made * 1.0 / total_shots) * 100, 2) AS clutch_shot_percentage
FROM player_clutch_shots_perfornace
ORDER BY season, player_name, zone_abb;
"""

#6. Player's Contribution to Team Wins Across Seasons (> 15s)
# Calculate each player's average points, assists, and rebounds in games where their team won, showing how they contributed to their team's success across different seasons.
query = """SELECT
  pb.player_name,
  ps.season,
  ps.team_abbreviation,
  ROUND(AVG(p.pts), 2) AS avg_points,
  ROUND(AVG(p.ast), 2) AS avg_assists,
  ROUND(AVG(p.orb + p.drb), 2) AS avg_rebounds
FROM player_background pb 
JOIN player_seasons ps ON pb.player_name = ps.player_name
JOIN player_stats p ON ps.player_name = p.player
JOIN game_results g ON p.game_id = g.game_id
JOIN shots_made s ON p.game_id = s.game_id AND p.player = s.player_name
WHERE
  (g.home_team = ps.team_abbreviation AND g.home_score > g.away_score) OR
  (g.away_team = ps.team_abbreviation AND g.away_score > g.home_score)
GROUP BY pb.player_name, ps.season, ps.team_abbreviation
ORDER BY ps.season, avg_points DESC;
"""