import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

// Safe to run more than once, before or after the app has started with the new code.
async function migrateItemSizes() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  await AppDataSource.transaction(async (m) => {
    // Existing items default to single-price (has_sizes = false, no size prices/labels).
    await m.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS has_sizes boolean NOT NULL DEFAULT false`);
    await m.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS size_prices jsonb`);
    await m.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS size_labels jsonb`);
    await m.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size varchar(10)`);
    await m.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size_label varchar`);
    console.log('Columns ready');

    // Espresso: E shkurtër / E mesme / E gjatë, all starting at its current price.
    // Adjust each size price from the admin panel afterwards.
    const [, espresso] = await m.query(
      `UPDATE menu_items
          SET has_sizes = true,
              size_prices = COALESCE(size_prices, jsonb_build_object('small', price, 'medium', price, 'large', price)),
              size_labels = jsonb_build_object('small', 'E shkurtër', 'medium', 'E mesme', 'large', 'E gjatë')
        WHERE lower(trim(name)) = 'espresso'
          AND size_labels IS NULL`,
    );
    console.log(`Espresso: ${espresso ?? 0} row(s) set up with sizes`);

    // Macchiato items (e vogël, e madhe, pa plum): E vogël / E mesme / E madhe,
    // each size starting at the item's current price. Names and availability are untouched.
    const [, macchiato] = await m.query(
      `UPDATE menu_items
          SET has_sizes = true,
              size_prices = COALESCE(size_prices, jsonb_build_object('small', price, 'medium', price, 'large', price)),
              size_labels = jsonb_build_object('small', 'E vogël', 'medium', 'E mesme', 'large', 'E madhe')
        WHERE lower(trim(name)) LIKE 'macchiato%'
          AND size_labels IS NULL`,
    );
    console.log(`Macchiato: ${macchiato ?? 0} row(s) set up with sizes`);
  });

  await AppDataSource.destroy();
}

migrateItemSizes().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
