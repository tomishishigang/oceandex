-- Community Sightings SQL Functions
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Site aggregate stats: total dives, unique divers, species count
CREATE OR REPLACE FUNCTION get_site_stats(site TEXT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_dives', (SELECT COUNT(*) FROM dive_sessions WHERE site_name = site),
    'unique_divers', (SELECT COUNT(DISTINCT user_id) FROM dive_sessions WHERE site_name = site),
    'total_species', (
      SELECT COUNT(DISTINCT s.species_id)
      FROM sightings s
      JOIN dive_sessions ds ON s.session_id = ds.id
      WHERE ds.site_name = site
    )
  );
$$;

-- 2. Top species at a site: most frequently sighted species
CREATE OR REPLACE FUNCTION get_site_top_species(site TEXT, max_results INT DEFAULT 10)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      s.species_id,
      COUNT(*) as sighting_count,
      COUNT(DISTINCT s.user_id) as diver_count
    FROM sightings s
    JOIN dive_sessions ds ON s.session_id = ds.id
    WHERE ds.site_name = site
    GROUP BY s.species_id
    ORDER BY sighting_count DESC
    LIMIT max_results
  ) t;
$$;

-- 3. Recent activity feed: latest sightings across all users (no user info)
CREATE OR REPLACE FUNCTION get_recent_activity(max_results INT DEFAULT 20)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      s.species_id,
      ds.site_name,
      ds.date,
      s.created_at
    FROM sightings s
    JOIN dive_sessions ds ON s.session_id = ds.id
    ORDER BY s.created_at DESC
    LIMIT max_results
  ) t;
$$;

-- 4. Species community stats: how many divers seen it, at which sites
CREATE OR REPLACE FUNCTION get_species_community_stats(sp_id INT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_sightings', (SELECT COUNT(*) FROM sightings WHERE species_id = sp_id),
    'unique_divers', (SELECT COUNT(DISTINCT user_id) FROM sightings WHERE species_id = sp_id),
    'sites', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT
          ds.site_name,
          COUNT(*) as sighting_count
        FROM sightings s
        JOIN dive_sessions ds ON s.session_id = ds.id
        WHERE s.species_id = sp_id
        GROUP BY ds.site_name
        ORDER BY sighting_count DESC
        LIMIT 5
      ) t
    )
  );
$$;

-- Grant execute to anonymous users (public reads)
GRANT EXECUTE ON FUNCTION get_site_stats(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_site_top_species(TEXT, INT) TO anon;
GRANT EXECUTE ON FUNCTION get_recent_activity(INT) TO anon;
GRANT EXECUTE ON FUNCTION get_species_community_stats(INT) TO anon;

-- Also grant to authenticated users
GRANT EXECUTE ON FUNCTION get_site_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_site_top_species(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_activity(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_species_community_stats(INT) TO authenticated;
