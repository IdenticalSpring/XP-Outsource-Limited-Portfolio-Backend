import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { Blog } from './blog.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog' })
  @ApiResponse({ status: 201, type: Blog })
  create(@Body() dto: CreateBlogDto): Promise<Blog> {
    return this.blogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs' })
  @ApiResponse({ status: 200, type: [Blog] })
  findAll(): Promise<Blog[]> {
    return this.blogService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog by ID' })
  @ApiResponse({ status: 200, type: Blog })
  findOne(@Param('id') id: string): Promise<Blog> {
    return this.blogService.findOne(+id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get blog by slug' })
  @ApiResponse({ status: 200, type: Blog })
  findBySlug(@Param('slug') slug: string): Promise<Blog> {
    return this.blogService.findBySlug(slug);
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Get sitemap for SEO' })
  @ApiResponse({ status: 200 })
  async getSitemap(): Promise<{ urls: string[] }> {
    const blogs = await this.blogService.findAll();
    const urls = blogs.map(blog => `https://yourdomain.com/blog/${blog.slug}`);
    return { urls };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog' })
  @ApiResponse({ status: 200, type: Blog })
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto): Promise<Blog> {
    return this.blogService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.blogService.remove(+id);
  }
}