import { Module, BadRequestException } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadController } from './upload.controller';

// Only formats browsers can render in an <img> tag — HEIC/HEIF (common iPhone
// camera default) can't be displayed, so it's rejected with a clear message
// below rather than accepted and silently broken on the menu page.
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|jfif|png|gif|webp|bmp)$/i;

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
          if (!ALLOWED_EXTENSIONS.test(file.originalname)) {
            cb(new BadRequestException('Lloji i skedarit nuk mbështetet. Përdorni JPG, JFIF, PNG, GIF, WEBP ose BMP. Nëse e keni bërë foton me iPhone, ndrysho formatin te Cilësimet > Kamera > Formatet në "Më i Përputhshëm".'), false);
            return;
          }
          cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
