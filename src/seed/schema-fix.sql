-- ============================================================
-- Schema fix: apply tables/columns that push:true missed
-- Run this once in the Supabase SQL Editor
-- Safe to re-run — uses IF NOT EXISTS / DO $$ guards
-- ============================================================


-- ── 1. team_rels (Team.programAreas hasMany relationship) ──────────────────
-- Confirmed missing from Render logs: "relation team_rels does not exist"

CREATE TABLE IF NOT EXISTS "team_rels" (
  "id"         serial  PRIMARY KEY,
  "order"      integer,
  "parent_id"  integer NOT NULL,
  "path"       varchar NOT NULL,
  "programs_id" integer
);

CREATE INDEX IF NOT EXISTS "team_rels_order_idx"       ON "team_rels" USING btree ("order");
CREATE INDEX IF NOT EXISTS "team_rels_parent_id_idx"   ON "team_rels" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "team_rels_path_idx"        ON "team_rels" USING btree ("path");
CREATE INDEX IF NOT EXISTS "team_rels_programs_id_idx" ON "team_rels" USING btree ("programs_id");

DO $$ BEGIN
  ALTER TABLE "team_rels"
    ADD CONSTRAINT "team_rels_parent_id_team_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "team"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "team_rels"
    ADD CONSTRAINT "team_rels_programs_id_programs_id_fk"
    FOREIGN KEY ("programs_id") REFERENCES "programs"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 2. programs.short_description column ───────────────────────────────────

ALTER TABLE "programs"   ADD COLUMN IF NOT EXISTS "short_description"         varchar;
ALTER TABLE "_programs_v" ADD COLUMN IF NOT EXISTS "version_short_description" varchar;


-- ── 3. programs_key_activities (Programs.keyActivities array) ──────────────

CREATE TABLE IF NOT EXISTS "programs_key_activities" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"      varchar,
  "activity"   varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS "programs_key_activities_order_idx"     ON "programs_key_activities" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "programs_key_activities_parent_id_idx" ON "programs_key_activities" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "programs_key_activities"
    ADD CONSTRAINT "programs_key_activities_parent_id_programs_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "programs"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 4. _programs_v_version_key_activities (draft version of keyActivities) ──
-- NOTE: version array tables use pattern _{collection}_v_version_{field_path}

CREATE TABLE IF NOT EXISTS "_programs_v_version_key_activities" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"      varchar,
  "activity"   varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS "_programs_v_version_key_activities_order_idx"     ON "_programs_v_version_key_activities" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "_programs_v_version_key_activities_parent_id_idx" ON "_programs_v_version_key_activities" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "_programs_v_version_key_activities"
    ADD CONSTRAINT "_programs_v_version_key_activities_parent_id__programs_v_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_programs_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop the wrongly-named table if it exists from a previous run
DROP TABLE IF EXISTS "_programs_v_key_activities";


-- ── 5. about_page new simple columns ───────────────────────────────────────

ALTER TABLE "about_page"   ADD COLUMN IF NOT EXISTS "approach_section_what_we_do_subheading"         varchar;
ALTER TABLE "about_page"   ADD COLUMN IF NOT EXISTS "header_background_image_id"                     integer;
ALTER TABLE "_about_page_v" ADD COLUMN IF NOT EXISTS "version_approach_section_what_we_do_subheading" varchar;
ALTER TABLE "_about_page_v" ADD COLUMN IF NOT EXISTS "version_header_background_image_id"             integer;

