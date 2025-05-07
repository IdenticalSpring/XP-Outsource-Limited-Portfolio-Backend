import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './banner.dto';
import { Banner } from './entity/banner.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SUPPORTED_LANGUAGES } from '../../config/languages';
import { Logger } from '@nestjs/common';

@ApiTags('banner')
@Controller()
export class BannerController {
  private readonly logger = new Logger(BannerController.name);

  constructor(private readonly bannerService: BannerService) {}

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

  @Post('banner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create banner' })
  @ApiResponse({ status: 201, type: Banner })
  async create(@Body() dto: CreateBannerDto, @I18n() i18n: I18nContext): Promise<{ message: string; banner: Banner }> {
    this.logger.log('Creating new banner');
    try {
      const banner = await this.bannerService.create(dto);
      return {
        message: i18n.t('banner.BANNER_CREATED'),
        banner,
      };
    } catch (error) {
      this.logger.error(`Error creating banner: ${error.message}`, error.stack);
      throw error instanceof BadRequestException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get("banner")
  @ApiOperation({ summary: 'Get all banners' })
  @ApiResponse({ status: 200, type: [Banner] })
  async findAll(): Promise<Banner[]> {
    return this.bannerService.findAll();
  }


  @Get('banner/:id')
  @ApiOperation({ summary: 'Get banner by ID' })
  @ApiResponse({ status: 200, type: Banner })
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<Banner> {
    const bannerId = this.validateNumberParam(id, 'id', i18n);
    try {
      return await this.bannerService.findOne(bannerId);
    } catch (error) {
      this.logger.error(`Error fetching banner ${bannerId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get(':lang/benner:slug')
  @ApiOperation({ summary: 'Get banner by slug and language' })
  @ApiResponse({ status: 200, type: Banner })
  async findBySlugAndLang(
    @Param('lang') lang: string,
    @Param('slug') slug: string,
    @I18n() i18n: I18nContext,
  ): Promise<Banner> {
    this.validateStringParam(slug, 'slug', i18n);
    this.logger.log(`Fetching banner with slug ${slug} for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } }),
      );
    }
    try {
      return await this.bannerService.findBySlug(slug, lang);
    } catch (error) {
      this.logger.error(`Error fetching banner with slug ${slug} for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Put('banner/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner' })
  @ApiResponse({ status: 200, type: Banner })
  async update(@Param('id') id: string, @Body() dto: UpdateBannerDto, @I18n() i18n: I18nContext): Promise<Banner> {
    const bannerId = this.validateNumberParam(id, 'id', i18n);
    try {
      return await this.bannerService.update(bannerId, dto);
    } catch (error) {
      this.logger.error(`Error updating banner ${bannerId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
  @Delete('translation/:id/:language')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner translation by ID and language' })
  @ApiResponse({ status: 204 })
  async deleteTranslation(
    @Param('id') id: string,
    @Param('language') language: string,
    @I18n() i18n: I18nContext
  ): Promise<void> {
    const translationId = this.validateNumberParam(id, 'translationId', i18n);
    this.validateStringParam(language, 'language', i18n);
    try {
      await this.bannerService.deleteTranslation(translationId, language);
    } catch (error) {
      this.logger.error(
        `Error deleting translation id=${translationId} for language=${language}: ${error.message}`,
        error.stack
      );
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Delete('banner/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<void> {
    const bannerId = this.validateNumberParam(id, 'id', i18n);
    try {
      await this.bannerService.remove(bannerId);
    } catch (error) {
      this.logger.error(`Error deleting banner ${bannerId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}