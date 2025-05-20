import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto, BlogTranslationDto } from './blog.dto';
import { Blog } from './entity/blog.entity';
import { BlogTranslation } from './entity/blog-translation.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SUPPORTED_LANGUAGES } from '../../config/languages';
import { Logger } from '@nestjs/common';

@ApiTags('blog')
@Controller()
export class BlogController {
  private readonly logger = new Logger(BlogController.name);

  constructor(private readonly blogService: BlogService) {}

  private validateNumberParam(param: string, paramName: string, i18n: I18nContext): number {
    const num = parseInt(param, 10);
    if (isNaN(num) || num <= 0) {
      this.logger.warn(`Invalid ${paramName}: ${param}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: paramName } }));
    }
    return num;
  }

  private validateStringParam(param: string, paramName: string, i18n: I18nContext): string {
    if (!param || typeof param !== 'string' || param.trim() === '') {
      this.logger.warn(`Invalid ${paramName}: ${param}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_PARAM', { args: { param: paramName } }));
    }
    return param;
  }

  private validatePaginationParams(page: number, limit: number, i18n: I18nContext): { page: number; limit: number } {
    const parsedPage = parseInt(String(page), 10);
    const parsedLimit = parseInt(String(limit), 10);
    if (isNaN(parsedPage) || parsedPage <= 0) {
      this.logger.warn(`Invalid page: ${page}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'page' } }));
    }
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      this.logger.warn(`Invalid limit: ${limit}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'limit' } }));
    }
    return { page: parsedPage, limit: parsedLimit };
  }

  @Post('blog')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog' })
  @ApiResponse({ status: 201, type: Blog })
  async create(@Body() dto: CreateBlogDto, @I18n() i18n: I18nContext): Promise<{ message: string; blog: Blog }> {
    this.logger.log('Creating new blog');
    try {
      const blog = await this.blogService.create(dto);
      return {
        message: i18n.t('global.blog.BLOG_CREATED'),
        blog,
      };
    } catch (error) {
      this.logger.error(`Error creating blog: ${error.message}`, error.stack);
      throw error instanceof BadRequestException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Post('blog/:id/translations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add translation to blog' })
  @ApiResponse({ status: 201, type: BlogTranslation })
  async addTranslation(
    @Param('id') id: string,
    @Body() dto: BlogTranslationDto,
    @I18n() i18n: I18nContext,
  ): Promise<{ message: string; translation: BlogTranslation }> {
    const blogId = this.validateNumberParam(id, 'id', i18n);
    this.logger.log(`Adding translation for blog ${blogId}`);
    try {
      const translation = await this.blogService.addTranslation(blogId, dto);
      return {
        message: i18n.t('global.blog.TRANSLATION_CREATED'),
        translation,
      };
    } catch (error) {
      this.logger.error(`Error adding translation for blog ${blogId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Post('blog/:id/translation')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a translation for a blog' })
  @ApiResponse({ status: 201, type: Blog })
  async addOrUpdateTranslation(
    @Param('id') id: string,
    @Body() translationDto: BlogTranslationDto,
    @I18n() i18n: I18nContext
  ): Promise<Blog> {
    const blogId = this.validateNumberParam(id, 'id', i18n);
    this.validateStringParam(translationDto.language, 'language', i18n);
    try {
      return await this.blogService.addOrUpdateTranslation(blogId, translationDto);
    } catch (error) {
      this.logger.error(`Error adding/updating translation for blog ${blogId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Delete('translations/:id/:language')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog translation by blog ID and language' })
  @ApiResponse({ status: 200 })
  async removeTranslationByLanguage(
    @Param('id') id: string,
    @Param('language') language: string,
    @I18n() i18n: I18nContext,
  ): Promise<{ message: string }> {
    const blogId = this.validateNumberParam(id, 'blogId', i18n);
    this.validateStringParam(language, 'language', i18n);
    this.logger.log(`Removing translation for language ${language} in blog ${blogId}`);
    try {
      await this.blogService.removeTranslationByLanguage(blogId, language);
      return { message: i18n.t('global.blog.TRANSLATION_DELETED', { args: { lang: language } }) };
    } catch (error) {
      this.logger.error(`Error removing translation for language ${language} in blog ${blogId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('blog/sitemap')
  @ApiOperation({ summary: 'Get sitemap for SEO' })
  @ApiResponse({ status: 200 })
  async getSitemap(@Query('lang') lang: string = 'en', @I18n() i18n: I18nContext): Promise<{ urls: string[]; message: string }> {
    this.logger.log(`Fetching sitemap for language ${lang}`);
    try {
      const sitemap = await this.blogService.getSitemap(lang);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching sitemap for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('blog')
  @ApiOperation({ summary: 'Get all blogs' })
  @ApiResponse({ status: 200 })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @I18n() i18n: I18nContext,
  ): Promise<{ blogs: Blog[]; total: number }> {
    this.logger.log(`Fetching blogs: page=${page}, limit=${limit}`);
    try {
      const { page: validatedPage, limit: validatedLimit } = this.validatePaginationParams(page, limit, i18n);
      return await this.blogService.findAll(validatedPage, validatedLimit);
    } catch (error) {
      this.logger.error(`Error fetching blogs: ${error.message}`, error.stack);
      throw error instanceof BadRequestException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('blog/:id')
  @ApiOperation({ summary: 'Get blog by ID' })
  @ApiResponse({ status: 200, type: Blog })
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<Blog> {
    const blogId = this.validateNumberParam(id, 'id', i18n);
    this.logger.log(`Fetching blog ${blogId}`);
    try {
      return await this.blogService.findOne(blogId);
    } catch (error) {
      this.logger.error(`Error fetching blog ${blogId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get(':lang/blog/:slug')
  @ApiOperation({ summary: 'Get blog by slug and language' })
  @ApiResponse({ status: 200, type: Blog })
  async findBySlugAndLang(
    @Param('lang') lang: string,
    @Param('slug') slug: string,
    @I18n() i18n: I18nContext,
  ): Promise<Blog> {
    this.validateStringParam(slug, 'slug', i18n);
    this.logger.log(`Fetching blog with slug ${slug} for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } }),
      );
    }
    try {
      return await this.blogService.findBySlug(slug, lang);
    } catch (error) {
      this.logger.error(`Error fetching blog with slug ${slug} for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Put('blog/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog' })
  @ApiResponse({ status: 200, type: Blog })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @I18n() i18n: I18nContext,
  ): Promise<Blog> {
    const blogId = this.validateNumberParam(id, 'id', i18n);
    this.logger.log(`Updating blog ${blogId}`);
    try {
      return await this.blogService.update(blogId, dto);
    } catch (error) {
      this.logger.error(`Error updating blog ${blogId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Delete('blog/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<void> {
    const blogId = this.validateNumberParam(id, 'id', i18n);
    this.logger.log(`Deleting blog ${blogId}`);
    try {
      await this.blogService.remove(blogId);
    } catch (error) {
      this.logger.error(`Error deleting blog ${blogId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}