DO $$ BEGIN
  ALTER TABLE "about_page"
    ADD CONSTRAINT "about_page_header_background_image_id_media_id_fk"
    FOREIGN KEY ("header_background_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_about_page_v"
    ADD CONSTRAINT "_about_page_v_version_header_background_image_id_media_id_fk"
    FOREIGN KEY ("version_header_background_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 6. about_page_approach_section_what_we_do_bullets ──────────────────────

CREATE TABLE IF NOT EXISTS "about_page_approach_section_what_we_do_bullets" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"      varchar,
  "bullet"     varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS "about_page_approach_section_what_we_do_bullets_order_idx"
  ON "about_page_approach_section_what_we_do_bullets" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "about_page_approach_section_what_we_do_bullets_parent_id_idx"
  ON "about_page_approach_section_what_we_do_bullets" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "about_page_approach_section_what_we_do_bullets"
    ADD CONSTRAINT "about_page_approach_section_what_we_do_bullets_parent_id_about_page_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "about_page"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 7. _about_page_v_version_approach_section_what_we_do_bullets (draft version) ───
-- NOTE: Payload v3 version array tables use the pattern __{global}_v_version_{field_path}

CREATE TABLE IF NOT EXISTS "_about_page_v_version_approach_section_what_we_do_bullets" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"      varchar,
  "bullet"     varchar NOT NULL
);

CREATE INDEX IF NOT EXISTS "_about_page_v_version_approach_section_what_we_do_bullets_order_idx"
  ON "_about_page_v_version_approach_section_what_we_do_bullets" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "_about_page_v_version_approach_section_what_we_do_bullets_parent_id_idx"
  ON "_about_page_v_version_approach_section_what_we_do_bullets" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "_about_page_v_version_approach_section_what_we_do_bullets"
    ADD CONSTRAINT "_about_page_v_version_approach_section_what_we_do_bullets_parent_id__about_page_v_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_about_page_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Drop the wrongly-named table if it exists (created in a previous run with wrong name)
DROP TABLE IF EXISTS "_about_page_v_approach_section_what_we_do_bullets";


-- ── 8. site_social (SiteSettings.social live array) ───────────────────────────

CREATE TABLE IF NOT EXISTS "site_social" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "platform"   varchar,
  "url"        varchar
);

CREATE INDEX IF NOT EXISTS "site_social_order_idx"     ON "site_social" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "site_social_parent_id_idx" ON "site_social" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "site_social"
    ADD CONSTRAINT "site_social_parent_id_site_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "site"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 9. _site_v_version_social (SiteSettings.social version array) ─────────────

CREATE TABLE IF NOT EXISTS "_site_v_version_social" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"      varchar,
  "platform"   varchar,
  "url"        varchar
);

CREATE INDEX IF NOT EXISTS "_site_v_version_social_order_idx"     ON "_site_v_version_social" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "_site_v_version_social_parent_id_idx" ON "_site_v_version_social" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "_site_v_version_social"
    ADD CONSTRAINT "_site_v_version_social_parent_id__site_v_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_site_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 10. site_intervention_countries (live array) ──────────────────────────────

CREATE TABLE IF NOT EXISTS "site_intervention_countries" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"       varchar,
  "iso_code"   varchar,
  "programs"   varchar
);

CREATE INDEX IF NOT EXISTS "site_intervention_countries_order_idx"     ON "site_intervention_countries" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "site_intervention_countries_parent_id_idx" ON "site_intervention_countries" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "site_intervention_countries"
    ADD CONSTRAINT "site_intervention_countries_parent_id_site_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "site"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 11. _site_v_version_intervention_countries (version array) ────────────────

CREATE TABLE IF NOT EXISTS "_site_v_version_intervention_countries" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"      varchar,
  "name"       varchar,
  "iso_code"   varchar,
  "programs"   varchar
);

CREATE INDEX IF NOT EXISTS "_site_v_version_intervention_countries_order_idx"     ON "_site_v_version_intervention_countries" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "_site_v_version_intervention_countries_parent_id_idx" ON "_site_v_version_intervention_countries" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "_site_v_version_intervention_countries"
    ADD CONSTRAINT "_site_v_version_intervention_countries_parent_id__site_v_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_site_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 12. site_navigation_primary_links (live array) ────────────────────────────

CREATE TABLE IF NOT EXISTS "site_navigation_primary_links" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "label"      varchar,
  "path"       varchar
);

