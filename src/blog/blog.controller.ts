import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { Blog } from './blog.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog' })
  @ApiResponse({ status: 201, type: Blog })
  async create(@Body() dto: CreateBlogDto, @I18n() i18n: I18nContext): Promise<{ message: string; blog: Blog }> {
    console.log(`Language from I18nContext: ${i18n.lang}`); // Debug ngôn ngữ
    const blog = await this.blogService.create(dto);
    return {
      message: i18n.t('global.BLOG_CREATED'),
      blog,
    };
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
  async getSitemap(@Query('lang') lang: string = 'en'): Promise<{ urls: string[] }> {
    const blogs = await this.blogService.findAll();
    const urls = blogs.map(blog => `https://yourdomain.com/${lang}/blog/${blog.slug}`);
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