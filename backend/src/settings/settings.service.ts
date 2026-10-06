import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from '../entities/app-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTINGS_ID = 1;

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettings)
    private repo: Repository<AppSettings>,
  ) {}

  // Creates the row with defaults (photos ON) the first time it is read.
  async get() {
    const existing = await this.repo.findOne({ where: { id: SETTINGS_ID } });
    if (existing) return existing;
    await this.repo.upsert({ id: SETTINGS_ID }, ['id']);
    return this.repo.findOneOrFail({ where: { id: SETTINGS_ID } });
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.get();
    Object.assign(settings, dto);
    return this.repo.save(settings);
  }
}
