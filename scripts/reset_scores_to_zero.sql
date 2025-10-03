-- Reset all performer scores to 0
UPDATE performers
SET
  score_head = 0,
  score_tail = 0,
  score_drum = 0,
  score_gong = 0,
  score_cymbal = 0;

-- Reset all team total scores to 0
UPDATE teams
SET total_score = 0;
