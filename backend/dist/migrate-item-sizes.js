"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv = require("dotenv");
dotenv.config();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});
async function migrateItemSizes() {
    await AppDataSource.initialize();
    console.log('Connected to database');
    await AppDataSource.transaction(async (m) => {
        await m.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS has_sizes boolean NOT NULL DEFAULT false`);
        await m.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS size_prices jsonb`);
        await m.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS size_labels jsonb`);
        await m.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size varchar(10)`);
        await m.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size_label varchar`);
        console.log('Columns ready');
        const [, espresso] = await m.query(`UPDATE menu_items
          SET has_sizes = true,
              size_prices = COALESCE(size_prices, jsonb_build_object('small', price, 'medium', price, 'large', price)),
              size_labels = jsonb_build_object('small', 'E shkurtër', 'medium', 'E mesme', 'large', 'E gjatë')
        WHERE lower(trim(name)) = 'espresso'
          AND size_labels IS NULL`);
        console.log(`Espresso: ${espresso ?? 0} row(s) set up with sizes`);
        const [, macchiato] = await m.query(`UPDATE menu_items
          SET has_sizes = true,
              size_prices = COALESCE(size_prices, jsonb_build_object('small', price, 'medium', price, 'large', price)),
              size_labels = jsonb_build_object('small', 'E vogël', 'medium', 'E mesme', 'large', 'E madhe')
        WHERE lower(trim(name)) LIKE 'macchiato%'
          AND size_labels IS NULL`);
        console.log(`Macchiato: ${macchiato ?? 0} row(s) set up with sizes`);
    });
    await AppDataSource.destroy();
}
migrateItemSizes().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-item-sizes.js.map