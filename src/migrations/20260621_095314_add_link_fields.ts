import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "programs_initiatives" ADD COLUMN "link_link_label" varchar DEFAULT 'Learn more';
    ALTER TABLE "programs_initiatives" ADD COLUMN "link_link_url" varchar;
    ALTER TABLE "_programs_v_version_initiatives" ADD COLUMN "link_link_label" varchar DEFAULT 'Learn more';
    ALTER TABLE "_programs_v_version_initiatives" ADD COLUMN "link_link_url" varchar;
    ALTER TABLE "research_tools" ADD COLUMN "link_link_label" varchar DEFAULT 'Learn more';
    ALTER TABLE "research_tools" ADD COLUMN "link_link_url" varchar;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "programs_initiatives" DROP COLUMN "link_link_label";
    ALTER TABLE "programs_initiatives" DROP COLUMN "link_link_url";
    ALTER TABLE "_programs_v_version_initiatives" DROP COLUMN "link_link_label";
    ALTER TABLE "_programs_v_version_initiatives" DROP COLUMN "link_link_url";
    ALTER TABLE "research_tools" DROP COLUMN "link_link_label";
    ALTER TABLE "research_tools" DROP COLUMN "link_link_url";
  `)
}
