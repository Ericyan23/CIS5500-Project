# Create Index
index = """CREATE INDEX idx_game_id ON shots_made(game_id);
CREATE INDEX idx_team_season ON player_stats(team);
CREATE INDEX idx_season ON game_results(season);
CREATE INDEX idx_sm_zone_abb ON shots_made(zone_abb);
"""

# 1. Team Performance and Strategy ( > 15s): 

#Team Strategy Shift Analysis - Evaluate how teams' three-points shooting patterns have evolved between seasons.

query = """--Team shooting pattern
WITH team_shots AS (
   SELECT ps.team, ps.game_id, gr.season,
          SUM(CASE WHEN sm.shot_type = '3PT Field Goal' Then 1 ELSE 0 END) AS three_points_attempted,
          COUNT(sm.shot_id) AS total_shots
   FROM player_stats ps
   JOIN shots_made sm ON ps.game_id = sm.game_id
   JOIN game_results gr ON ps.game_id = gr.game_id
   GROUP BY ps.team, ps.game_id, gr.season),
--Get Average
team_average AS (
   SELECT team, season,
          ROUND(AVG(three_points_attempted), 2) AS avg_3pt_per_game,
          ROUND(AVG(total_shots), 2) AS avg_total_shots_per_game
   FROM team_shots
   GROUP BY team, season),
--Calculate Percentages
team_percentages AS (
   SELECT team, season,
          ((avg_3pt_per_game / avg_total_shots_per_game) * 100 ) AS three_pt_percentages
   FROM team_average
)
SELECT team, season, three_pt_percentages
FROM team_percentages
ORDER BY team, season;
"""

#Optimization: 

#Create materialized view
view = """CREATE MATERIALIZED VIEW team_shots_mv AS
SELECT ps.team, gr.season,
       SUM(CASE WHEN sm.shot_type = '3PT Field Goal' THEN 1 ELSE 0 END) AS three_points_attempted,
       COUNT(sm.shot_id) AS total_shots
FROM player_stats ps
         JOIN shots_made sm ON ps.game_id = sm.game_id
         JOIN game_results gr ON ps.game_id = gr.game_id
GROUP BY ps.team, gr.season;
"""

query = """WITH team_average AS (
    SELECT team, season,
           ROUND(AVG(three_points_attempted), 2) AS avg_3pt_per_game,
           ROUND(AVG(total_shots), 2) AS avg_total_shots_per_game
    FROM team_shots_mv
    GROUP BY team, season
),
     team_percentages AS (
         SELECT team, season,
                ((avg_3pt_per_game / NULLIF(avg_total_shots_per_game, 0)) * 100) AS three_pt_percentages
         FROM team_average
     )
SELECT team, season, three_pt_percentages
FROM team_percentages
ORDER BY team, season;
"""
#2. Game Outcomes and Results Summaries:

#Generate summaries of each team’s home performance across seasons, including wins, losses, and average scores

query = """
SELECT season, home_team,
      COUNT(CASE WHEN home_score > away_score THEN 1 END) AS home_wins,
      COUNT(CASE WHEN home_score < away_score THEN 1 END) AS home_losses,
      ROUND(AVG(home_score), 2) AS avg_home_score,
      ROUND(AVG(away_score), 2) AS avg_away_score
FROM game_results
GROUP BY season, home_team
ORDER BY season, home_team;
"""

#3. Team Shooting Efficiency Analysis:

#Analyze team’s shooting efficiencies for both general field goals and three-point shots across seasons.

query = """
SELECT gr.season,ps.team,
      ROUND(SUM(ps.fg) / SUM(ps.fga) * 100, 2) AS field_goal_percentage,
      ROUND(SUM(ps."3P") / SUM(ps."3PA") * 100, 2) AS three_point_percentage
FROM player_stats ps
JOIN game_results gr ON ps.game_id = gr.game_id
GROUP BY gr.season, ps.team
ORDER BY gr.season, ps.team;
"""

#4. Top Players Performance and Ranking Analysis Across Seasons

#Below query power a TOP players leaderboard on our site, showing top performers across seasons with additional stats like average points

