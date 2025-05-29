import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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
    this.logger.log(
      `Creating member with slug: ${dto.slug}, image: ${
        dto.image
      }, canonicalUrl: ${dto.canonicalUrl || 'none'}`,
    );
    try {
      // Kiểm tra trùng lặp slug
      const existingMember = await this.memberRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existingMember) {
        this.logger.warn(`Duplicate slug '${dto.slug}'`);
        throw new BadRequestException(
          this.i18n.t('global.member.DUPLICATE_SLUG', {
            args: { slug: dto.slug },
          }),
        );
      }

      // Kiểm tra ngôn ngữ hợp lệ
      for (const t of dto.translations) {
        if (
          !SUPPORTED_LANGUAGES.includes(
            t.language as (typeof SUPPORTED_LANGUAGES)[number],
          )
        ) {
          throw new BadRequestException(
            this.i18n.t('global.global.INVALID_LANGUAGE', {
              args: {
                lang: t.language,
                supported: SUPPORTED_LANGUAGES.join(', '),
              },
            }),
          );
        }
      }

      const member = this.memberRepository.create({
        slug: dto.slug,
        image: dto.image,
        isActive: dto.isActive ?? true,
        canonicalUrl: dto.canonicalUrl,
        core: dto.core ?? false,
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
          this.i18n.t('global.member.DUPLICATE_SLUG', {
            args: { slug: dto.slug },
          }),
        );
      }
      throw new BadRequestException(
        this.i18n.t('global.global.INTERNAL_ERROR'),
      );
    }
  }

  async addOrUpdateTranslation(
    memberId: number,
    translationDto: CreateMemberDto['translations'][0],
  ): Promise<Member> {
    this.logger.log(
      `Adding/updating translation for member ${memberId}, language ${translationDto.language}`,
    );
    const member = await this.findOne(memberId);

    // Kiểm tra xem translation đã tồn tại chưa
    const existingTranslation = member.translations.find(
      (t) => t.language === translationDto.language,
    );

    if (existingTranslation) {
      // Cập nhật translation hiện có
      Object.assign(existingTranslation, translationDto);
      await this.translationRepository.save(existingTranslation);
    } else {
      // Thêm translation mới
      if (
        !SUPPORTED_LANGUAGES.includes(
          translationDto.language as (typeof SUPPORTED_LANGUAGES)[number],
        )
      ) {
        throw new BadRequestException(
          this.i18n.t('global.global.INVALID_LANGUAGE', {
            args: {
              lang: translationDto.language,
              supported: SUPPORTED_LANGUAGES.join(', '),
            },
          }),
        );
      }
      const newTranslation = this.translationRepository.create({
        ...translationDto,
        member,
      });
      await this.translationRepository.save(newTranslation);
    }

    // Tải lại member với tất cả translations từ database
    const updatedMember = await this.memberRepository.findOne({
      where: { id: memberId },
      relations: ['translations'],
    });

    if (!updatedMember) {
      throw new NotFoundException(
        this.i18n.t('global.member.MEMBER_NOT_FOUND'),
      );
    }

    this.logger.log(
      `Updated translations for member ${memberId}: ${JSON.stringify(
        updatedMember.translations,
      )}`,
    );
    return updatedMember;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Member[]; total: number; page: number; limit: number }> {
    this.logger.log(
      `Fetching members with pagination: page=${page}, limit=${limit}`,
    );

    // Validation
    if (page <= 0 || limit <= 0) {
      this.logger.warn(
        `Invalid pagination params: page=${page}, limit=${limit}`,
      );
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_PAGINATION_PARAM', {
          args: { param: page <= 0 ? 'page' : 'limit' },
        }),
      );
    }

    try {
      const skip = (page - 1) * limit;
      const [members, total] = await this.memberRepository.findAndCount({
        relations: ['translations'],
        skip,
        take: limit,
      });

      this.logger.debug(`Found ${members.length} members, total: ${total}`);
      return {
        data: members,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching members with pagination: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        this.i18n.t('global.global.INTERNAL_ERROR'),
      );
    }
  }

  async findOne(id: number): Promise<Member> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_NUMBER_PARAM', {
          args: { param: 'id' },
        }),
      );
    }
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
    if (!member) {
      throw new NotFoundException(
        this.i18n.t('global.member.MEMBER_NOT_FOUND'),
      );
    }
    return member;
  }

  async findBySlug(slug: string, language: string): Promise<Member> {
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      this.logger.warn(`Invalid slug: ${slug}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_PARAM', { args: { param: 'slug' } }),
      );
    }
    if (
      !SUPPORTED_LANGUAGES.includes(
        language as (typeof SUPPORTED_LANGUAGES)[number],
      )
    ) {
      this.logger.warn(`Invalid language: ${language}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', {
          args: { lang: language, supported: SUPPORTED_LANGUAGES.join(', ') },
        }),
      );
    }
    const member = await this.memberRepository.findOne({
      where: { slug },
      relations: ['translations'],
    });
    if (!member) {
      throw new NotFoundException(
        this.i18n.t('global.member.MEMBER_NOT_FOUND'),
      );
    }
    if (!member.translations.some((t) => t.language === language)) {
      throw new NotFoundException(
        this.i18n.t('global.member.TRANSLATION_NOT_FOUND', {
          args: { lang: language },
        }),
      );
    }
    return member;
  }

  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_NUMBER_PARAM', {
          args: { param: 'id' },
        }),
      );
    }
    const member = await this.findOne(id);

    // Kiểm tra trùng lặp slug nếu cập nhật
    if (dto.slug && dto.slug !== member.slug) {
      const existingMember = await this.memberRepository.findOne({
        where: { slug: dto.slug },
      });
      if (existingMember) {
        this.logger.warn(`Duplicate slug '${dto.slug}'`);
        throw new BadRequestException(
          this.i18n.t('global.member.DUPLICATE_SLUG', {
            args: { slug: dto.slug },
          }),
        );
      }
      member.slug = dto.slug;
    }
    if (dto.core !== undefined) member.core = dto.core;

    if (dto.image) member.image = dto.image;
    if (dto.isActive !== undefined) member.isActive = dto.isActive;
    if (dto.canonicalUrl !== undefined) member.canonicalUrl = dto.canonicalUrl;

    if (dto.translations) {
      const existingTranslations = await this.translationRepository.find({
        where: { member: { id } },
      });
      const updatedTranslations = await Promise.all(
        dto.translations.map(async (t) => {
          if (
            !SUPPORTED_LANGUAGES.includes(
              t.language as (typeof SUPPORTED_LANGUAGES)[number],
            )
          ) {
            throw new BadRequestException(
              this.i18n.t('global.global.INVALID_LANGUAGE', {
                args: {
                  lang: t.language,
                  supported: SUPPORTED_LANGUAGES.join(', '),
                },
              }),
            );
          }
          const existing = existingTranslations.find(
            (et) => et.language === t.language,
          );
          if (existing) {
            Object.assign(existing, t);
            return this.translationRepository.save(existing);
          } else {
            const newTranslation = this.translationRepository.create({
              ...t,
              member,
            });
            return this.translationRepository.save(newTranslation);
          }
        }),
      );
      member.translations = updatedTranslations;
    }

    try {
      return await this.memberRepository.save(member);
    } catch (error) {
      this.logger.error(
        `Error updating member ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        this.i18n.t('global.global.INTERNAL_ERROR'),
      );
    }
  }

  async remove(id: number): Promise<void> {
    const member = await this.findOne(id);
    try {
      await this.memberRepository.remove(member);
      this.logger.log(`Deleted member id=${id}`);
    } catch (error) {
      this.logger.error(
        `Error deleting member ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        this.i18n.t('global.global.INTERNAL_ERROR'),
      );
    }
  }

  async getSitemap(lang: string = 'en'): Promise<{ urls: string[] }> {
    this.logger.log(`Generating sitemap for members: ${lang}`);
    if (
      !SUPPORTED_LANGUAGES.includes(
        lang as (typeof SUPPORTED_LANGUAGES)[number],
      )
    ) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', {
          args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') },
        }),
      );
    }
    try {
      const members = await this.memberRepository.find({
        relations: ['translations'],
      });
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
                `Translation for member id=${member.id} (lang=${lang}) invalid: name=${t.name}`,
              );
            }
            return isValid;
          });
          return member.isActive && hasValidTranslation && member.slug;
        })
        .map((member) => {
          const url =
            member.canonicalUrl ||
            `${process.env.DOMAIN}/member/${member.slug}`;
          this.logger.debug(`Generated URL: ${url}`);
          return url;
        });

      if (urls.length === 0) {
        this.logger.warn(
          `No valid translations found for members in language ${lang}`,
        );
        throw new BadRequestException(
          this.i18n.t('global.global.NO_VALID_TRANSLATIONS', {
            args: { lang },
          }),
        );
      }

      this.logger.log(`Generated ${urls.length} URLs for member sitemap`);
      return { urls };
    } catch (error) {
      this.logger.error(
        `Error generating sitemap for ${lang}: ${error.message}`,
        error.stack,
      );
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async deleteTranslation(memberId: number, language: string): Promise<void> {
    this.logger.debug(
      `Attempting to delete translation for memberId=${memberId}, language=${language}`,
    );
    if (isNaN(memberId) || memberId <= 0) {
      this.logger.warn(`Invalid memberId: ${memberId}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_NUMBER_PARAM', {
          args: { param: 'memberId' },
        }),
      );
    }
    if (
      !SUPPORTED_LANGUAGES.includes(
        language as (typeof SUPPORTED_LANGUAGES)[number],
      )
    ) {
      this.logger.warn(`Invalid language: ${language}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', {
          args: { lang: language, supported: SUPPORTED_LANGUAGES.join(', ') },
        }),
      );
    }
    try {
      const translation = await this.translationRepository.findOne({
        where: { member: { id: memberId }, language },
        relations: ['member'],
      });
      if (!translation) {
        this.logger.warn(
          `Translation not found: memberId=${memberId}, language=${language}`,
        );
        throw new NotFoundException(
          this.i18n.t('global.member.TRANSLATION_NOT_FOUND', {
            args: { lang: language },
          }),
        );
      }
      await this.translationRepository.remove(translation);
      this.logger.log(
        `Deleted translation for memberId=${memberId}, language=${language}`,
      );
    } catch (error) {
      this.logger.error(
        `Error deleting translation for memberId=${memberId}, language=${language}: ${error.message}`,
        error.stack,
      );
      throw error instanceof BadRequestException ||
        error instanceof NotFoundException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}
