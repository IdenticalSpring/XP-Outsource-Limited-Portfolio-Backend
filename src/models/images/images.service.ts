// backend/src/models/images/images.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImagesService {
  private readonly publicImagesPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'public',
    'images',
  );
  private readonly baseUrl = process.env.DOMAIN + '/images';

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ filename: string; url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    await fs.mkdir(this.publicImagesPath, { recursive: true });
    const filename = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(this.publicImagesPath, filename);
    await fs.writeFile(filePath, file.buffer);

    return {
      filename,
      url: `${this.baseUrl}/${filename}`,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filename?: string,
  ): Promise<{ data: { filename: string; url: string }[]; total: number }> {
    try {
      let files = await fs.readdir(this.publicImagesPath);

      if (filename) {
        const searchTerm = filename.toLowerCase();
        files = files.filter((file) => file.toLowerCase().includes(searchTerm));
      }

      const total = files.length;

      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedFiles = files.slice(start, end);

      const data = paginatedFiles.map((filename) => ({
        filename,
        url: `${this.baseUrl}/${filename}`,
      }));

      return { data, total };
    } catch (error) {
      return { data: [], total: 0 };
    }
  }

  async delete(filename: string): Promise<void> {
    const filePath = path.join(this.publicImagesPath, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new BadRequestException('Image not found');
    }
  }
}
