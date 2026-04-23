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

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);
  const itemRepo = AppDataSource.getRepository(MenuItem);

  // Clear existing data
  await AppDataSource.query('TRUNCATE menu_items, categories, users RESTART IDENTITY CASCADE');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = userRepo.create({ username: 'admin', passwordHash });
  await userRepo.save(admin);
  console.log('Created admin user');

  // Create categories
  const categories = await categoryRepo.save([
    { name: 'Starters', description: 'Light bites to begin your meal', sortOrder: 1 },
    { name: 'Main Course', description: 'Hearty and satisfying main dishes', sortOrder: 2 },
    { name: 'Desserts', description: 'Sweet endings to your meal', sortOrder: 3 },
    { name: 'Drinks', description: 'Refreshing beverages', sortOrder: 4 },
  ]);
  console.log('Created categories');

  const [starters, mains, desserts, drinks] = categories;

  // Create menu items
  await itemRepo.save([
    // Starters
    {
      categoryId: starters.id,
      name: 'Bruschetta al Pomodoro',
      description: 'Toasted bread topped with fresh tomatoes, basil, and extra virgin olive oil',
      price: 8.50,
      sortOrder: 1,
    },
    {
      categoryId: starters.id,
      name: 'Soup of the Day',
      description: 'Ask your server for today\'s freshly made soup, served with crusty bread',
      price: 6.00,
      sortOrder: 2,
    },
    {
      categoryId: starters.id,
      name: 'Crispy Calamari',
      description: 'Lightly battered squid rings with marinara sauce and lemon wedge',
      price: 11.00,
      sortOrder: 3,
    },
    {
      categoryId: starters.id,
      name: 'Caesar Salad',
      description: 'Romaine lettuce, croutons, parmesan, and classic Caesar dressing',
      price: 9.50,
      sortOrder: 4,
    },
    // Main Course
    {
      categoryId: mains.id,
      name: 'Grilled Salmon',
      description: 'Atlantic salmon fillet with lemon butter sauce, seasonal vegetables and rice',
      price: 22.00,
      sortOrder: 1,
    },
    {
      categoryId: mains.id,
      name: 'Beef Ribeye Steak',
      description: '300g prime ribeye grilled to your liking with fries and peppercorn sauce',
      price: 32.00,
      sortOrder: 2,
    },
    {
      categoryId: mains.id,
      name: 'Mushroom Risotto',
      description: 'Creamy arborio rice with wild mushrooms, truffle oil and aged parmesan',
      price: 16.50,
      sortOrder: 3,
    },
    {
      categoryId: mains.id,
      name: 'Chicken Parmigiana',
      description: 'Breaded chicken breast topped with marinara sauce and melted mozzarella',
      price: 18.00,
      sortOrder: 4,
    },
    // Desserts
    {
      categoryId: desserts.id,
      name: 'Tiramisu',
      description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone cream',
      price: 7.50,
      sortOrder: 1,
    },
    {
      categoryId: desserts.id,
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
      price: 8.00,
      sortOrder: 2,
    },
    {
      categoryId: desserts.id,
      name: 'Crème Brûlée',
      description: 'Silky vanilla custard with a perfectly caramelized sugar crust',
      price: 7.00,
      sortOrder: 3,
    },
    // Drinks
    {
      categoryId: drinks.id,
      name: 'Fresh Lemonade',
      description: 'Freshly squeezed lemonade with mint and a hint of ginger',
      price: 4.50,
      sortOrder: 1,
    },
    {
      categoryId: drinks.id,
      name: 'House Red Wine',
      description: 'Smooth medium-bodied red wine, glass or bottle available',
      price: 7.00,
      sortOrder: 2,
    },
    {
      categoryId: drinks.id,
      name: 'Sparkling Water',
      description: '750ml bottle of premium sparkling mineral water',
      price: 3.00,
      sortOrder: 3,
    },
    {
      categoryId: drinks.id,
      name: 'Espresso',
      description: 'Rich, full-bodied single or double shot of freshly ground espresso',
      price: 3.50,
      sortOrder: 4,
    },
  ]);
  console.log('Created menu items');

  await AppDataSource.destroy();
  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
