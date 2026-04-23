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

  // 6 categories
  const cats = await categoryRepo.save([
    { name: 'Kafe',              description: null,                 sortOrder: 1 },
    { name: 'Pije',              description: null,                 sortOrder: 2 },
    { name: 'Antipasti',         description: 'Për 3 breza',        sortOrder: 3 },
    { name: 'Pica Innovative',   description: 'Pica Innovative',    sortOrder: 4 },
    { name: 'Pica Tradizionale', description: 'Pica Tradizionale',  sortOrder: 5 },
    { name: 'Pasta & Calzone',   description: null,                 sortOrder: 6 },
  ]);
  const [kafe, pije, antipasti, innovative, tradizionale, pastaCalzone] = cats;
  console.log('Created 6 categories');

  // Reusable URL constants
  const IMG = {
    espresso:        'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800',
    macchiato:       'https://images.unsplash.com/photo-1485808191679-5f86510bd652?w=800',
    cappuccino:      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800',
    frappe:          'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800',
    iceCoffee:       'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800',
    tea:             'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800',
    water:           'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    cola:            'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
    fanta:           'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800',
    redBull:         'https://images.unsplash.com/photo-1620353591650-8e58b7a4acf7?w=800',
    freshJuice:      'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
    lemonade:        'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=800',
    beer:            'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800',
    juiceBottle:     'https://images.unsplash.com/photo-1534353341699-5a88e8842a0e?w=800',
    bruschetta:      'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800',
    croquettes:      'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=800',
    appetizer:       'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800',
    mozzarella:      'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800',
    caprese:         'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800',
    greenSalad:      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    mixedSalad:      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    margherita:      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    marinara:        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    spicyPizza:      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
    prosciuttoPizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    mushroomPizza:   'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?w=800',
    cheesePizza:     'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800',
    neapolitanPizza: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800',
    bufalaPizza:     'https://images.unsplash.com/photo-1604917877934-07d58d7ac5fe?w=800',
    bolognese:       'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800',
    carbonara:       'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800',
    seafoodPasta:    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
    calzone:         'https://images.unsplash.com/photo-1548369937-47519962c11a?w=800',
    friedPizza:      'https://images.unsplash.com/photo-1595854341625-f33ee10dbf9f?w=800',
  };

  const itemsByCat: Array<[Category, ItemDef[]]> = [

    // ── Kafe ──
    [kafe, [
      { name: 'Espresso',          imageUrl: IMG.espresso,   price: 1.2, sortOrder: 1 },
      { name: 'Macchiato e Vogël', imageUrl: IMG.macchiato,  price: 1.2, sortOrder: 2 },
      { name: 'Macchiato pa Plum', imageUrl: IMG.macchiato,  price: 1.2, sortOrder: 3 },
      { name: 'Macchiato e Madhe', imageUrl: IMG.macchiato,  price: 1.5, sortOrder: 4 },
      { name: 'Cappuccino',        imageUrl: IMG.cappuccino, price: 1.5, sortOrder: 5 },
      { name: 'Illy Crema',        imageUrl: IMG.espresso,   price: 1.5, sortOrder: 6 },
      { name: 'Frappe',            imageUrl: IMG.frappe,     price: 1.5, sortOrder: 7 },
      { name: 'Ice Coffee',        imageUrl: IMG.iceCoffee,  price: 1.5, sortOrder: 8 },
      { name: 'Cajrat',            imageUrl: IMG.tea,        price: 1.2, sortOrder: 9 },
    ]],

    // ── Pije ──
    [pije, [
      { name: 'Ujë Rugove Glass 0.25l',           imageUrl: IMG.water,       price: 1.2, sortOrder: 1  },
      { name: 'Ujë Rugove Glass 0.75l',           imageUrl: IMG.water,       price: 1.5, sortOrder: 2  },
      { name: 'Ujë Rugove Glass 0.75l (premium)', imageUrl: IMG.water,       price: 2.5, sortOrder: 3  },
      { name: 'Acqua Panna 0.25l',                imageUrl: IMG.water,       price: 1.5, sortOrder: 4  },
      { name: 'Santal Mollë 0.2l',                imageUrl: IMG.juiceBottle, price: 1.5, sortOrder: 5  },
      { name: 'San Pellegrino 0.25l',             imageUrl: IMG.water,       price: 1.5, sortOrder: 6  },
      { name: 'San Pellegrino 0.75l',             imageUrl: IMG.water,       price: 3.0, sortOrder: 7  },
      { name: 'Coca Cola 0.25l',                  imageUrl: IMG.cola,        price: 1.5, sortOrder: 8  },
      { name: 'Coca Cola Zero 0.25l',             imageUrl: IMG.cola,        price: 1.5, sortOrder: 9  },
      { name: 'Fanta 0.25l',                      imageUrl: IMG.fanta,       price: 1.5, sortOrder: 10 },
      { name: 'Santal Boronicë 0.2l',             imageUrl: IMG.juiceBottle, price: 1.5, sortOrder: 11 },
      { name: 'Santal Mollë 0.2l',                imageUrl: IMG.juiceBottle, price: 1.5, sortOrder: 12 },
      { name: 'Santal Pjeshkë 0.2l',              imageUrl: IMG.juiceBottle, price: 1.5, sortOrder: 13 },
      { name: 'Santal Vishnje 0.2l',              imageUrl: IMG.juiceBottle, price: 1.5, sortOrder: 14 },
      { name: 'Santal ACE Multi 0.25l',           imageUrl: IMG.juiceBottle, price: 1.5, sortOrder: 15 },
      { name: 'Fructal dredhëza 0.2l',            imageUrl: IMG.juiceBottle, price: 1.5, sortOrder: 16 },
      { name: 'Fresh Juice',                      imageUrl: IMG.freshJuice,  price: 3.0, sortOrder: 17 },
      { name: 'Red Bull',                         imageUrl: IMG.redBull,     price: 3.0, sortOrder: 18 },
      { name: 'Rose Lemonade',                    imageUrl: IMG.lemonade,    price: 3.0, sortOrder: 19 },
      { name: 'Birra 0%',                         imageUrl: IMG.beer,        price: 1.5, sortOrder: 20 },
      { name: 'Scheppes Bitter Lemon 0.25l',      imageUrl: IMG.lemonade,    price: 1.5, sortOrder: 21 },
      { name: 'Scheppes Tonic Water 0.25l',       imageUrl: IMG.water,       price: 1.5, sortOrder: 22 },
    ]],

    // ── Antipasti (Picabërës + Mozzarella di Bufala + Sallatat) ──
    [antipasti, [
      // ex-Picabërës
      { name: 'Frittatina Napoletane', description: 'Frittatina tradicionale napoletane', imageUrl: IMG.appetizer,  price: 2.5, sortOrder: 1  },
      { name: 'Montanar al Ragu',      description: 'Montanar me ragu',                  imageUrl: IMG.appetizer,  price: 2.5, sortOrder: 2  },
      { name: 'Tris di Montanare',     description: '3 copë montanare të ndryshme',      imageUrl: IMG.appetizer,  price: 7.0, sortOrder: 3  },
      { name: 'Kroket Pataten',        description: 'Kroket me patate',                  imageUrl: IMG.croquettes, price: 2.5, sortOrder: 4  },
      { name: 'Brusketa me Domate',    description: 'Brusketa me domate të freskëta',    imageUrl: IMG.bruschetta, price: 2.5, sortOrder: 5  },
      // ex-Mozzarella di Bufala
      { name: 'Mozzarella di Bufala DOP', description: 'Mozzarella e importuar DOP',   imageUrl: IMG.mozzarella, price: 10.0, sortOrder: 6  },
      { name: 'Mozzallerone',             description: 'Specialitet i shtëpisë',        imageUrl: IMG.mozzarella, price: 21.0, sortOrder: 7  },
      { name: 'Pollastrella',                                                            imageUrl: IMG.mozzarella, price: 13.0, sortOrder: 8  },
      { name: 'Caprese',                  description: 'Mozzarella Bufala DOP, domate', imageUrl: IMG.caprese,    price: 12.0, sortOrder: 9  },
      { name: 'Paestum',                  description: 'Mozzarella Bufala DOP djathë',  imageUrl: IMG.mozzarella, price: 13.0, sortOrder: 10 },
      // ex-Sallatat
      { name: 'Sallata e Gjelbër', imageUrl: IMG.greenSalad, price: 5.0, sortOrder: 11 },
      { name: 'Sallata Miks',      imageUrl: IMG.mixedSalad, price: 6.0, sortOrder: 12 },
    ]],

    // ── Pica Innovative ──
    [innovative, [
      { name: 'Centro Calabria',   description: 'Provola affumicata, salsiçe e djegës',            imageUrl: IMG.spicyPizza,      price: 12.0, sortOrder: 1  },
      { name: 'Don Vincenzo',      description: 'Pan polpo, açuka Pecorino Romano',                imageUrl: IMG.neapolitanPizza, price: 11.0, sortOrder: 2  },
      { name: 'Domenike Lontano',  description: 'San Marzano, Mozzarella di Bufala DOP',           imageUrl: IMG.bufalaPizza,     price: 11.0, sortOrder: 3  },
      { name: 'Abbraccio e Mamà',  description: 'Salsa pomodoro, Mozzarella Fior di Latte',        imageUrl: IMG.margherita,      price:  8.0, sortOrder: 4  },
      { name: 'Napolitidine',      description: 'Salsa pomodoro, Grana Padano, Prosciutto',        imageUrl: IMG.prosciuttoPizza, price:  9.0, sortOrder: 5  },
      { name: 'Provola e Pepe',    description: 'Kampione e korës - me gjalpë e dorë',             imageUrl: IMG.cheesePizza,     price:  9.0, sortOrder: 6  },
      { name: 'Melanzanella',      description: 'Salsa pomodoro, melanzane, Fior di Latte',        imageUrl: IMG.margherita,      price:  9.0, sortOrder: 7  },
      { name: 'Stella di Capuano', description: 'Salsa pomodoro, Fior di latte, proshutë',         imageUrl: IMG.neapolitanPizza, price:  9.0, sortOrder: 8  },
      { name: 'Bellaria',          description: 'Salsa pomodoro, Fior di latte, domate, proshutë', imageUrl: IMG.prosciuttoPizza, price:  9.0, sortOrder: 9  },
      { name: 'La Testitudine',    description: 'Salsa pomodoro, Fior di latte, tonno',            imageUrl: IMG.margherita,      price:  9.0, sortOrder: 10 },
    ]],

    // ── Pica Tradizionale ──
    [tradizionale, [
      { name: 'Marinara',                description: 'Salsa pomodoro San Marzano, aglio, origano',        imageUrl: IMG.marinara,        price:  7.0, sortOrder: 1 },
      { name: 'Margherita',              description: 'Salsa pomodoro, Fior di Latte, basiliko',           imageUrl: IMG.margherita,      price:  7.0, sortOrder: 2 },
      { name: 'Margherita di Bufala',    description: 'Salsa pomodoro, Mozzarella di Bufala DOP',          imageUrl: IMG.bufalaPizza,     price:  9.0, sortOrder: 3 },
      { name: 'Bufala a Filetto',        description: 'Pomodoro Filetto, Mozzarella di Bufala DOP',        imageUrl: IMG.bufalaPizza,     price: 12.0, sortOrder: 4 },
      { name: 'Napoli',                  description: 'Salsa pomodoro, Fior di latte, açukë, kapere',      imageUrl: IMG.neapolitanPizza, price:  8.0, sortOrder: 5 },
      { name: 'Diavola alla Nonno Enzo', description: 'Salsa pomodoro, Fior di Latte, salsiçe djegës',     imageUrl: IMG.spicyPizza,      price:  9.0, sortOrder: 6 },
      { name: 'Sguardo Alto',            description: 'Salsa pomodoro, Fior di latte, proshutë, kërpudha', imageUrl: IMG.mushroomPizza,   price: 10.0, sortOrder: 7 },
      { name: 'Salsiccia e Broccoli',    description: 'Salsa pomodoro, Fior di latte, salsiçe, brokoli',   imageUrl: IMG.mushroomPizza,   price: 10.0, sortOrder: 8 },
    ]],

    // ── Pasta & Calzone (Pasta + Calzone Napoletane) ──
    [pastaCalzone, [
      // ex-Pasta
      { name: 'Pasta Bolognese',       description: 'Pasta me salcë bolognese',        imageUrl: IMG.bolognese,    price: 7.0,  sortOrder: 1 },
      { name: 'Pasta Carbonara',       description: 'Pasta, vezë, pancetta, Pecorino', imageUrl: IMG.carbonara,    price: 7.0,  sortOrder: 2 },
      { name: 'Pasta Fruta Deti',      description: 'Pasta me fruta deti',             imageUrl: IMG.seafoodPasta, price: 9.0,  sortOrder: 3 },
      // ex-Calzone Napoletane
      { name: 'Calzone al Forno',      description: 'Fior di latte, salsiçe, salsa pomodoro',          imageUrl: IMG.calzone,    price: 9.0,  sortOrder: 4 },
      { name: 'Pizza Fritta Completa', description: 'Ricotta, salsiçe, Fior di latte, salsa pomodoro', imageUrl: IMG.friedPizza,  price: 10.0, sortOrder: 5 },
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
