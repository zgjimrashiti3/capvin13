import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SizePricesDto {
  @ApiProperty({ example: 1.2 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  small: number;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  medium: number;

  @ApiProperty({ example: 1.8 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  large: number;
}

export class SizeLabelsDto {
  @ApiProperty({ example: 'E shkurtër' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  small: string;

  @ApiProperty({ example: 'E mesme' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  medium: string;

  @ApiProperty({ example: 'E gjatë' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  large: string;
}

export class CreateMenuItemDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'Caesar Salad' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  // Not required for items with sizes: it is derived from sizePrices.
  @ApiProperty({ example: 12.99 })
  @ValidateIf((o) => !o.hasSizes || o.price !== undefined)
  @IsNumber()
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  hasSizes?: boolean;

  @ApiPropertyOptional({ type: SizePricesDto })
  @ValidateIf((o) => o.hasSizes || o.sizePrices != null)
  @ValidateNested()
  @Type(() => SizePricesDto)
  sizePrices?: SizePricesDto | null;

  @ApiPropertyOptional({ type: SizeLabelsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SizeLabelsDto)
  sizeLabels?: SizeLabelsDto | null;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
