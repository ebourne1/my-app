import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`gallery_blocks_overlay_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text,
  	\`alignment\` text DEFAULT 'center',
  	\`vertical_position\` text DEFAULT 'center',
  	\`width\` text DEFAULT 'medium',
  	\`font_size\` numeric DEFAULT 64,
  	\`font_color\` text DEFAULT '#ffffff',
  	\`line_height\` text DEFAULT 'normal',
  	\`font_family\` text DEFAULT 'lobster-two',
  	\`text_shadow\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_overlay_text_order_idx\` ON \`gallery_blocks_overlay_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_overlay_text_parent_id_idx\` ON \`gallery_blocks_overlay_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_overlay_text_path_idx\` ON \`gallery_blocks_overlay_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`gallery_blocks_overlay_button\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`button_text\` text,
  	\`button_link\` text,
  	\`alignment\` text DEFAULT 'center',
  	\`vertical_position\` text DEFAULT 'bottom',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_overlay_button_order_idx\` ON \`gallery_blocks_overlay_button\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_overlay_button_parent_id_idx\` ON \`gallery_blocks_overlay_button\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_overlay_button_path_idx\` ON \`gallery_blocks_overlay_button\` (\`_path\`);`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`overlay_text\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`button_text\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`button_link\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`font_family\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`font_size\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`font_color\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`text_alignment\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`text_vertical_position\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`text_width\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`line_height\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`button_alignment\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`button_vertical_position\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`text_shadow\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`gallery_blocks_overlay_text\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_overlay_button\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`overlay_text\` text;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`button_text\` text;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`button_link\` text;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`font_family\` text DEFAULT 'lobster-two';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`font_size\` numeric DEFAULT 64;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`font_color\` text DEFAULT '#ffffff';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`text_alignment\` text DEFAULT 'center';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`text_vertical_position\` text DEFAULT 'center';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`text_width\` text DEFAULT 'medium';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`line_height\` text DEFAULT 'normal';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`button_alignment\` text DEFAULT 'center';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`button_vertical_position\` text DEFAULT 'center';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`text_shadow\` integer DEFAULT true;`)
}