CREATE INDEX IF NOT EXISTS "site_navigation_primary_links_order_idx"     ON "site_navigation_primary_links" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "site_navigation_primary_links_parent_id_idx" ON "site_navigation_primary_links" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "site_navigation_primary_links"
    ADD CONSTRAINT "site_navigation_primary_links_parent_id_site_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "site"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 13. site_navigation_primary_links_children (nested live array) ────────────

CREATE TABLE IF NOT EXISTS "site_navigation_primary_links_children" (
  "_order"      integer NOT NULL,
  "_parent_id"  varchar NOT NULL,
  "id"          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "label"       varchar,
  "path"        varchar,
  "description" varchar,
  "icon"        varchar
);

CREATE INDEX IF NOT EXISTS "site_navigation_primary_links_children_order_idx"     ON "site_navigation_primary_links_children" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "site_navigation_primary_links_children_parent_id_idx" ON "site_navigation_primary_links_children" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "site_navigation_primary_links_children"
    ADD CONSTRAINT "site_navigation_primary_links_children_parent_id_site_navigation_primary_links_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "site_navigation_primary_links"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 14. _site_v_version_navigation_primary_links (version array) ──────────────

CREATE TABLE IF NOT EXISTS "_site_v_version_navigation_primary_links" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"      varchar,
  "label"      varchar,
  "path"       varchar
);

CREATE INDEX IF NOT EXISTS "_site_v_version_navigation_primary_links_order_idx"     ON "_site_v_version_navigation_primary_links" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "_site_v_version_navigation_primary_links_parent_id_idx" ON "_site_v_version_navigation_primary_links" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "_site_v_version_navigation_primary_links"
    ADD CONSTRAINT "_site_v_version_navigation_primary_links_parent_id__site_v_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_site_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 15. _site_v_version_navigation_primary_links_children (nested version array) ──

CREATE TABLE IF NOT EXISTS "_site_v_version_navigation_primary_links_children" (
  "_order"      integer NOT NULL,
  "_parent_id"  varchar NOT NULL,
  "id"          varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"       varchar,
  "label"       varchar,
  "path"        varchar,
  "description" varchar,
  "icon"        varchar
);

CREATE INDEX IF NOT EXISTS "_site_v_version_navigation_primary_links_children_order_idx"     ON "_site_v_version_navigation_primary_links_children" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "_site_v_version_navigation_primary_links_children_parent_id_idx" ON "_site_v_version_navigation_primary_links_children" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "_site_v_version_navigation_primary_links_children"
    ADD CONSTRAINT "_site_v_version_navigation_primary_links_children_parent_id__site_v_version_navigation_primary_links_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_site_v_version_navigation_primary_links"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 16. site_footer_quick_links (live array) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS "site_footer_quick_links" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "label"      varchar,
  "path"       varchar
);

CREATE INDEX IF NOT EXISTS "site_footer_quick_links_order_idx"     ON "site_footer_quick_links" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "site_footer_quick_links_parent_id_idx" ON "site_footer_quick_links" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "site_footer_quick_links"
    ADD CONSTRAINT "site_footer_quick_links_parent_id_site_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "site"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 17. _site_v_version_footer_quick_links (version array) ───────────────────

CREATE TABLE IF NOT EXISTS "_site_v_version_footer_quick_links" (
  "_order"     integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id"         varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "_uuid"      varchar,
  "label"      varchar,
  "path"       varchar
);

CREATE INDEX IF NOT EXISTS "_site_v_version_footer_quick_links_order_idx"     ON "_site_v_version_footer_quick_links" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "_site_v_version_footer_quick_links_parent_id_idx" ON "_site_v_version_footer_quick_links" USING btree ("_parent_id");

