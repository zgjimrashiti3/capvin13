"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
const menu_item_entity_1 = require("./entities/menu-item.entity");
const user_entity_1 = require("./entities/user.entity");
const dotenv = require("dotenv");
dotenv.config();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [category_entity_1.Category, menu_item_entity_1.MenuItem, user_entity_1.User],
    synchronize: false,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});
const NULL_UPDATES = [
    { match: 'Macchiato pa Plum', url: 'https://images.unsplash.com/photo-1485808191679-5f86510bd652?w=800' },
    { match: 'Macchiato e Vogël', url: 'https://images.unsplash.com/photo-1485808191679-5f86510bd652?w=800' },
    { match: 'Cajrat', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800' },
    { match: 'Illy Crema', url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800' },
    { match: 'Acqua Panna', url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', uselike: true },
    { match: 'Santal', url: 'https://images.unsplash.com/photo-1534353341699-5a88e8842a0e?w=800', uselike: true },
    { match: 'Birra 0%', url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800' },
    { match: 'Rose Lemonade', url: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=800' },
    { match: 'Mozzallerone', url: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800' },
    { match: 'Sallata e Gjelbër', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },
    { match: 'Sallata Miks', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800' },
];
const FORCE_UPDATES = [
    { match: 'Scheppes', url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800', uselike: true },
    { match: 'Pollastrella', url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800' },
    { match: 'Paestum', url: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=800' },
];
async function fixImages() {
    await AppDataSource.initialize();
    console.log('Connected to database');
    let total = 0;
    for (const { match, url, uselike } of NULL_UPDATES) {
        const condition = uselike ? `name LIKE $1` : `name = $1`;
        const param = uselike ? `%${match}%` : match;
        const result = await AppDataSource.query(`UPDATE menu_items SET image_url = $2 WHERE (image_url IS NULL OR image_url = '') AND ${condition}`, [param, url]);
        const count = result[1] ?? 0;
        if (count > 0)
            console.log(`  [null-fix]  ${count} row(s) matching "${match}"`);
        total += count;
    }
    for (const { match, url, uselike } of FORCE_UPDATES) {
        const condition = uselike ? `name LIKE $1` : `name = $1`;
        const param = uselike ? `%${match}%` : match;
        const result = await AppDataSource.query(`UPDATE menu_items SET image_url = $2 WHERE ${condition}`, [param, url]);
        const count = result[1] ?? 0;
        if (count > 0)
            console.log(`  [forced]    ${count} row(s) matching "${match}"`);
        total += count;
    }
    console.log(`\nDone — ${total} row(s) updated.`);
    await AppDataSource.destroy();
}
fixImages().catch((err) => {
    console.error('Fix failed:', err);
    process.exit(1);
});
//# sourceMappingURL=fix-images.js.map