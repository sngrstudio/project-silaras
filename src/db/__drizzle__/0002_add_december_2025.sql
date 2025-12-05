-- Custom SQL migration file, put your code below! --

-- Add December 2025 monthly assessment
INSERT INTO monthly_assesment (id, month) 
SELECT UUID(), 'DECEMBER'
WHERE NOT EXISTS (
  SELECT 1 FROM monthly_assesment WHERE month = 'DECEMBER'
);
--> statement-breakpoint

-- Add December 2025 daily assessments (31 days)
-- Using subquery instead of variable to avoid session issues
INSERT INTO daily_assesment (id, monthly_assesment_id, date, menu_1, menu_2)
SELECT 
  UUID(),
  (SELECT id FROM monthly_assesment WHERE month = 'DECEMBER'),
  DATE('2025-12-01') + INTERVAL (n-1) DAY,
  '<<menu>>',
  '<<menu>>'
FROM (
  SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
  SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
  SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
  SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
  SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
  SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
  SELECT 31
) days
WHERE NOT EXISTS (
  SELECT 1 FROM daily_assesment da
  WHERE da.monthly_assesment_id = (SELECT id FROM monthly_assesment WHERE month = 'DECEMBER')
  AND da.date BETWEEN '2025-12-01' AND '2025-12-31'
);