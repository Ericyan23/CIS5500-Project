#1. Team Performance and Strategy ( > 15s): 

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