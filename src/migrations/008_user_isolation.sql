-- 008: Add user_id to businesses for proper data isolation
ALTER TABLE businesses ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Assign existing businesses to admin user (id=1) so nothing breaks
UPDATE businesses SET user_id = 1 WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_user ON businesses(user_id);
