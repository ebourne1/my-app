import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`gallery_blocks_photo\` (
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
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_order_idx\` ON \`gallery_blocks_photo\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_parent_id_idx\` ON \`gallery_blocks_photo\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_path_idx\` ON \`gallery_blocks_photo\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_image_idx\` ON \`gallery_blocks_photo\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`gallery_blocks_photo_bulk\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`is_film_photo\` integer DEFAULT false,
  	\`film_type\` text,
  	\`film_stock\` text,
  	\`black_and_white\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_bulk_order_idx\` ON \`gallery_blocks_photo_bulk\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_bulk_parent_id_idx\` ON \`gallery_blocks_photo_bulk\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_photo_bulk_path_idx\` ON \`gallery_blocks_photo_bulk\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`gallery_blocks_featured_photo\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`enable_overlay\` integer DEFAULT false,
  	\`overlay_text\` text,
  	\`button_text\` text,
  	\`button_link\` text,
  	\`font_family\` text DEFAULT 'lobster-two',
  	\`font_size\` numeric DEFAULT 64,
  	\`font_color\` text DEFAULT '#ffffff',
  	\`text_alignment\` text DEFAULT 'center',
  	\`text_vertical_position\` text DEFAULT 'center',
  	\`text_width\` text DEFAULT 'medium',
  	\`line_height\` text DEFAULT 'normal',
  	\`button_alignment\` text DEFAULT 'center',
  	\`button_vertical_position\` text DEFAULT 'center',
  	\`overlay_intensity\` text DEFAULT 'medium',
  	\`text_shadow\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_blocks_featured_photo_order_idx\` ON \`gallery_blocks_featured_photo\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_featured_photo_parent_id_idx\` ON \`gallery_blocks_featured_photo\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_featured_photo_path_idx\` ON \`gallery_blocks_featured_photo\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_featured_photo_image_idx\` ON \`gallery_blocks_featured_photo\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`gallery_blocks_text_card\` (
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
  await db.run(sql`CREATE INDEX \`gallery_blocks_text_card_order_idx\` ON \`gallery_blocks_text_card\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_text_card_parent_id_idx\` ON \`gallery_blocks_text_card\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_blocks_text_card_path_idx\` ON \`gallery_blocks_text_card\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`gallery\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`published\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_updated_at_idx\` ON \`gallery\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`gallery_created_at_idx\` ON \`gallery\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`gallery_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_rels_order_idx\` ON \`gallery_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`gallery_rels_parent_idx\` ON \`gallery_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_rels_path_idx\` ON \`gallery_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`gallery_rels_media_id_idx\` ON \`gallery_rels\` (\`media_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`gallery_id\` integer REFERENCES gallery(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_gallery_id_idx\` ON \`payload_locked_documents_rels\` (\`gallery_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`gallery_blocks_photo\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_photo_bulk\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_featured_photo\`;`)
  await db.run(sql`DROP TABLE \`gallery_blocks_text_card\`;`)
  await db.run(sql`DROP TABLE \`gallery\`;`)
  await db.run(sql`DROP TABLE \`gallery_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
