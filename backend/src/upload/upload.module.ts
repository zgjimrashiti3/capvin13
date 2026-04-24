import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadController } from './upload.controller';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        storage: diskStorage({
          destination: config.get('UPLOAD_DEST', './uploads'),
          filename: (_req, file, cb) => {
            cb(null, `${uuidv4()}${extname(file.originalname)}`);
          },
        }),
        fileFilter: (_req, file, cb) => {
          const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
          cb(null, allowed.test(file.originalname));
        },
        limits: { fileSize: 5 * 1024 * 1024 },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
