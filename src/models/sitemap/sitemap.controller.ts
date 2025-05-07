import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { BannerService } from '../banner/banner.service';
import { ContactService } from '../contact/contact.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SUPPORTED_LANGUAGES } from '../../config/languages';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('sitemap')
@Controller('sitemap')
export class SitemapController {
  private readonly logger = new Logger(SitemapController.name);

  constructor(
    private readonly blogService: BlogService,
    private readonly bannerService: BannerService,
    private readonly contactService: ContactService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get combined sitemap for blogs, banners, and contacts' })
  @ApiResponse({ status: 200 })
  async getSitemap(@Query('lang') lang: string = 'en', @I18n() i18n: I18nContext): Promise<{ urls: string[] }> {
    this.logger.log(`Generating combined sitemap for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } })
      );
    }
    try {
      const blogSitemap = await this.blogService.getSitemap(lang);
      const bannerSitemap = await this.bannerService.getSitemap(lang);
      const contactSitemap = await this.contactService.getSitemap(lang);
      const urls = [...blogSitemap.urls, ...bannerSitemap.urls, ...contactSitemap.urls];
      this.logger.log(`Generated ${urls.length} URLs for combined sitemap`);
      return { urls };
    } catch (error) {
      this.logger.error(`Error generating sitemap for ${lang}: ${error.message}`, error.stack);
      throw new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('banner')
  @ApiOperation({ summary: 'Get sitemap for banners' })
  @ApiResponse({ status: 200 })
  async getBannerSitemap(@Query('lang') lang: string = 'en', @I18n() i18n: I18nContext): Promise<{ urls: string[]; message: string }> {
    this.logger.log(`Fetching banner sitemap for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } })
      );
    }
    try {
      const sitemap = await this.bannerService.getSitemap(lang);
      this.logger.debug(`Sitemap URLs: ${JSON.stringify(sitemap.urls)}`);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching banner sitemap for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('blog')
  @ApiOperation({ summary: 'Get sitemap for blogs' })
  @ApiResponse({ status: 200 })
  async getBlogSitemap(@Query('lang') lang: string = 'en', @I18n() i18n: I18nContext): Promise<{ urls: string[]; message: string }> {
    this.logger.log(`Fetching blog sitemap for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } })
      );
    }
    try {
      const sitemap = await this.blogService.getSitemap(lang);
      this.logger.debug(`Sitemap URLs: ${JSON.stringify(sitemap.urls)}`);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching blog sitemap for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('contact')
  @ApiOperation({ summary: 'Get sitemap for contacts' })
  @ApiResponse({ status: 200 })
  async getContactSitemap(@Query('lang') lang: string = 'en', @I18n() i18n: I18nContext): Promise<{ urls: string[]; message: string }> {
    this.logger.log(`Fetching contact sitemap for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } })
      );
    }
    try {
      const sitemap = await this.contactService.getSitemap(lang);
      this.logger.debug(`Sitemap URLs: ${JSON.stringify(sitemap.urls)}`);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching contact sitemap for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}