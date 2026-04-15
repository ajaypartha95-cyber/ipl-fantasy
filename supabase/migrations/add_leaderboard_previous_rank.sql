-- Add previous_rank column to leaderboard to track rank movement between updates
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS previous_rank integer;
