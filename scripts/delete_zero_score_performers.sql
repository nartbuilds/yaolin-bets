-- Delete all performers with score_head = 0
-- This will cascade delete any team references to these performers

DELETE FROM performers
WHERE score_head = 0;
