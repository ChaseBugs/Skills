DELETE s FROM sessions s JOIN memberships m ON m.user_id=s.user_id WHERE m.role='MANAGER';
DELETE t FROM api_tokens t JOIN memberships m ON m.user_id=t.user_id AND m.company_id=t.company_id WHERE m.role='MANAGER';
DELETE FROM memberships WHERE role='MANAGER';
ALTER TABLE memberships MODIFY role ENUM('HR') NOT NULL DEFAULT 'HR';
