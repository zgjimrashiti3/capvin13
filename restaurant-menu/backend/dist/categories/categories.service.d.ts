import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private repo;
    constructor(repo: Repository<Category>);
    findAll(): Promise<Category[]>;
    findActive(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    create(dto: CreateCategoryDto): Promise<Category>;
    update(id: string, dto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<Category>;
    toggle(id: string): Promise<Category>;
}
