import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
  constructor() {
    const uploadPath = join(process.cwd(), 'public', 'images', 'product');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
      console.log('Created upload directory:', uploadPath);
    }
  }
}
