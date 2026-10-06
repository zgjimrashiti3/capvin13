import { Type } from 'class-transformer';
import {
  IsInt,
  IsArray,
  IsIn,
  IsUUID,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { ITEM_SIZES, ItemSize } from '../../entities/menu-item.entity';

export class OrderItemDto {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;

  // Required for items with sizes, ignored for single-price items.
  @IsOptional()
  @IsIn(ITEM_SIZES)
  size?: ItemSize;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  tableNumber: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