query = """
WITH player_points AS (
   SELECT
       psn.player_name,
       psn.season,
       pb.college,
       pb.country,
       SUM(ps.pts) AS total_points,
       AVG(ps.pts) AS avg_points_per_game,
       CASE
           WHEN SUM(ps.fga) > 0 THEN SUM(ps.fg) / SUM(ps.fga)
           ELSE 0
       END AS fg_percentage,
       CASE
           WHEN SUM(ps."3PA") > 0 THEN SUM(ps."3P") / SUM(ps."3PA")
           ELSE 0
       END AS three_pt_percentage,
       COUNT(DISTINCT gr.game_id) AS games_played,
       COUNT(DISTINCT sm.shot_id) AS total_shots_made,
       AVG(sm.shot_distance) AS avg_shot_distance
   FROM
       player_stats ps
   JOIN
       game_results gr ON ps.game_id = gr.game_id
   JOIN
       player_seasons psn ON ps.player = psn.player_name
       AND substring(psn.season, 3, 2) || substring(psn.season, 6, 2) = CAST(gr.season AS character varying)
   JOIN
       player_background pb ON psn.player_name = pb.player_name
   LEFT JOIN
       shots_made sm ON ps.game_id = sm.game_id AND ps.player = sm.player_name
   WHERE
       gr.result = 1
       AND psn.age BETWEEN 20 AND 30
       AND psn.player_weight BETWEEN 80 AND 100
       AND sm.zone_abb IN ('C', 'RC', 'LC')
       AND pb.draft_year IS NOT NULL
       AND psn.season BETWEEN '2000-01' AND '2022-23'  -- Include a broader range of seasons
   GROUP BY
       psn.player_name, psn.season, pb.college, pb.country
   HAVING
       AVG(ps.pts) > 10
),
-- Ranking the results within each season
ranked_stats AS (
   SELECT
       pp.player_name,
       pp.season,
       pp.total_points,
       ROW_NUMBER() OVER (PARTITION BY pp.season ORDER BY pp.total_points DESC) AS season_points_rank,
       RANK() OVER (PARTITION BY pp.season ORDER BY pp.avg_shot_distance DESC) AS shot_distance_rank,
       SUM(pp.total_points) OVER (PARTITION BY pp.season ORDER BY pp.total_points DESC) AS cumulative_points
   FROM player_points pp
),
-- Final selection to get the top 10 players for each season
final_selection AS (
   SELECT
       rs.player_name,
       rs.season,
       rs.total_points,
       rs.season_points_rank,
       rs.shot_distance_rank,
       rs.cumulative_points,
       CASE
           WHEN rs.season_points_rank <= 5 THEN 'Top 5'
           WHEN rs.season_points_rank BETWEEN 6 AND 10 THEN 'Top 10'
           ELSE 'Others'
       END AS rank_category,
       AVG(rs.total_points) OVER (PARTITION BY rs.season) AS avg_season_points,
       ROW_NUMBER() OVER (PARTITION BY rs.season ORDER BY rs.cumulative_points DESC) AS season_rank
   FROM ranked_stats rs
)
SELECT *
FROM final_selection
WHERE season_rank <= 10  -- Top 10 players for each season
ORDER BY season, season_rank;
"""

#Optimization
view = """CREATE MATERIALIZED VIEW player_points_mv AS
SELECT
    psn.player_name,
    psn.season,
    pb.college,
    pb.country,
    SUM(ps.pts) AS total_points,
    AVG(ps.pts) AS avg_points_per_game,
    CASE WHEN SUM(ps.fga) > 0 THEN SUM(ps.fg) / SUM(ps.fga) ELSE 0 END AS fg_percentage,
    CASE WHEN SUM(ps."3PA") > 0 THEN SUM(ps."3P") / SUM(ps."3PA") ELSE 0 END AS three_pt_percentage,
    COUNT(DISTINCT gr.game_id) AS games_played,
    COUNT(DISTINCT sm.shot_id) AS total_shots_made,
    AVG(sm.shot_distance) AS avg_shot_distance
FROM
    player_stats ps
JOIN
    game_results gr ON ps.game_id = gr.game_id
JOIN
    player_seasons psn ON ps.player = psn.player_name
    AND substring(psn.season, 3, 2) || substring(psn.season, 6, 2) = CAST(gr.season AS character varying)
JOIN
    player_background pb ON psn.player_name = pb.player_name
LEFT JOIN
    shots_made sm ON ps.game_id = sm.game_id AND ps.player = sm.player_name
WHERE
    gr.result = 1
    AND psn.age BETWEEN 20 AND 30
    AND psn.player_weight BETWEEN 80 AND 100
    AND sm.zone_abb IN ('C', 'RC', 'LC')
    AND pb.draft_year IS NOT NULL
    AND psn.season BETWEEN '2000-01' AND '2022-23'
GROUP BY
    psn.player_name, psn.season, pb.college, pb.country
HAVING
    AVG(ps.pts) > 10;
"""

query = """WITH ranked_stats AS (
   SELECT
       pp.player_name,
       pp.season,
       pp.total_points,
       ROW_NUMBER() OVER (PARTITION BY pp.season ORDER BY pp.total_points DESC) AS season_points_rank,
       RANK() OVER (PARTITION BY pp.season ORDER BY pp.avg_shot_distance DESC) AS shot_distance_rank,
       SUM(pp.total_points) OVER (PARTITION BY pp.season ORDER BY pp.total_points DESC) AS cumulative_points
   FROM player_points_mv pp
),
final_selection AS (
   SELECT
       rs.player_name,
       rs.season,
       rs.total_points,
       rs.season_points_rank,
       rs.shot_distance_rank,
       rs.cumulative_points,
       CASE
           WHEN rs.season_points_rank <= 5 THEN 'Top 5'
           WHEN rs.season_points_rank BETWEEN 6 AND 10 THEN 'Top 10'
           ELSE 'Others'
       END AS rank_category,
       AVG(rs.total_points) OVER (PARTITION BY rs.season) AS avg_season_points,
       ROW_NUMBER() OVER (PARTITION BY rs.season ORDER BY rs.cumulative_points DESC) AS season_rank
   FROM ranked_stats rs
)
SELECT *
FROM final_selection
WHERE season_rank <= 10
ORDER BY season, season_rank;

"""