import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  showImages?: boolean;
}