DO $$ BEGIN
  ALTER TABLE "_site_v_version_footer_quick_links"
    ADD CONSTRAINT "_site_v_version_footer_quick_links_parent_id__site_v_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "_site_v"("id") ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 18. projects_page global (live table) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS "projects_page" (
  "id"                        serial PRIMARY KEY,
  "header_eyebrow"            varchar,
  "header_heading"            varchar,
  "header_body"               varchar,
  "cta_section_heading"       varchar,
  "cta_section_body"          varchar,
  "cta_section_cta_label"     varchar,
  "cta_section_cta_path"      varchar,
  "seo_meta_title"            varchar,
  "seo_meta_description"      varchar,
  "seo_og_image_id"           integer,
  "_status"                   varchar DEFAULT 'draft',
  "updated_at"                timestamp(3) with time zone,
  "created_at"                timestamp(3) with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "projects_page"
    ADD CONSTRAINT "projects_page_seo_og_image_id_media_id_fk"
    FOREIGN KEY ("seo_og_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 19. _projects_page_v (draft versions) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS "_projects_page_v" (
  "id"                                serial PRIMARY KEY,
  "parent_id"                         integer,
  "version_header_eyebrow"            varchar,
  "version_header_heading"            varchar,
  "version_header_body"               varchar,
  "version_cta_section_heading"       varchar,
  "version_cta_section_body"          varchar,
  "version_cta_section_cta_label"     varchar,
  "version_cta_section_cta_path"      varchar,
  "version_seo_meta_title"            varchar,
  "version_seo_meta_description"      varchar,
  "version_seo_og_image_id"           integer,
  "version__status"                   varchar DEFAULT 'draft',
  "updated_at"                        timestamp(3) with time zone,
  "created_at"                        timestamp(3) with time zone DEFAULT now() NOT NULL,
  "latest"                            boolean,
  "autosave"                          boolean
);

ALTER TABLE "_projects_page_v" ADD COLUMN IF NOT EXISTS "version_updated_at" timestamp(3) with time zone;
ALTER TABLE "_projects_page_v" ADD COLUMN IF NOT EXISTS "version_created_at" timestamp(3) with time zone;

CREATE INDEX IF NOT EXISTS "_projects_page_v_parent_id_idx" ON "_projects_page_v" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "_projects_page_v_version_status_idx" ON "_projects_page_v" USING btree ("version__status");
CREATE INDEX IF NOT EXISTS "_projects_page_v_latest_idx" ON "_projects_page_v" USING btree ("latest");

