-- Custom SQL migration file, put your code below! --

-- =====================================================
-- MIGRATION: Backfill December 2025 for Existing Targets
-- =====================================================
-- Purpose: Add December assessment records for targets created before December support
-- Context: Officers created targets when app only supported July-November
--          Now we need to add December slots for those existing targets
-- =====================================================

-- Pre-check: Count targets missing December data
SELECT 
  'Pre-Migration Check' as status,
  COUNT(DISTINCT t.id) as targets_missing_december
FROM target t
WHERE NOT EXISTS (
  SELECT 1 FROM target_monthly_assesment tma
  JOIN monthly_assesment ma ON tma.monthly_assesment_id = ma.id
  WHERE tma.target_id = t.id AND ma.month = 'DECEMBER'
);
--> statement-breakpoint

-- =====================================================
-- STEP 1: Backfill Monthly Assessments for December
-- =====================================================
-- For each existing target, create a December monthly assessment
-- Use their most recent weight/height from November as initial values

INSERT INTO target_monthly_assesment (target_id, monthly_assesment_id, weight, height)
SELECT 
  t.id,
  (SELECT id FROM monthly_assesment WHERE month = 'DECEMBER'),
  COALESCE(
    (SELECT tma.weight 
     FROM target_monthly_assesment tma
     JOIN monthly_assesment ma ON tma.monthly_assesment_id = ma.id
     WHERE tma.target_id = t.id AND ma.month = 'NOVEMBER'
     LIMIT 1),
    t.initial_weight
  ) as weight,
  COALESCE(
    (SELECT tma.height 
     FROM target_monthly_assesment tma
     JOIN monthly_assesment ma ON tma.monthly_assesment_id = ma.id
     WHERE tma.target_id = t.id AND ma.month = 'NOVEMBER'
     LIMIT 1),
    t.initial_height
  ) as height
FROM target t
WHERE NOT EXISTS (
  SELECT 1 FROM target_monthly_assesment tma
  JOIN monthly_assesment ma ON tma.monthly_assesment_id = ma.id
  WHERE tma.target_id = t.id AND ma.month = 'DECEMBER'
);
--> statement-breakpoint

-- =====================================================
-- STEP 2: Backfill Daily Assessments for December
-- =====================================================
-- For each existing target, create all 31 December daily assessment records
-- Initialize all to false (uncompleted)

INSERT INTO target_daily_assesment (
  target_id, 
  daily_assesment_id,
  contains_staple_food,
  contains_side_dish,
  contains_vegetables,
  contains_fruits,
  is_following_recipe,
  is_completed
)
SELECT 
  t.id,
  da.id,
  false,
  false,
  false,
  false,
  false,
  false
FROM target t
CROSS JOIN daily_assesment da
INNER JOIN monthly_assesment ma ON da.monthly_assesment_id = ma.id
WHERE ma.month = 'DECEMBER'
  AND NOT EXISTS (
    SELECT 1 FROM target_daily_assesment tda
    WHERE tda.target_id = t.id 
      AND tda.daily_assesment_id = da.id
  );
--> statement-breakpoint

-- =====================================================
-- VERIFICATION: Check backfill results
-- =====================================================

-- Count targets with December monthly assessments
SELECT 
  'Verification: Monthly Assessments' as check_type,
  COUNT(DISTINCT tma.target_id) as targets_with_december_monthly
FROM target_monthly_assesment tma
JOIN monthly_assesment ma ON tma.monthly_assesment_id = ma.id
WHERE ma.month = 'DECEMBER';
--> statement-breakpoint

-- Count targets with December daily assessments
SELECT 
  'Verification: Daily Assessments' as check_type,
  COUNT(DISTINCT tda.target_id) as targets_with_december_daily,
  COUNT(tda.target_id) as total_december_daily_records
FROM target_daily_assesment tda
JOIN daily_assesment da ON tda.daily_assesment_id = da.id
JOIN monthly_assesment ma ON da.monthly_assesment_id = ma.id
WHERE ma.month = 'DECEMBER';
--> statement-breakpoint

-- Verify each target has exactly 31 December daily records
SELECT 
  'Verification: Daily Records per Target' as check_type,
  COUNT(DISTINCT t.id) as total_targets,
  COUNT(DISTINCT CASE WHEN daily_count = 31 THEN t.id END) as targets_with_31_days,
  COUNT(DISTINCT CASE WHEN daily_count < 31 THEN t.id END) as targets_missing_days
FROM target t
LEFT JOIN (
  SELECT tda.target_id, COUNT(*) as daily_count
  FROM target_daily_assesment tda
  JOIN daily_assesment da ON tda.daily_assesment_id = da.id
  JOIN monthly_assesment ma ON da.monthly_assesment_id = ma.id
  WHERE ma.month = 'DECEMBER'
  GROUP BY tda.target_id
) december_counts ON t.id = december_counts.target_id;
--> statement-breakpoint

-- Summary
SELECT 
  'Migration Summary' as status,
  (SELECT COUNT(*) FROM target) as total_targets,
  (SELECT COUNT(DISTINCT target_id) FROM target_monthly_assesment tma
   JOIN monthly_assesment ma ON tma.monthly_assesment_id = ma.id
   WHERE ma.month = 'DECEMBER') as targets_with_december_monthly,
  (SELECT COUNT(DISTINCT target_id) FROM target_daily_assesment tda
   JOIN daily_assesment da ON tda.daily_assesment_id = da.id
   JOIN monthly_assesment ma ON da.monthly_assesment_id = ma.id
   WHERE ma.month = 'DECEMBER') as targets_with_december_daily;