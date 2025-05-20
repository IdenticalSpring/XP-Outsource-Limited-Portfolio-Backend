import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entity/banner.entity';
import { BannerTranslation } from './entity/banner-translation.entity';
import { CreateBannerDto, UpdateBannerDto, BannerTranslationDto } from './banner.dto';
import { I18nService } from 'nestjs-i18n';
import { SUPPORTED_LANGUAGES } from '../../config/languages';

@Injectable()
export class BannerService {
  private readonly logger = new Logger(BannerService.name);

  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
    @InjectRepository(BannerTranslation)
    private translationRepository: Repository<BannerTranslation>,
    private i18n: I18nService,
  ) {}

  async create(dto: CreateBannerDto): Promise<Banner> {
    this.logger.log(`Creating banner with slug: ${dto.slug}`);
    try {
      const slug = await this.generateUniqueSlug(dto.slug || dto.translations[0].title);
      const banner = this.bannerRepository.create({
        ...dto,
        slug,
        translations: [],
      });
      const savedBanner = await this.bannerRepository.save(banner);

      const translations = await Promise.all(
        dto.translations.map(async (t) => {
          const translation = this.translationRepository.create({
            ...t,
            banner: savedBanner,
          });
          return this.translationRepository.save(translation);
        }),
      );

      savedBanner.translations = translations;
      return savedBanner;
    } catch (error) {
      this.logger.error(`Error creating banner: ${error.message}`, error.stack);
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerRepository.find({ relations: ['translations'] });
  }

  async findOne(id: number): Promise<Banner> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      const message = this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } });
      this.logger.debug(`i18n message: ${message}`);
      throw new BadRequestException(message);
    }
    const banner = await this.bannerRepository.findOne({ where: { id }, relations: ['translations'] });
    if (!banner) {
      throw new NotFoundException(this.i18n.t('global.banner.BANNER_NOT_FOUND'));
    }
    return banner;
  }

  async findBySlug(slug: string, lang?: string): Promise<Banner> {
    if (!slug) {
      this.logger.warn(`Invalid slug: ${slug}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_PARAM', { args: { param: 'slug' } }));
    }
    const banner = await this.bannerRepository.findOne({ where: { slug }, relations: ['translations'] });
    if (!banner) {
      throw new NotFoundException(this.i18n.t('global.banner.BANNER_NOT_FOUND'));
    }
    if (lang && !banner.translations.some((t) => t.language === lang)) {
      throw new NotFoundException(this.i18n.t('global.banner.TRANSLATION_NOT_FOUND', { args: { lang } }));
    }
    return banner;
  }

  async update(id: number, dto: UpdateBannerDto): Promise<Banner> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const banner = await this.findOne(id);
    if (dto.slug && dto.slug !== banner.slug) {
      banner.slug = await this.generateUniqueSlug(dto.slug);
    }

    if (dto.translations) {
      await this.translationRepository.delete({ banner: { id } });
      banner.translations = await Promise.all(
        dto.translations.map(async (t) => {
          const translation = this.translationRepository.create({
            ...t,
            banner,
          });
          return this.translationRepository.save(translation);
        }),
      );
    }

    Object.assign(banner, {
      image: dto.image,
    });

    return this.bannerRepository.save(banner);
  }

  async addOrUpdateTranslation(id: number, translationDto: BannerTranslationDto): Promise<Banner> {
    this.logger.log(`Adding/updating translation for banner ${id}, language ${translationDto.language}`);
    const banner = await this.findOne(id);

    // Kiểm tra xem translation đã tồn tại chưa
    const existingTranslation = banner.translations.find(
      (t) => t.language === translationDto.language
    );

    if (existingTranslation) {
      // Cập nhật translation hiện có
      Object.assign(existingTranslation, translationDto);
      await this.translationRepository.save(existingTranslation);
    } else {
      // Thêm translation mới
      const newTranslation = this.translationRepository.create({
        ...translationDto,
        banner,
      });
      await this.translationRepository.save(newTranslation);
    }

    // Tải lại banner với tất cả translations từ database
    const updatedBanner = await this.bannerRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!updatedBanner) {
      throw new NotFoundException(this.i18n.t('global.banner.BANNER_NOT_FOUND'));
    }

    this.logger.log(`Updated translations for banner ${id}: ${JSON.stringify(updatedBanner.translations)}`);
    return updatedBanner;
  }

  async remove(id: number): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
  }

  async generateUniqueSlug(slug: string): Promise<string> {
    if (!slug) {
      this.logger.warn(`Invalid slug: ${slug}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_PARAM', { args: { param: 'slug' } }));
    }
    let uniqueSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let counter = 1;
    while (await this.bannerRepository.findOneBy({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    return uniqueSlug;
  }

  async getSitemap(lang: string = 'en'): Promise<{ urls: string[] }> {
    this.logger.log(`Generating sitemap for banners: ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', {
          args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') },
        })
      );
    }
    try {
      const banners = await this.bannerRepository.find({ relations: ['translations'] });
      this.logger.debug(`Found ${banners.length} banners`);

      const urls = banners
        .filter((banner) => {
          if (
            !banner.id ||
            isNaN(banner.id) ||
            banner.id <= 0 ||
            !banner.slug ||
            typeof banner.slug !== 'string' ||
            banner.slug.trim() === ''
          ) {
            this.logger.warn(`Invalid banner data: id=${banner.id}, slug=${banner.slug}`);
            return false;
          }

          const translations = banner.translations || [];
          if (!translations.length) {
            this.logger.debug(`Banner ${banner.slug} has no translations`);
            return false;
          }

          const hasValidTranslation = translations.some((t) => {
            const isValid =
              t.language === lang &&
              t.id &&
              !isNaN(t.id) &&
              t.id > 0 &&
              typeof t.title === 'string' &&
              t.title.trim() &&
              typeof t.description === 'string' &&
              t.description.trim();
            if (!isValid) {
              this.logger.debug(
                `Translation for banner ${banner.slug} (lang=${lang}) invalid: id=${t.id}, title=${t.title}, description=${t.description}`
              );
            }
            return isValid;
          });

          if (!hasValidTranslation) {
            this.logger.debug(`Banner ${banner.slug} has no valid translation for ${lang}`);
            return false;
          }
          return true;
        })
        .map((banner) => {
          const url = `${process.env.DOMAIN}/${lang}/banner/${banner.slug}`;
          this.logger.debug(`Generated URL: ${url}`);
          return url;
        });

      if (urls.length === 0) {
        this.logger.warn(`No valid translations found for banners in language ${lang}`);
        throw new BadRequestException(
          this.i18n.t('global.global.NO_VALID_TRANSLATIONS', { args: { lang } })
        );
      }

      this.logger.log(`Generated ${urls.length} URLs for banner sitemap`);
      return { urls };
    } catch (error) {
      this.logger.error(`Error generating sitemap for ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async deleteTranslation(bannerId: number, language: string): Promise<void> {
    this.logger.debug(`Attempting to delete translation for bannerId=${bannerId}, language=${language}`);
    if (isNaN(bannerId) || bannerId <= 0) {
      this.logger.warn(`Invalid bannerId: ${bannerId}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'bannerId' } })
      );
    }
    if (!SUPPORTED_LANGUAGES.includes(language as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${language}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', {
          args: { lang: language, supported: SUPPORTED_LANGUAGES.join(', ') },
        })
      );
    }
    try {
      const translation = await this.translationRepository.findOne({
        where: { banner: { id: bannerId }, language },
        relations: ['banner'],
      });
      if (!translation) {
        this.logger.warn(`Translation not found: bannerId=${bannerId}, language=${language}`);
        throw new NotFoundException(
          this.i18n.t('global.banner.TRANSLATION_NOT_FOUND', { args: { lang: language } })
        );
      }
      await this.translationRepository.remove(translation);
      this.logger.log(`Deleted translation for bannerId=${bannerId}, language=${language}`);
    } catch (error) {
      this.logger.error(
        `Error deleting translation for bannerId=${bannerId}, language=${language}: ${error.message}`,
        error.stack
      );
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}