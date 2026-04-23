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

const U = (q: string) => `https://source.unsplash.com/featured/800x600/?${q}`;

type ItemDef = {
  name: string;
  description?: string;
  price: number;
  sortOrder: number;
  imageUrl?: string;
};

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
    { name: 'Kafe',                 description: null,               sortOrder: 1 },
    { name: 'Pije',                 description: null,               sortOrder: 2 },
    { name: 'Picabërës',            description: 'Për 3 breza',      sortOrder: 3 },
    { name: 'Mozzarella di Bufala', description: null,               sortOrder: 4 },
    { name: 'Sallatat',             description: null,               sortOrder: 5 },
    { name: 'Innovative',           description: 'Pica Innovative',  sortOrder: 6 },
    { name: 'Tradizionale',         description: 'Pica Tradizionale',sortOrder: 7 },
    { name: 'Pasta',                description: null,               sortOrder: 8 },
    { name: 'Calzone Napoletane',   description: null,               sortOrder: 9 },
  ]);
  const [kafe, pije, picaberës, bufala, sallata, innovative, tradizionale, pasta, calzone] = cats;
  console.log('Created 9 categories');

  const itemsByCat: Array<[Category, ItemDef[]]> = [

    // ── Kafe ──
    [kafe, [
      { name: 'Espresso',           imageUrl: U('espresso'),          price: 1.2, sortOrder: 1 },
      { name: 'Macchiato e Vogël',  imageUrl: U('macchiato'),         price: 1.2, sortOrder: 2 },
      { name: 'Macchiato pa Plum',  imageUrl: U('macchiato'),         price: 1.2, sortOrder: 3 },
      { name: 'Macchiato e Madhe',  imageUrl: U('macchiato,coffee'),  price: 1.5, sortOrder: 4 },
      { name: 'Cappuccino',         imageUrl: U('cappuccino'),        price: 1.5, sortOrder: 5 },
      { name: 'Illy Crema',         imageUrl: U('coffee,crema'),      price: 1.5, sortOrder: 6 },
      { name: 'Frappe',             imageUrl: U('frappe,coffee'),     price: 1.5, sortOrder: 7 },
      { name: 'Ice Coffee',         imageUrl: U('iced,coffee'),       price: 1.5, sortOrder: 8 },
      { name: 'Cajrat',             imageUrl: U('tea'),               price: 1.2, sortOrder: 9 },
    ]],

    // ── Pije ──
    [pije, [
      { name: 'Ujë Rugove Glass 0.25l',        imageUrl: U('water,glass'),     price: 1.2, sortOrder: 1 },
      { name: 'Ujë Rugove Glass 0.75l',        imageUrl: U('water,glass'),     price: 1.5, sortOrder: 2 },
      { name: 'Ujë Rugove Glass 0.75l (premium)', imageUrl: U('water,glass'), price: 2.5, sortOrder: 3 },
      { name: 'Acqua Panna 0.25l',             imageUrl: U('water,glass'),     price: 1.5, sortOrder: 4 },
      { name: 'Santal Mollë 0.2l',             imageUrl: U('juice,bottle'),    price: 1.5, sortOrder: 5 },
      { name: 'San Pellegrino 0.25l',          imageUrl: U('sparkling,water'), price: 1.5, sortOrder: 6 },
      { name: 'San Pellegrino 0.75l',          imageUrl: U('sparkling,water'), price: 3.0, sortOrder: 7 },
      { name: 'Coca Cola 0.25l',               imageUrl: U('coca,cola'),       price: 1.5, sortOrder: 8 },
      { name: 'Coca Cola Zero 0.25l',          imageUrl: U('cola,zero'),       price: 1.5, sortOrder: 9 },
      { name: 'Fanta 0.25l',                   imageUrl: U('fanta,orange'),    price: 1.5, sortOrder: 10 },
      { name: 'Santal Boronicë 0.2l',          imageUrl: U('juice,bottle'),    price: 1.5, sortOrder: 11 },
      { name: 'Santal Mollë 0.2l',             imageUrl: U('juice,bottle'),    price: 1.5, sortOrder: 12 },
      { name: 'Santal Pjeshkë 0.2l',           imageUrl: U('juice,bottle'),    price: 1.5, sortOrder: 13 },
      { name: 'Santal Vishnje 0.2l',           imageUrl: U('juice,bottle'),    price: 1.5, sortOrder: 14 },
      { name: 'Santal ACE Multi 0.25l',        imageUrl: U('juice,bottle'),    price: 1.5, sortOrder: 15 },
      { name: 'Fructal dredhëza 0.2l',         imageUrl: U('juice,bottle'),    price: 1.5, sortOrder: 16 },
      { name: 'Fresh Juice',                   imageUrl: U('fresh,juice'),     price: 3.0, sortOrder: 17 },
      { name: 'Red Bull',                      imageUrl: U('energy,drink'),    price: 3.0, sortOrder: 18 },
      { name: 'Rose Lemonade',                 imageUrl: U('lemonade,rose'),   price: 3.0, sortOrder: 19 },
      { name: 'Birra 0%',                      imageUrl: U('beer,glass'),      price: 1.5, sortOrder: 20 },
      { name: 'Scheppes Bitter Lemon 0.25l',   imageUrl: U('tonic,water'),     price: 1.5, sortOrder: 21 },
      { name: 'Scheppes Tonic Water 0.25l',    imageUrl: U('tonic,water'),     price: 1.5, sortOrder: 22 },
    ]],

    // ── Picabërës ──
    [picaberës, [
      { name: 'Frittatina Napoletane', description: 'Frittatina tradicionale napoletane', imageUrl: U('italian,appetizer'),    price: 2.5, sortOrder: 1 },
      { name: 'Montanar al Ragu',      description: 'Montanar me ragu',                  imageUrl: U('fried,dough'),          price: 2.5, sortOrder: 2 },
      { name: 'Tris di Montanare',     description: '3 copë montanare të ndryshme',      imageUrl: U('italian,street,food'),  price: 7.0, sortOrder: 3 },
      { name: 'Kroket Pataten',        description: 'Kroket me patate',                  imageUrl: U('croquettes,potato'),    price: 2.5, sortOrder: 4 },
      { name: 'Brusketa me Domate',    description: 'Brusketa me domate të freskëta',    imageUrl: U('bruschetta,tomato'),    price: 2.5, sortOrder: 5 },
    ]],

    // ── Mozzarella di Bufala ──
    [bufala, [
      { name: 'Mozzarella di Bufala DOP', description: 'Mozzarella e importuar DOP',   imageUrl: U('mozzarella,bufala'),    price: 10.0, sortOrder: 1 },
      { name: 'Mozzallerone',             description: 'Specialitet i shtëpisë',        imageUrl: U('mozzarella,cheese'),   price: 21.0, sortOrder: 2 },
      { name: 'Pollastrella',                                                            imageUrl: U('chicken,italian'),     price: 13.0, sortOrder: 3 },
      { name: 'Caprese',                  description: 'Mozzarella Bufala DOP, domate', imageUrl: U('caprese,salad'),       price: 12.0, sortOrder: 4 },
      { name: 'Paestum',                  description: 'Mozzarella Bufala DOP djathë',  imageUrl: U('buffalo,mozzarella'),  price: 13.0, sortOrder: 5 },
    ]],

    // ── Sallatat ──
    [sallata, [
      { name: 'Sallata e Gjelbër', imageUrl: U('green,salad'),  price: 5.0, sortOrder: 1 },
      { name: 'Sallata Miks',      imageUrl: U('mixed,salad'),  price: 6.0, sortOrder: 2 },
    ]],

    // ── Innovative ──
    [innovative, [
      { name: 'Centro Calabria',    description: 'Provola affumicata, salsiçe e djegës',             imageUrl: U('pizza,spicy'),          price: 12.0, sortOrder: 1 },
      { name: 'Don Vincenzo',       description: 'Pan polpo, açuka Pecorino Romano',                 imageUrl: U('pizza,octopus'),        price: 11.0, sortOrder: 2 },
      { name: 'Domenike Lontano',   description: 'San Marzano, Mozzarella di Bufala DOP',            imageUrl: U('pizza,bufala'),         price: 11.0, sortOrder: 3 },
      { name: 'Abbraccio e Mamà',   description: 'Salsa pomodoro, Mozzarella Fior di Latte',         imageUrl: U('pizza,margherita'),     price:  8.0, sortOrder: 4 },
      { name: 'Napolitidine',       description: 'Salsa pomodoro, Grana Padano, Prosciutto',         imageUrl: U('pizza,prosciutto'),     price:  9.0, sortOrder: 5 },
      { name: 'Provola e Pepe',     description: 'Kampione e korës - me gjalpë e dorë',              imageUrl: U('pizza,cheese'),         price:  9.0, sortOrder: 6 },
      { name: 'Melanzanella',       description: 'Salsa pomodoro, melanzane, Fior di Latte',         imageUrl: U('pizza,eggplant'),       price:  9.0, sortOrder: 7 },
      { name: 'Stella di Capuano',  description: 'Salsa pomodoro, Fior di latte, proshutë',          imageUrl: U('neapolitan,pizza'),     price:  9.0, sortOrder: 8 },
      { name: 'Bellaria',           description: 'Salsa pomodoro, Fior di latte, domate, proshutë',  imageUrl: U('pizza,tomato'),         price:  9.0, sortOrder: 9 },
      { name: 'La Testitudine',     description: 'Salsa pomodoro, Fior di latte, tonno',             imageUrl: U('pizza,tuna'),           price:  9.0, sortOrder: 10 },
    ]],

    // ── Tradizionale ──
    [tradizionale, [
      { name: 'Marinara',                description: 'Salsa pomodoro San Marzano, aglio, origano',         imageUrl: U('marinara,pizza'),           price:  7.0, sortOrder: 1 },
      { name: 'Margherita',              description: 'Salsa pomodoro, Fior di Latte, basiliko',            imageUrl: U('margherita,pizza'),         price:  7.0, sortOrder: 2 },
      { name: 'Margherita di Bufala',    description: 'Salsa pomodoro, Mozzarella di Bufala DOP',           imageUrl: U('buffalo,pizza'),            price:  9.0, sortOrder: 3 },
      { name: 'Bufala a Filetto',        description: 'Pomodoro Filetto, Mozzarella di Bufala DOP',         imageUrl: U('mozzarella,pizza'),         price: 12.0, sortOrder: 4 },
      { name: 'Napoli',                  description: 'Salsa pomodoro, Fior di latte, açukë, kapere',       imageUrl: U('neapolitan,pizza,anchovies'),price:  8.0, sortOrder: 5 },
      { name: 'Diavola alla Nonno Enzo', description: 'Salsa pomodoro, Fior di Latte, salsiçe djegës',      imageUrl: U('spicy,pizza,sausage'),      price:  9.0, sortOrder: 6 },
      { name: 'Sguardo Alto',            description: 'Salsa pomodoro, Fior di latte, proshutë, kërpudha',  imageUrl: U('pizza,mushroom,ham'),       price: 10.0, sortOrder: 7 },
      { name: 'Salsiccia e Broccoli',    description: 'Salsa pomodoro, Fior di latte, salsiçe, brokoli',    imageUrl: U('pizza,sausage,broccoli'),   price: 10.0, sortOrder: 8 },
    ]],

    // ── Pasta ──
    [pasta, [
      { name: 'Pasta Bolognese',  description: 'Pasta me salcë bolognese',       imageUrl: U('pasta,bolognese'), price: 7.0, sortOrder: 1 },
      { name: 'Pasta Carbonara',  description: 'Pasta, vezë, pancetta, Pecorino',imageUrl: U('carbonara,pasta'), price: 7.0, sortOrder: 2 },
      { name: 'Pasta Fruta Deti', description: 'Pasta me fruta deti',            imageUrl: U('seafood,pasta'),   price: 9.0, sortOrder: 3 },
    ]],

    // ── Calzone Napoletane ──
    [calzone, [
      { name: 'Calzone al Forno',      description: 'Fior di latte, salsiçe, salsa pomodoro',          imageUrl: U('calzone,pizza'),        price: 9.0,  sortOrder: 1 },
      { name: 'Pizza Fritta Completa', description: 'Ricotta, salsiçe, Fior di latte, salsa pomodoro', imageUrl: U('fried,pizza,italian'),  price: 10.0, sortOrder: 2 },
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
