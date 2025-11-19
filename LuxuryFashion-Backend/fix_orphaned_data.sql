-- SQL Script to Fix Orphaned Data in Cloud SQL Database
-- Run this script in your Cloud SQL database (rangeela) to clean up orphaned records
-- before switching back to 'update' mode in application.properties

-- Step 1: Find orphaned addresses (addresses with user_id that doesn't exist in users table)
SELECT a.id, a.user_id 
FROM addresses a 
LEFT JOIN users u ON a.user_id = u.id 
WHERE u.id IS NULL;

-- Step 2: Delete orphaned addresses
DELETE a FROM addresses a 
LEFT JOIN users u ON a.user_id = u.id 
WHERE u.id IS NULL;

-- Step 3: Find orphaned orders (orders with user_id that doesn't exist in users table)
SELECT o.id, o.user_id 
FROM orders o 
LEFT JOIN users u ON o.user_id = u.id 
WHERE u.id IS NULL;

-- Step 4: Delete orphaned order items first (they reference orders)
DELETE oi FROM order_items oi 
INNER JOIN orders o ON oi.order_id = o.id 
LEFT JOIN users u ON o.user_id = u.id 
WHERE u.id IS NULL;

-- Step 5: Delete orphaned orders
DELETE o FROM orders o 
LEFT JOIN users u ON o.user_id = u.id 
WHERE u.id IS NULL;

-- Step 6: Find orphaned cart items (carts with user_id that doesn't exist)
SELECT c.id, c.user_id 
FROM carts c 
LEFT JOIN users u ON c.user_id = u.id 
WHERE u.id IS NULL;

-- Step 7: Delete orphaned cart items first
DELETE ci FROM cart_items ci 
INNER JOIN carts c ON ci.cart_id = c.id 
LEFT JOIN users u ON c.user_id = u.id 
WHERE u.id IS NULL;

-- Step 8: Delete orphaned carts
DELETE c FROM carts c 
LEFT JOIN users u ON c.user_id = u.id 
WHERE u.id IS NULL;

-- After running this script, you can change spring.jpa.hibernate.ddl-auto back to 'update'
-- in application.properties and restart the application



