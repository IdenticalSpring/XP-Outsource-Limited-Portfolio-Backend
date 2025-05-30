import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from 'nestjs-cloudinary';

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url?: string;
  asset_id?: string;
  format?: string;
}

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  url?: string;
  format?: string;
  created_at?: string;
  width?: number;
  height?: number;
}

interface CloudinaryResourcesResult {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count?: number;
}

interface UploadImageResult {
  filename: string;
  url: string;
  publicId: string;
}

@Injectable()
export class ImagesService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadImageResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const result = await this.cloudinaryService.uploadFile(file, {
      folder: 'portfolio', 
    }) as CloudinaryUploadResult;

    const parts = result.public_id.split('/');
    const filename = parts[parts.length - 1];
    return {
      filename: filename,
      url: result.secure_url,
      publicId: result.public_id, 
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filename?: string,
  ): Promise<{ data: { filename: string; url: string; publicId: string }[]; total: number }> {
    try {
      const result = await this.getAllImagesFromFolder('portfolio', { 
        max_results: filename ? 500 : limit * 2,
      }) as CloudinaryResourcesResult;
      
      let resources = result.resources || [];
      if (filename) {
        const searchTerm = filename.toLowerCase();
        resources = resources.filter(resource => {
          const parts = resource.public_id.split('/');
          const name = parts[parts.length - 1].toLowerCase();
          return name.includes(searchTerm);
        });
      }

      const total = resources.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedResources = resources.slice(start, end);

      const data = paginatedResources.map(resource => {
        const parts = resource.public_id.split('/');
        const filename = parts[parts.length - 1];
        
        return {
          filename,
          url: resource.secure_url || resource.url,
          publicId: resource.public_id,
        };
      });

      return { data, total };
    } catch (error) {
      return { data: [], total: 0 };
    }
  }

  async delete(publicId: string): Promise<void> {
    try {
      await this.deleteImage(publicId);
    } catch (error) {
      throw new BadRequestException('Image not found');
    }
  }

  async deleteImage(publicId: string) {
    return new Promise((resolve, reject) => {
      this.cloudinaryService.cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
    });
  }

  async getAllImagesFromFolder(folder: string = 'portfolio', options: any = {}): Promise<CloudinaryResourcesResult> {
    return new Promise((resolve, reject) => {
      this.cloudinaryService.cloudinary.api.resources(
        {
          type: 'upload',
          prefix: folder,
          max_results: options.max_results || 100,
          ...options
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result as CloudinaryResourcesResult);
        }
      );
    });
  }
}
