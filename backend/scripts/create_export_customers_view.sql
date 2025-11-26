-- Create view to simplify customer export
-- This view aggregates order statistics per user and excludes membership level fields
CREATE OR REPLACE VIEW export_customers AS
SELECT
  u.user_id AS id,
  u.fullname AS fullName,
  u.email,
  u.phone AS phoneNumber,
  u.gender,
  u.is_active AS isActive,
  COUNT(o.order_id) AS totalOrders,
  COALESCE(SUM(o.total), 0) AS totalSpent,
  MAX(o.created_at) AS lastOrderDate,
  MIN(o.created_at) AS firstOrderDate,
  u.created_at AS createdAt
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE u.role = 'user'
GROUP BY u.user_id, u.fullname, u.email, u.phone, u.gender, u.is_active, u.created_at;

-- To apply: run this script against your MySQL database.
