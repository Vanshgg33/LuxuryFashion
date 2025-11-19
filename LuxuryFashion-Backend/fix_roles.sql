-- Fix existing role data in database
UPDATE users SET role = 'ADMIN' WHERE role = 'admin';
UPDATE users SET role = 'USER' WHERE role = 'user';