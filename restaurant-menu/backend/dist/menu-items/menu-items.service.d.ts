import { Repository } from 'typeorm';
import { MenuItem } from '../entities/menu-item.entity';
import { Category } from '../entities/category.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuItemsService {
    private repo;
    private categoryRepo;
    constructor(repo: Repository<MenuItem>, categoryRepo: Repository<Category>);
    findByCategoryId(categoryId: string): Promise<MenuItem[]>;
    findAllGrouped(): Promise<{
        items: MenuItem[];
        id: string;
        name: string;
        description: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAll(): Promise<MenuItem[]>;
    findOne(id: string): Promise<MenuItem>;
    create(dto: CreateMenuItemDto): Promise<MenuItem>;
    update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem>;
    remove(id: string): Promise<MenuItem>;
    toggle(id: string): Promise<MenuItem>;
}
