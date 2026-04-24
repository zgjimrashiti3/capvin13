import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../entities/menu-item.entity';
import { Category } from '../entities/category.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private repo: Repository<MenuItem>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  findByCategoryId(categoryId: string) {
    return this.repo.find({
      where: { categoryId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findAllGrouped() {
    const categories = await this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    const result = await Promise.all(
      categories.map(async (cat) => {
        const items = await this.repo.find({
          where: { categoryId: cat.id },
          order: { sortOrder: 'ASC', createdAt: 'ASC' },
        });
        return { ...cat, items };
      }),
    );

    return result;
  }

  findAll() {
    return this.repo.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
      relations: ['category'],
    });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async create(dto: CreateMenuItemDto) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    return this.repo.remove(item);
  }

  async toggle(id: string) {
    const item = await this.findOne(id);
    item.isAvailable = !item.isAvailable;
    return this.repo.save(item);
  }
}
