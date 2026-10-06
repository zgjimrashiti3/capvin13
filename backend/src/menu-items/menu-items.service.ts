import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem, ITEM_SIZES } from '../entities/menu-item.entity';
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
    const item = this.repo.create({
      ...dto,
      sizePrices: dto.sizePrices ? { ...dto.sizePrices } : null,
      sizeLabels: dto.sizeLabels ? { ...dto.sizeLabels } : null,
    });
    this.applySizes(item);
    return this.repo.save(item);
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    if (dto.sizePrices) item.sizePrices = { ...dto.sizePrices };
    if (dto.sizeLabels) item.sizeLabels = { ...dto.sizeLabels };
    this.applySizes(item);
    return this.repo.save(item);
  }

  // Sized items need a price per size; `price` mirrors the lowest one so
  // anything reading the plain price still gets a sensible "from" value.
  private applySizes(item: MenuItem) {
    if (!item.hasSizes) {
      if (item.price == null) throw new BadRequestException('Çmimi është i detyrueshëm.');
      return;
    }
    if (!item.sizePrices) {
      throw new BadRequestException('Çmimet për madhësitë janë të detyrueshme.');
    }
    item.price = Math.min(...ITEM_SIZES.map((s) => Number(item.sizePrices![s])));
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
