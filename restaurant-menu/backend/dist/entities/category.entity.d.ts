import { MenuItem } from './menu-item.entity';
export declare class Category {
    id: string;
    name: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    items: MenuItem[];
}
