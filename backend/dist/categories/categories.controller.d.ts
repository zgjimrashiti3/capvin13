import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private service;
    constructor(service: CategoriesService);
    findAll(): Promise<import("../entities/category.entity").Category[]>;
    create(dto: CreateCategoryDto): Promise<import("../entities/category.entity").Category>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("../entities/category.entity").Category>;
    remove(id: string): Promise<import("../entities/category.entity").Category>;
    toggle(id: string): Promise<import("../entities/category.entity").Category>;
}
