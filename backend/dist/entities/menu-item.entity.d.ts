import { Category } from './category.entity';
export declare const ITEM_SIZES: readonly ["small", "medium", "large"];
export type ItemSize = (typeof ITEM_SIZES)[number];
export type SizePrices = Record<ItemSize, number>;
export type SizeLabels = Record<ItemSize, string>;
export declare const DEFAULT_SIZE_LABELS: SizeLabels;
export declare class MenuItem {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: number;
    hasSizes: boolean;
    sizePrices: SizePrices | null;
    sizeLabels: SizeLabels | null;
    imageUrl: string;
    isAvailable: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    category: Category;
}
