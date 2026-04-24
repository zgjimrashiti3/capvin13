import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
export declare class MenuItemsController {
    private service;
    constructor(service: MenuItemsService);
    findAll(categoryId?: string): Promise<import("../entities/menu-item.entity").MenuItem[]>;
    findAllGrouped(): Promise<{
        items: import("../entities/menu-item.entity").MenuItem[];
        id: string;
        name: string;
        description: string;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(dto: CreateMenuItemDto): Promise<import("../entities/menu-item.entity").MenuItem>;
    update(id: string, dto: UpdateMenuItemDto): Promise<import("../entities/menu-item.entity").MenuItem>;
    remove(id: string): Promise<import("../entities/menu-item.entity").MenuItem>;
    toggle(id: string): Promise<import("../entities/menu-item.entity").MenuItem>;
}
