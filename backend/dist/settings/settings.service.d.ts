import { Repository } from 'typeorm';
import { AppSettings } from '../entities/app-settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsService {
    private repo;
    constructor(repo: Repository<AppSettings>);
    get(): Promise<AppSettings>;
    update(dto: UpdateSettingsDto): Promise<AppSettings>;
}
