import { Controller, Post, Get, Delete, Param, UseInterceptors, UploadedFile, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { ApiTags, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)/)) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, 
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{ filename: string; url: string }> {
    return this.imagesService.uploadImage(file);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'filename', required: false, type: String })
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('filename') filename: string,
  ): Promise<{ data: { filename: string; url: string }[]; total: number }> {
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    if (parsedPage < 1 || parsedLimit < 1) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    return this.imagesService.findAll(parsedPage, parsedLimit, filename);
  }

  @Delete(':publicId')
  async delete(@Param('publicId') publicId: string): Promise<void> {
    return this.imagesService.delete(publicId);
  }
}