DO $$ BEGIN
  ALTER TABLE "_projects_page_v"
    ADD CONSTRAINT "_projects_page_v_parent_id_projects_page_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "projects_page"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_projects_page_v"
    ADD CONSTRAINT "_projects_page_v_version_seo_og_image_id_media_id_fk"
    FOREIGN KEY ("version_seo_og_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 20. publications_page global (live table) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS "publications_page" (
  "id"                        serial PRIMARY KEY,
  "header_eyebrow"            varchar,
  "header_heading"            varchar,
  "header_body"               varchar,
  "cta_section_heading"       varchar,
  "cta_section_body"          varchar,
  "cta_section_cta_label"     varchar,
  "cta_section_cta_path"      varchar,
  "seo_meta_title"            varchar,
  "seo_meta_description"      varchar,
  "seo_og_image_id"           integer,
  "_status"                   varchar DEFAULT 'draft',
  "updated_at"                timestamp(3) with time zone,
  "created_at"                timestamp(3) with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "publications_page"
    ADD CONSTRAINT "publications_page_seo_og_image_id_media_id_fk"
    FOREIGN KEY ("seo_og_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 21. _publications_page_v (draft versions) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS "_publications_page_v" (
  "id"                                serial PRIMARY KEY,
  "parent_id"                         integer,
  "version_header_eyebrow"            varchar,
  "version_header_heading"            varchar,
  "version_header_body"               varchar,
  "version_cta_section_heading"       varchar,
  "version_cta_section_body"          varchar,
  "version_cta_section_cta_label"     varchar,
  "version_cta_section_cta_path"      varchar,
  "version_seo_meta_title"            varchar,
  "version_seo_meta_description"      varchar,
  "version_seo_og_image_id"           integer,
  "version__status"                   varchar DEFAULT 'draft',
  "updated_at"                        timestamp(3) with time zone,
  "created_at"                        timestamp(3) with time zone DEFAULT now() NOT NULL,
  "latest"                            boolean,
  "autosave"                          boolean
);

ALTER TABLE "_publications_page_v" ADD COLUMN IF NOT EXISTS "version_updated_at" timestamp(3) with time zone;
ALTER TABLE "_publications_page_v" ADD COLUMN IF NOT EXISTS "version_created_at" timestamp(3) with time zone;

CREATE INDEX IF NOT EXISTS "_publications_page_v_parent_id_idx" ON "_publications_page_v" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "_publications_page_v_version_status_idx" ON "_publications_page_v" USING btree ("version__status");
CREATE INDEX IF NOT EXISTS "_publications_page_v_latest_idx" ON "_publications_page_v" USING btree ("latest");

DO $$ BEGIN
  ALTER TABLE "_publications_page_v"
    ADD CONSTRAINT "_publications_page_v_parent_id_publications_page_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "publications_page"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_publications_page_v"
    ADD CONSTRAINT "_publications_page_v_version_seo_og_image_id_media_id_fk"
    FOREIGN KEY ("version_seo_og_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 22. news_page global (live table) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "news_page" (
  "id"                        serial PRIMARY KEY,
  "header_eyebrow"            varchar,
  "header_heading"            varchar,
  "header_body"               varchar,
  "cta_section_heading"       varchar,
  "cta_section_body"          varchar,
  "cta_section_cta_label"     varchar,
  "cta_section_cta_path"      varchar,
  "seo_meta_title"            varchar,
  "seo_meta_description"      varchar,
  "seo_og_image_id"           integer,
  "_status"                   varchar DEFAULT 'draft',
  "updated_at"                timestamp(3) with time zone,
  "created_at"                timestamp(3) with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
  ALTER TABLE "news_page"
    ADD CONSTRAINT "news_page_seo_og_image_id_media_id_fk"
    FOREIGN KEY ("seo_og_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 23. _news_page_v (draft versions) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "_news_page_v" (
  "id"                                serial PRIMARY KEY,
  "parent_id"                         integer,
  "version_header_eyebrow"            varchar,
  "version_header_heading"            varchar,
  "version_header_body"               varchar,
  "version_cta_section_heading"       varchar,
  "version_cta_section_body"          varchar,
  "version_cta_section_cta_label"     varchar,
  "version_cta_section_cta_path"      varchar,
  "version_seo_meta_title"            varchar,
  "version_seo_meta_description"      varchar,
  "version_seo_og_image_id"           integer,
  "version__status"                   varchar DEFAULT 'draft',
  "updated_at"                        timestamp(3) with time zone,
  "created_at"                        timestamp(3) with time zone DEFAULT now() NOT NULL,
  "latest"                            boolean,
  "autosave"                          boolean
);

ALTER TABLE "_news_page_v" ADD COLUMN IF NOT EXISTS "version_updated_at" timestamp(3) with time zone;
ALTER TABLE "_news_page_v" ADD COLUMN IF NOT EXISTS "version_created_at" timestamp(3) with time zone;

CREATE INDEX IF NOT EXISTS "_news_page_v_parent_id_idx" ON "_news_page_v" USING btree ("parent_id");
CREATE INDEX IF NOT EXISTS "_news_page_v_version_status_idx" ON "_news_page_v" USING btree ("version__status");
CREATE INDEX IF NOT EXISTS "_news_page_v_latest_idx" ON "_news_page_v" USING btree ("latest");

DO $$ BEGIN
  ALTER TABLE "_news_page_v"
    ADD CONSTRAINT "_news_page_v_parent_id_news_page_id_fk"
    FOREIGN KEY ("parent_id") REFERENCES "news_page"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "_news_page_v"
    ADD CONSTRAINT "_news_page_v_version_seo_og_image_id_media_id_fk"
    FOREIGN KEY ("version_seo_og_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
