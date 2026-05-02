import { Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Public } from '@/decorator/customize';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @Post('upload')
    @Public()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './public/images/product',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadFile(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/, skipMagicNumbersValidation: true }),
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }) // 5MB
            ],
        }),
    ) file: Express.Multer.File) {
        return {
            fileName: file.filename
        };
    }
}
