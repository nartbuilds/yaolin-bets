-- Populate all performer scores with random values between 1 and 100
UPDATE performers
SET
  score_head = FLOOR(RANDOM() * 100 + 1)::int,
  score_tail = FLOOR(RANDOM() * 100 + 1)::int,
  score_drum = FLOOR(RANDOM() * 100 + 1)::int,
  score_gong = FLOOR(RANDOM() * 100 + 1)::int,
  score_cymbal = FLOOR(RANDOM() * 100 + 1)::int;

-- Recalculate total scores for all teams
UPDATE teams
SET total_score = (
  SELECT
    COALESCE(head.score_head, 0) +
    COALESCE(tail.score_tail, 0) +
    COALESCE(drum.score_drum, 0) +
    COALESCE(gong.score_gong, 0) +
    COALESCE(cymbal.score_cymbal, 0)
  FROM performers head, performers tail, performers drum, performers gong, performers cymbal
  WHERE
    head.id = teams.head_id AND
    tail.id = teams.tail_id AND
    drum.id = teams.drum_id AND
    gong.id = teams.gong_id AND
    cymbal.id = teams.cymbal_id
);
