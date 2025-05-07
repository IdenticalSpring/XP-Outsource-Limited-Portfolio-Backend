import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { BannerService } from '../banner/banner.service';
import { ContactService } from '../contact/contact.service';
import { MemberService } from '../member/member.service';
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
    private readonly memberService: MemberService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get combined sitemap for blogs, banners, contacts, and members' })
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
      const sitemaps = await Promise.all([
        this.blogService.getSitemap(lang).catch(() => ({ urls: [] })),
        this.bannerService.getSitemap(lang).catch(() => ({ urls: [] })),
        this.contactService.getSitemap(lang).catch(() => ({ urls: [] })),
        this.memberService.getSitemap(lang).catch(() => ({ urls: [] })),
      ]);
      const urls = sitemaps
        .filter((sitemap) => sitemap.urls.length > 0)
        .flatMap((sitemap) => sitemap.urls);
      this.logger.log(`Generated ${urls.length} URLs for combined sitemap`);
      return { urls };
    } catch (error) {
      this.logger.error(`Error generating combined sitemap for ${lang}: ${error.message}`, error.stack);
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
      this.logger.debug(`Banner sitemap URLs: ${JSON.stringify(sitemap.urls)}`);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching banner sitemap for ${lang}: ${error.message}`, error.stack);
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
      this.logger.debug(`Blog sitemap URLs: ${JSON.stringify(sitemap.urls)}`);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching blog sitemap for ${lang}: ${error.message}`, error.stack);
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
      this.logger.debug(`Contact sitemap URLs: ${JSON.stringify(sitemap.urls)}`);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching contact sitemap for ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('member')
  @ApiOperation({ summary: 'Get sitemap for members' })
  @ApiResponse({ status: 200 })
  async getMemberSitemap(@Query('lang') lang: string = 'en', @I18n() i18n: I18nContext): Promise<{ urls: string[]; message: string }> {
    this.logger.log(`Fetching member sitemap for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } })
      );
    }
    try {
      const sitemap = await this.memberService.getSitemap(lang);
      this.logger.debug(`Member sitemap URLs: ${JSON.stringify(sitemap.urls)}`);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching member sitemap for ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}