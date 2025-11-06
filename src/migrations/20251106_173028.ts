import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`gallery_blocks_grid_photo\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`caption\` text,
  	\`is_film_photo\` integer DEFAULT false,
  	\`film_type\` text,
  	\`film_stock\` text,
  	\`black_and_white\` integer DEFAULT false,
  	\`apply_film_border\` integer DEFAULT false,
  	\`film_border_number\` text DEFAULT '1',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_photo_order_idx\` ON \`gallery_blocks_grid_photo\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_photo_parent_id_idx\` ON \`gallery_blocks_grid_photo\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_photo_path_idx\` ON \`gallery_blocks_grid_photo\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_photo_image_idx\` ON \`gallery_blocks_grid_photo\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`gallery_blocks_grid_photo_bulk\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`is_film_photo\` integer DEFAULT false,
  	\`film_type\` text,
  	\`film_stock\` text,
  	\`black_and_white\` integer DEFAULT false,
  	\`apply_film_border\` integer DEFAULT false,
  	\`film_border_number\` text DEFAULT '1',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_photo_bulk_order_idx\` ON \`gallery_blocks_grid_photo_bulk\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_photo_bulk_parent_id_idx\` ON \`gallery_blocks_grid_photo_bulk\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_photo_bulk_path_idx\` ON \`gallery_blocks_grid_photo_bulk\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`gallery_blocks_grid_text_card\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
  	\`font_family\` text DEFAULT 'inter',
  	\`font_size\` text DEFAULT 'small',
  	\`font_weight\` text DEFAULT 'normal',
  	\`line_height\` text DEFAULT 'normal',
  	\`letter_spacing\` text DEFAULT 'normal',
  	\`text_align\` text DEFAULT 'center',
  	\`background_type\` text DEFAULT 'solid',
  	\`background_color\` text DEFAULT 'light',
  	\`custom_background_color\` text,
  	\`custom_text_color\` text,
  	\`background_image_id\` integer,
  	\`overlay_color\` text DEFAULT 'dark',
  	\`custom_overlay_color\` text,
  	\`overlay_opacity\` numeric DEFAULT 70,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_text_card_order_idx\` ON \`gallery_blocks_grid_text_card\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_text_card_parent_id_idx\` ON \`gallery_blocks_grid_text_card\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_text_card_path_idx\` ON \`gallery_blocks_grid_text_card\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_grid_text_card_background_image_idx\` ON \`gallery_blocks_grid_text_card\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`gallery_blocks_photo_bulk3_across\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_bulk3_across_order_idx\` ON \`gallery_blocks_photo_bulk3_across\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_bulk3_across_parent_id_idx\` ON \`gallery_blocks_photo_bulk3_across\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_bulk3_across_path_idx\` ON \`gallery_blocks_photo_bulk3_across\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`gallery_blocks_three_across_row\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`left_image_id\` integer NOT NULL,
  	\`right_image_id\` integer NOT NULL,
  	\`text_content\` text NOT NULL,
  	\`font_family\` text DEFAULT 'inter',
  	\`font_size\` text DEFAULT 'small',
  	\`font_weight\` text DEFAULT 'normal',
  	\`line_height\` text DEFAULT 'normal',
  	\`letter_spacing\` text DEFAULT 'normal',
  	\`text_align\` text DEFAULT 'center',
  	\`background_type\` text DEFAULT 'solid',
  	\`background_color\` text DEFAULT 'light',
  	\`custom_background_color\` text,
  	\`custom_text_color\` text,
  	\`background_image_id\` integer,
  	\`overlay_color\` text DEFAULT 'dark',
  	\`custom_overlay_color\` text,
  	\`overlay_opacity\` numeric DEFAULT 70,
  	\`left_photo_caption\` text,
  	\`left_photo_is_film\` integer DEFAULT false,
  	\`left_photo_film_type\` text,
  	\`left_photo_film_stock\` text,
  	\`left_photo_black_and_white\` integer DEFAULT false,
  	\`left_photo_apply_film_border\` integer DEFAULT false,
  	\`left_photo_film_border_number\` text DEFAULT '1',
  	\`right_photo_caption\` text,
  	\`right_photo_is_film\` integer DEFAULT false,
  	\`right_photo_film_type\` text,
  	\`right_photo_film_stock\` text,
  	\`right_photo_black_and_white\` integer DEFAULT false,
  	\`right_photo_apply_film_border\` integer DEFAULT false,
  	\`right_photo_film_border_number\` text DEFAULT '1',
  	\`block_name\` text,
  	FOREIGN KEY (\`left_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`right_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_three_across_row_order_idx\` ON \`gallery_blocks_three_across_row\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_three_across_row_parent_id_idx\` ON \`gallery_blocks_three_across_row\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_three_across_row_path_idx\` ON \`gallery_blocks_three_across_row\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_three_across_row_left_image_idx\` ON \`gallery_blocks_three_across_row\` (\`left_image_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_three_across_row_right_image_idx\` ON \`gallery_blocks_three_across_row\` (\`right_image_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_three_across_row_background_image_idx\` ON \`gallery_blocks_three_across_row\` (\`background_image_id\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`bordered_version_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`bordered_version_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`bordered_version_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`bordered_version_border_number\` numeric;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_photo\` ADD \`apply_film_border\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_photo\` ADD \`film_border_number\` text DEFAULT '1';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_photo_bulk\` ADD \`apply_film_border\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_photo_bulk\` ADD \`film_border_number\` text DEFAULT '1';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`black_and_white\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`apply_film_border\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` ADD \`film_border_number\` text DEFAULT '1';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`font_family\` text DEFAULT 'inter';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`font_size\` text DEFAULT 'medium';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`font_weight\` text DEFAULT 'normal';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`line_height\` text DEFAULT 'relaxed';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`letter_spacing\` text DEFAULT 'normal';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`text_align\` text DEFAULT 'left';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`background_type\` text DEFAULT 'solid';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`custom_background_color\` text;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`custom_text_color\` text;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`background_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`overlay_color\` text DEFAULT 'dark';`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`custom_overlay_color\` text;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_text_card\` ADD \`overlay_opacity\` numeric DEFAULT 70;`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_text_card_background_image_idx\` ON \`gallery_blocks_text_card\` (\`background_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`gallery_blocks_grid_photo\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_grid_photo_bulk\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_grid_text_card\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_photo_bulk3_across\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_three_across_row\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_gallery_blocks_text_card\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`content\` text NOT NULL,
  	\`background_color\` text DEFAULT 'light',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_gallery_blocks_text_card\`("_order", "_parent_id", "_path", "id", "content", "background_color", "block_name") SELECT "_order", "_parent_id", "_path", "id", "content", "background_color", "block_name" FROM \`gallery_blocks_text_card\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_text_card\`;`)
  await db.run(sql`ALTER TABLE \`__new_gallery_blocks_text_card\` RENAME TO \`gallery_blocks_text_card\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_text_card_order_idx\` ON \`gallery_blocks_text_card\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_text_card_parent_id_idx\` ON \`gallery_blocks_text_card\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_text_card_path_idx\` ON \`gallery_blocks_text_card\` (\`_path\`);`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`bordered_version_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`bordered_version_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`bordered_version_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`bordered_version_border_number\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_photo\` DROP COLUMN \`apply_film_border\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_photo\` DROP COLUMN \`film_border_number\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_photo_bulk\` DROP COLUMN \`apply_film_border\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_photo_bulk\` DROP COLUMN \`film_border_number\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`black_and_white\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`apply_film_border\`;`)
  await db.run(sql`ALTER TABLE \`gallery_blocks_featured_photo\` DROP COLUMN \`film_border_number\`;`)
}
