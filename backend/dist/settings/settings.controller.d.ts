import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
export declare class SettingsController {
    private service;
    constructor(service: SettingsService);
    get(): Promise<import("../entities/app-settings.entity").AppSettings>;
    update(dto: UpdateSettingsDto): Promise<import("../entities/app-settings.entity").AppSettings>;
}
