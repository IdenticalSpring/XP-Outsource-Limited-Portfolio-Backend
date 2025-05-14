// src/models/blog/blog.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entity/blog.entity';
import { BlogTranslation } from './entity/blog-translation.entity';
import { CreateBlogDto, UpdateBlogDto, BlogTranslationDto, DeleteTranslationDto } from './blog.dto';
import { I18nService } from 'nestjs-i18n';
import sanitizeHtml from 'sanitize-html';
import { SUPPORTED_LANGUAGES } from '../../config/languages';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(BlogTranslation)
    private translationRepository: Repository<BlogTranslation>,
    private i18n: I18nService,
  ) {}

  private sanitizeContent(content: string): string {
    return sanitizeHtml(content, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'div', 'br', 'ul', 'li', 'ol', 'h1', 'h2', 'h3', 'img'],
      allowedAttributes: {
        a: ['href', 'target'],
        img: ['src', 'alt'],
      },
      allowedIframeHostnames: [],
    });
  }

  async create(dto: CreateBlogDto): Promise<Blog> {
    this.logger.log(`Creating blog with slug: ${dto.slug}`);
    try {
      const slug = await this.generateUniqueSlug(dto.slug || dto.translations[0].title);
      const blog = this.blogRepository.create({
        ...dto,
        slug,
        translations: [],
      });
      const savedBlog = await this.blogRepository.save(blog);

      const translations = await Promise.all(
        dto.translations.map(async (translationDto) => {
          const translation = this.translationRepository.create({
            ...translationDto,
            content: this.sanitizeContent(translationDto.content),
            blog: savedBlog,
          });
          return this.translationRepository.save(translation);
        }),
      );

      savedBlog.translations = translations;
      return savedBlog;
    } catch (error) {
      this.logger.error(`Error creating blog: ${error.message}`, error.stack);
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async addTranslation(blogId: number, dto: BlogTranslationDto): Promise<BlogTranslation> {
    if (isNaN(blogId) || blogId <= 0) {
      this.logger.warn(`Invalid blogId: ${blogId}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'blogId' } }));
    }
    try {
      const blog = await this.findOne(blogId);
      const existingTranslation = blog.translations.find((t) => t.language === dto.language);
      if (existingTranslation) {
        throw new BadRequestException(this.i18n.t('global.blog.TRANSLATION_ALREADY_EXISTS', { args: { lang: dto.language } }));
      }

      const translation = this.translationRepository.create({
        ...dto,
        content: this.sanitizeContent(dto.content),
        blog,
      });

      return this.translationRepository.save(translation);
    } catch (error) {
      this.logger.error(`Error adding translation for blog ${blogId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async removeTranslation(blogId: number, translationId: number): Promise<void> {
    if (isNaN(blogId) || blogId <= 0 || isNaN(translationId) || translationId <= 0) {
      this.logger.warn(`Invalid params: blogId=${blogId}, translationId=${translationId}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'blogId or translationId' } }));
    }
    try {
      const blog = await this.findOne(blogId);
      const translation = blog.translations.find((t) => t.id === translationId);
      if (!translation) {
        throw new NotFoundException(this.i18n.t('global.blog.TRANSLATION_NOT_FOUND'));
      }
      await this.translationRepository.remove(translation);
    } catch (error) {
      this.logger.error(`Error removing translation ${translationId} for blog ${blogId}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
async findAll(page: number = 1, limit: number = 10): Promise<{ blogs: Blog[]; total: number }> {
    this.logger.log(`Fetching blogs: page=${page}, limit=${limit}`);
    try {
      const blogs = await this.blogRepository
        .createQueryBuilder("blog")
        .innerJoinAndSelect("blog.translations", "translations")
        .where("blog.id IS NOT NULL")
        .andWhere("blog.slug IS NOT NULL")
        .andWhere("translations.id IS NOT NULL")
        .andWhere("translations.title IS NOT NULL")
        .andWhere("translations.language IS NOT NULL")
        .orderBy("blog.id", "ASC") // Đảm bảo thứ tự nhất quán
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      const total = await this.blogRepository
        .createQueryBuilder("blog")
        .innerJoin("blog.translations", "translations")
        .where("blog.id IS NOT NULL")
        .andWhere("blog.slug IS NOT NULL")
        .andWhere("translations.id IS NOT NULL")
        .andWhere("translations.title IS NOT NULL")
        .andWhere("translations.language IS NOT NULL")
        .distinct(true)
        .getCount();

      this.logger.debug(`Fetched ${blogs.length} valid blogs for page ${page}, total=${total}`);
      return { blogs, total };
    } catch (error) {
      this.logger.error(`Error fetching blogs: ${error.message}`, error.stack);
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async findOne(id: number): Promise<Blog> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    try {
      const blog = await this.blogRepository.findOne({
        where: { id },
        relations: ['translations'],
      });
      if (!blog || !blog.id || !blog.slug) {
        throw new NotFoundException(this.i18n.t('global.blog.BLOG_NOT_FOUND'));
      }
      return blog;
    } catch (error) {
      this.logger.error(`Error fetching blog ${id}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async findBySlug(slug: string, lang?: string): Promise<Blog> {
    if (!slug) {
      this.logger.warn(`Invalid slug: ${slug}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_PARAM', { args: { param: 'slug' } }));
    }
    try {
      const blog = await this.blogRepository.findOne({
        where: { slug },
        relations: ['translations'],
      });
      if (!blog || !blog.id || !blog.slug) {
        throw new NotFoundException(this.i18n.t('global.blog.BLOG_NOT_FOUND'));
      }
      if (lang && !blog.translations.some((t) => t.language === lang)) {
        throw new NotFoundException(this.i18n.t('global.blog.TRANSLATION_NOT_FOUND', { args: { lang } }));
      }
      return blog;
    } catch (error) {
      this.logger.error(`Error fetching blog with slug ${slug}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async update(id: number, dto: UpdateBlogDto): Promise<Blog> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    try {
      const blog = await this.findOne(id);
      if (dto.slug && dto.slug !== blog.slug) {
        blog.slug = await this.generateUniqueSlug(dto.slug);
      }

      if (dto.translations) {
        await this.translationRepository.delete({ blog: { id } });
        blog.translations = await Promise.all(
          dto.translations.map(async (t) => {
            const translation = this.translationRepository.create({
              ...t,
              content: this.sanitizeContent(t.content),
              blog,
            });
            return this.translationRepository.save(translation);
          }),
        );
      }

      Object.assign(blog, {
        image: dto.image,
        altText: dto.altText,
        canonicalUrl: dto.canonicalUrl,
        date: dto.date,
      });

      return this.blogRepository.save(blog);
    } catch (error) {
      this.logger.error(`Error updating blog ${id}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async remove(id: number): Promise<void> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    try {
      const blog = await this.findOne(id);
      await this.blogRepository.remove(blog);
    } catch (error) {
      this.logger.error(`Error deleting blog ${id}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async generateUniqueSlug(slug: string): Promise<string> {
    if (!slug) {
      this.logger.warn(`Invalid slug: ${slug}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_PARAM', { args: { param: 'slug' } }));
    }
    try {
      let uniqueSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let counter = 1;
      while (await this.blogRepository.findOneBy({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      return uniqueSlug;
    } catch (error) {
      this.logger.error(`Error generating slug ${slug}: ${error.message}`, error.stack);
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async getSitemap(lang: string = 'en'): Promise<{ urls: string[] }> {
    this.logger.log(`Generating sitemap for blogs: ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } }),
      );
    }
    try {
      const blogs = await this.blogRepository.find({ relations: ['translations'] });
      this.logger.debug(`Found ${blogs.length} blogs`);
      const urls = blogs
        .filter((blog) => {
          if (!blog.id || !blog.slug) {
            this.logger.warn(`Invalid blog data: id=${blog.id}, slug=${blog.slug}`);
            return false;
          }
          const translations = blog.translations || [];
          const hasValidTranslation = translations.some((t) => {
            const isValid = t.language === lang && t.id && t.title?.trim() && t.content?.trim();
            if (!isValid) {
              this.logger.debug(
                `Translation for blog ${blog.slug} (lang=${lang}) invalid: id=${t.id}, title=${t.title}, content=${t.content}`,
              );
            }
            return isValid;
          });
          if (!hasValidTranslation) {
            this.logger.debug(`Blog ${blog.slug} has no valid translation for ${lang}`);
          }
          return hasValidTranslation;
        })
        .map((blog) => {
          const url = `${process.env.DOMAIN}/${lang}/blog/${blog.slug}`;
          this.logger.debug(`Generated URL: ${url}`);
          return url;
        });
      if (urls.length === 0) {
        this.logger.warn(`No valid translations found for blogs in language ${lang}`);
        throw new BadRequestException(this.i18n.t('global.global.NO_VALID_TRANSLATIONS', { args: { lang } }));
      }
      this.logger.log(`Generated ${urls.length} URLs for blog sitemap`);
      return { urls };
    } catch (error) {
      this.logger.error(`Error generating sitemap for ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException ? error : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
  async removeTranslationByLanguage(blogId: number, language: string): Promise<void> {
    this.logger.debug(`Attempting to delete translation for blogId=${blogId}, language=${language}`);
    if (isNaN(blogId) || blogId <= 0) {
      this.logger.warn(`Invalid blogId: ${blogId}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'blogId' } })
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
        where: { blog: { id: blogId }, language },
        relations: ['blog'],
      });
      if (!translation) {
        this.logger.warn(`Translation not found: blogId=${blogId}, language=${language}`);
        throw new NotFoundException(
          this.i18n.t('global.blog.TRANSLATION_NOT_FOUND', { args: { lang: language } })
        );
      }
      await this.translationRepository.remove(translation);
      this.logger.log(`Deleted translation for blogId=${blogId}, language=${language}`);
    } catch (error) {
      this.logger.error(
        `Error deleting translation for blogId=${blogId}, language=${language}: ${error.message}`,
        error.stack
      );
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}