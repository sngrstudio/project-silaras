CREATE ALGORITHM = undefined
SQL SECURITY definer
VIEW `region_with_counts` AS (select `id`, `name`, `slug`, `type`, `parent_id`, (SELECT COUNT(*) FROM region AS c WHERE c.parent_id = `id`) as `subregion_count`, (SELECT COUNT(*) FROM patient AS p WHERE p.region_id = `id`) as `patients_count` from `region`);