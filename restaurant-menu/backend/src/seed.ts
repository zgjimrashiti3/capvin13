import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Category } from './entities/category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { User } from './entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Category, MenuItem, User],
  synchronize: true,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

type ItemDef = { name: string; description?: string; price: number; sortOrder: number };

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);
  const itemRepo = AppDataSource.getRepository(MenuItem);

  await AppDataSource.query('TRUNCATE menu_items, categories, users RESTART IDENTITY CASCADE');

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await userRepo.save(userRepo.create({ username: 'admin', passwordHash }));
  console.log('Created admin user');

  // Categories
  const cats = await categoryRepo.save([
    { name: 'Kafe',                  description: null,             sortOrder: 1 },
    { name: 'Pije',                  description: null,             sortOrder: 2 },
    { name: 'Picabërës',             description: 'Për 3 breza',    sortOrder: 3 },
    { name: 'Mozzarella di Bufala',  description: null,             sortOrder: 4 },
    { name: 'Sallatat',              description: null,             sortOrder: 5 },
    { name: 'Innovative',            description: 'Pica Innovative',    sortOrder: 6 },
    { name: 'Tradizionale',          description: 'Pica Tradizionale',  sortOrder: 7 },
    { name: 'Pasta',                 description: null,             sortOrder: 8 },
    { name: 'Calzone Napoletane',    description: null,             sortOrder: 9 },
  ]);
  const [kafe, pije, picaberës, bufala, sallata, innovative, tradizionale, pasta, calzone] = cats;
  console.log('Created 9 categories');

  const itemsByCat: Array<[Category, ItemDef[]]> = [
    [kafe, [
      { name: 'Espresso',              price: 1.2, sortOrder: 1 },
      { name: 'Macchiato e Vogël',     price: 1.2, sortOrder: 2 },
      { name: 'Macchiato pa Plum',     price: 1.2, sortOrder: 3 },
      { name: 'Macchiato e Madhe',     price: 1.5, sortOrder: 4 },
      { name: 'Cappuccino',            price: 1.5, sortOrder: 5 },
      { name: 'Illy Crema',            price: 1.5, sortOrder: 6 },
      { name: 'Frappe',                price: 1.5, sortOrder: 7 },
      { name: 'Ice Coffee',            price: 1.5, sortOrder: 8 },
      { name: 'Cajrat',                price: 1.2, sortOrder: 9 },
    ]],

    [pije, [
      { name: 'Ujë Rugove Glass 0.25l',        price: 1.2, sortOrder: 1 },
      { name: 'Ujë Rugove Glass 0.75l',        price: 1.5, sortOrder: 2 },
      { name: 'Ujë Rugove Glass 0.75l (premium)', price: 2.5, sortOrder: 3 },
      { name: 'Acqua Panna 0.25l',             price: 1.5, sortOrder: 4 },
      { name: 'Santal Mollë 0.2l',             price: 1.5, sortOrder: 5 },
      { name: 'San Pellegrino 0.25l',          price: 1.5, sortOrder: 6 },
      { name: 'San Pellegrino 0.75l',          price: 3.0, sortOrder: 7 },
      { name: 'Coca Cola 0.25l',               price: 1.5, sortOrder: 8 },
      { name: 'Coca Cola Zero 0.25l',          price: 1.5, sortOrder: 9 },
      { name: 'Fanta 0.25l',                   price: 1.5, sortOrder: 10 },
      { name: 'Santal Boronicë 0.2l',          price: 1.5, sortOrder: 11 },
      { name: 'Santal Mollë 0.2l',             price: 1.5, sortOrder: 12 },
      { name: 'Santal Pjeshkë 0.2l',           price: 1.5, sortOrder: 13 },
      { name: 'Santal Vishnje 0.2l',           price: 1.5, sortOrder: 14 },
      { name: 'Santal ACE Multi 0.25l',        price: 1.5, sortOrder: 15 },
      { name: 'Fructal dredhëza 0.2l',         price: 1.5, sortOrder: 16 },
      { name: 'Fresh Juice',                   price: 3.0, sortOrder: 17 },
      { name: 'Red Bull',                      price: 3.0, sortOrder: 18 },
      { name: 'Rose Lemonade',                 price: 3.0, sortOrder: 19 },
      { name: 'Birra 0%',                      price: 1.5, sortOrder: 20 },
      { name: 'Scheppes Bitter Lemon 0.25l',   price: 1.5, sortOrder: 21 },
      { name: 'Scheppes Tonic Water 0.25l',    price: 1.5, sortOrder: 22 },
    ]],

    [picaberës, [
      { name: 'Frittatina Napoletane', description: 'Frittatina tradicionale napoletane', price: 2.5, sortOrder: 1 },
      { name: 'Montanar al Ragu',      description: 'Montanar me ragu',                  price: 2.5, sortOrder: 2 },
      { name: 'Tris di Montanare',     description: '3 copë montanare të ndryshme',      price: 7.0, sortOrder: 3 },
      { name: 'Kroket Pataten',        description: 'Kroket me patate',                  price: 2.5, sortOrder: 4 },
      { name: 'Brusketa me Domate',    description: 'Brusketa me domate të freskëta',    price: 2.5, sortOrder: 5 },
    ]],

    [bufala, [
      { name: 'Mozzarella di Bufala DOP', description: 'Mozzarella e importuar DOP',       price: 10.0, sortOrder: 1 },
      { name: 'Mozzallerone',             description: 'Specialitet i shtëpisë',            price: 21.0, sortOrder: 2 },
      { name: 'Pollastrella',             price: 13.0, sortOrder: 3 },
      { name: 'Caprese',                  description: 'Mozzarella Bufala DOP, domate',     price: 12.0, sortOrder: 4 },
      { name: 'Paestum',                  description: 'Mozzarella Bufala DOP djathë',      price: 13.0, sortOrder: 5 },
    ]],

    [sallata, [
      { name: 'Sallata e Gjelbër', price: 5.0, sortOrder: 1 },
      { name: 'Sallata Miks',      price: 6.0, sortOrder: 2 },
    ]],

    [innovative, [
      { name: 'Centro Calabria',       description: 'Provola affumicata, salsiçe e djegës',               price: 12.0, sortOrder: 1 },
      { name: 'Don Vincenzo',          description: 'Pan polpo, açuka Pecorino Romano',                   price: 11.0, sortOrder: 2 },
      { name: 'Domenike Lontano',      description: 'San Marzano, Mozzarella di Bufala DOP',              price: 11.0, sortOrder: 3 },
      { name: 'Abbraccio e Mamà',      description: 'Salsa pomodoro, Mozzarella Fior di Latte',           price:  8.0, sortOrder: 4 },
      { name: 'Napolitidine',          description: 'Salsa pomodoro, Grana Padano, Prosciutto',           price:  9.0, sortOrder: 5 },
      { name: 'Provola e Pepe',        description: 'Kampione e korës - me gjalpë e dorë',                price:  9.0, sortOrder: 6 },
      { name: 'Melanzanella',          description: 'Salsa pomodoro, melanzane, Fior di Latte',           price:  9.0, sortOrder: 7 },
      { name: 'Stella di Capuano',     description: 'Salsa pomodoro, Fior di latte, proshutë',            price:  9.0, sortOrder: 8 },
      { name: 'Bellaria',              description: 'Salsa pomodoro, Fior di latte, domate, proshutë',    price:  9.0, sortOrder: 9 },
      { name: 'La Testitudine',        description: 'Salsa pomodoro, Fior di latte, tonno',               price:  9.0, sortOrder: 10 },
    ]],

    [tradizionale, [
      { name: 'Marinara',                  description: 'Salsa pomodoro San Marzano, aglio, origano',           price: 7.0, sortOrder: 1 },
      { name: 'Margherita',                description: 'Salsa pomodoro, Fior di Latte, basiliko',              price: 7.0, sortOrder: 2 },
      { name: 'Margherita di Bufala',      description: 'Salsa pomodoro, Mozzarella di Bufala DOP',             price: 9.0, sortOrder: 3 },
      { name: 'Bufala a Filetto',          description: 'Pomodoro Filetto, Mozzarella di Bufala DOP',           price: 12.0, sortOrder: 4 },
      { name: 'Napoli',                    description: 'Salsa pomodoro, Fior di latte, açukë, kapere',         price: 8.0, sortOrder: 5 },
      { name: 'Diavola alla Nonno Enzo',   description: 'Salsa pomodoro, Fior di Latte, salsiçe djegës',        price: 9.0, sortOrder: 6 },
      { name: 'Sguardo Alto',             description: 'Salsa pomodoro, Fior di latte, proshutë, kërpudha',    price: 10.0, sortOrder: 7 },
      { name: 'Salsiccia e Broccoli',      description: 'Salsa pomodoro, Fior di latte, salsiçe, brokoli',      price: 10.0, sortOrder: 8 },
    ]],

    [pasta, [
      { name: 'Pasta Bolognese',   description: 'Pasta me salcë bolognese',    price: 7.0, sortOrder: 1 },
      { name: 'Pasta Carbonara',   description: 'Pasta, vezë, pancetta, Pecorino', price: 7.0, sortOrder: 2 },
      { name: 'Pasta Fruta Deti',  description: 'Pasta me fruta deti',         price: 9.0, sortOrder: 3 },
    ]],

    [calzone, [
      { name: 'Calzone al Forno',      description: 'Fior di latte, salsiçe, salsa pomodoro',                  price: 9.0,  sortOrder: 1 },
      { name: 'Pizza Fritta Completa', description: 'Ricotta, salsiçe, Fior di latte, salsa pomodoro',         price: 10.0, sortOrder: 2 },
    ]],
  ];

  let total = 0;
  for (const [cat, items] of itemsByCat) {
    await itemRepo.save(
      items.map((i) => itemRepo.create({ categoryId: cat.id, isAvailable: true, ...i })),
    );
    total += items.length;
  }
  console.log(`Created ${total} menu items across ${cats.length} categories`);

  await AppDataSource.destroy();
  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
