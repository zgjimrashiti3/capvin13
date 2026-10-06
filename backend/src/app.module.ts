import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { UploadModule } from './upload/upload.module';
import { OrdersModule } from './orders/orders.module';
import { SettingsModule } from './settings/settings.module';
import { Category } from './entities/category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { User } from './entities/user.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { AppSettings } from './entities/app-settings.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [Category, MenuItem, User, Order, OrderItem, AppSettings],
        synchronize: true,
        ssl:
          config.get('DATABASE_URL')?.includes('localhost') ||
          config.get('DATABASE_URL')?.includes('@db:')
            ? false
            : { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    CategoriesModule,
    MenuItemsModule,
    UploadModule,
    OrdersModule,
    SettingsModule,
  ],
})
export class AppModule {}
