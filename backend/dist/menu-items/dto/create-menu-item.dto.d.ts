export declare class SizePricesDto {
    small: number;
    medium: number;
    large: number;
}
export declare class SizeLabelsDto {
    small: string;
    medium: string;
    large: string;
}
export declare class CreateMenuItemDto {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    hasSizes?: boolean;
    sizePrices?: SizePricesDto | null;
    sizeLabels?: SizeLabelsDto | null;
    imageUrl?: string;
    isAvailable?: boolean;
    sortOrder?: number;
}
