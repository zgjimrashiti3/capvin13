import { Controller, Get, Patch, Body, UseGuards, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private service: SettingsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Get menu display settings (public)' })
  get() {
    return this.service.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Body() dto: UpdateSettingsDto) {
    return this.service.update(dto);
  }
}
