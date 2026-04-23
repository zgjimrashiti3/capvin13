import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    login(username: string, password: string): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
        };
    }>;
    findById(id: string): Promise<User>;
}
