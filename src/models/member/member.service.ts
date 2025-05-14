// src/member/member.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entity/member.entity';
import { MemberTranslation } from './entity/member-translation.entity';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { I18nService } from 'nestjs-i18n';
import { SUPPORTED_LANGUAGES } from '../../config/languages';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(MemberTranslation)
    private translationRepository: Repository<MemberTranslation>,
    private i18n: I18nService,
  ) {}

  async create(dto: CreateMemberDto): Promise<Member> {
    this.logger.log(`Creating member with slug: ${dto.slug}, image: ${dto.image}, canonicalUrl: ${dto.canonicalUrl || 'none'}`);
    try {
      // Kiểm tra trùng lặp slug
      const existingMember = await this.memberRepository.findOne({ where: { slug: dto.slug } });
      if (existingMember) {
        this.logger.warn(`Duplicate slug '${dto.slug}'`);
        throw new BadRequestException(
          this.i18n.t('global.member.DUPLICATE_SLUG', { args: { slug: dto.slug } })
        );
      }

      // Kiểm tra ngôn ngữ hợp lệ
      for (const t of dto.translations) {
        if (!SUPPORTED_LANGUAGES.includes(t.language as typeof SUPPORTED_LANGUAGES[number])) {
          throw new BadRequestException(
            this.i18n.t('global.global.INVALID_LANGUAGE', {
              args: { lang: t.language, supported: SUPPORTED_LANGUAGES.join(', ') },
            })
          );
        }
      }

      const member = this.memberRepository.create({
        slug: dto.slug,
        image: dto.image,
        isActive: dto.isActive ?? true,
        canonicalUrl: dto.canonicalUrl,
        translations: [],
      });
      const savedMember = await this.memberRepository.save(member);

      const translations = await Promise.all(
        dto.translations.map(async (t) => {
          const translation = this.translationRepository.create({
            ...t,
            member: savedMember,
          });
          return this.translationRepository.save(translation);
        }),
      );

      savedMember.translations = translations;
      return savedMember;
    } catch (error) {
      this.logger.error(`Error creating member: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          this.i18n.t('global.member.DUPLICATE_SLUG', { args: { slug: dto.slug } })
        );
      }
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async findAll(): Promise<Member[]> {
    this.logger.log('Fetching all members');
    return this.memberRepository.find({ relations: ['translations'] });
  }

  async findOne(id: number): Promise<Member> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const member = await this.memberRepository.findOne({ where: { id }, relations: ['translations'] });
    if (!member) {
      throw new NotFoundException(this.i18n.t('global.member.MEMBER_NOT_FOUND'));
    }
    return member;
  }

  async findBySlug(slug: string, language: string): Promise<Member> {
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      this.logger.warn(`Invalid slug: ${slug}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_PARAM', { args: { param: 'slug' } }));
    }
    if (!SUPPORTED_LANGUAGES.includes(language as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${language}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', {
          args: { lang: language, supported: SUPPORTED_LANGUAGES.join(', ') },
        })
      );
    }
    const member = await this.memberRepository.findOne({
      where: { slug },
      relations: ['translations'],
    });
    if (!member) {
      throw new NotFoundException(this.i18n.t('global.member.MEMBER_NOT_FOUND'));
    }
    if (!member.translations.some(t => t.language === language)) {
      throw new NotFoundException(this.i18n.t('global.member.TRANSLATION_NOT_FOUND', { args: { lang: language } }));
    }
    return member;
  }

  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const member = await this.findOne(id);

    // Kiểm tra trùng lặp slug nếu cập nhật
    if (dto.slug && dto.slug !== member.slug) {
      const existingMember = await this.memberRepository.findOne({ where: { slug: dto.slug } });
      if (existingMember) {
        this.logger.warn(`Duplicate slug '${dto.slug}'`);
        throw new BadRequestException(
          this.i18n.t('global.member.DUPLICATE_SLUG', { args: { slug: dto.slug } })
        );
      }
      member.slug = dto.slug;
    }

    if (dto.image) member.image = dto.image;
    if (dto.isActive !== undefined) member.isActive = dto.isActive;
    if (dto.canonicalUrl !== undefined) member.canonicalUrl = dto.canonicalUrl;

    if (dto.translations) {
      const existingTranslations = await this.translationRepository.find({ where: { member: { id } } });
      const updatedTranslations = await Promise.all(
        dto.translations.map(async (t) => {
          if (!SUPPORTED_LANGUAGES.includes(t.language as typeof SUPPORTED_LANGUAGES[number])) {
            throw new BadRequestException(
              this.i18n.t('global.global.INVALID_LANGUAGE', {
                args: { lang: t.language, supported: SUPPORTED_LANGUAGES.join(', ') },
              })
            );
          }
          const existing = existingTranslations.find((et) => et.language === t.language);
          if (existing) {
            Object.assign(existing, t);
            return this.translationRepository.save(existing);
          } else {
            const newTranslation = this.translationRepository.create({ ...t, member });
            return this.translationRepository.save(newTranslation);
          }
        }),
      );
      member.translations = updatedTranslations;
    }

    try {
      return await this.memberRepository.save(member);
    } catch (error) {
      this.logger.error(`Error updating member ${id}: ${error.message}`, error.stack);
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async remove(id: number): Promise<void> {
    const member = await this.findOne(id);
    try {
      await this.memberRepository.remove(member);
      this.logger.log(`Deleted member id=${id}`);
    } catch (error) {
      this.logger.error(`Error deleting member ${id}: ${error.message}`, error.stack);
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async getSitemap(lang: string = 'en'): Promise<{ urls: string[] }> {
    this.logger.log(`Generating sitemap for members: ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', {
          args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') },
        })
      );
    }
    try {
      const members = await this.memberRepository.find({ relations: ['translations'] });
      this.logger.debug(`Found ${members.length} members`);
      const urls = members
        .filter((member) => {
          const translations = member.translations || [];
          const hasValidTranslation = translations.some((t) => {
            const isValid =
              t.language === lang &&
              t.id &&
              !isNaN(t.id) &&
              t.id > 0 &&
              typeof t.name === 'string' &&
              t.name.trim();
            if (!isValid) {
              this.logger.debug(
                `Translation for member id=${member.id} (lang=${lang}) invalid: name=${t.name}`
              );
            }
            return isValid;
          });
          return member.isActive && hasValidTranslation && member.slug;
        })
        .map((member) => {
          const url = member.canonicalUrl || `${process.env.DOMAIN}/member/${member.slug}`;
          this.logger.debug(`Generated URL: ${url}`);
          return url;
        });

      if (urls.length === 0) {
        this.logger.warn(`No valid translations found for members in language ${lang}`);
        throw new BadRequestException(
          this.i18n.t('global.global.NO_VALID_TRANSLATIONS', { args: { lang } })
        );
      }

      this.logger.log(`Generated ${urls.length} URLs for member sitemap`);
      return { urls };
    } catch (error) {
      this.logger.error(`Error generating sitemap for ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async deleteTranslation(memberId: number, language: string): Promise<void> {
    this.logger.debug(`Attempting to delete translation for memberId=${memberId}, language=${language}`);
    if (isNaN(memberId) || memberId <= 0) {
      this.logger.warn(`Invalid memberId: ${memberId}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'memberId' } })
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
        where: { member: { id: memberId }, language },
        relations: ['member'],
      });
      if (!translation) {
        this.logger.warn(`Translation not found: memberId=${memberId}, language=${language}`);
        throw new NotFoundException(
          this.i18n.t('global.member.TRANSLATION_NOT_FOUND', { args: { lang: language } })
        );
      }
      await this.translationRepository.remove(translation);
      this.logger.log(`Deleted translation for memberId=${memberId}, language=${language}`);
    } catch (error) {
      this.logger.error(
        `Error deleting translation for memberId=${memberId}, language=${language}: ${error.message}`,
        error.stack
      );
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}