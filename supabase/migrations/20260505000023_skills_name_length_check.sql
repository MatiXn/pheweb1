-- Enforce max 100 chars on skills.name at DB level (mirrors frontend maxLength={100})
-- Prevents direct API calls from bypassing client-side validation
ALTER TABLE skills ADD CONSTRAINT skills_name_length
  CHECK (char_length(name) BETWEEN 1 AND 100);
