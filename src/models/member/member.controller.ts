// src/member/member.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { Member } from './entity/member.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SUPPORTED_LANGUAGES } from '../../config/languages';
import { Logger } from '@nestjs/common';

@ApiTags('member')
@Controller('member')
export class MemberController {
  private readonly logger = new Logger(MemberController.name);

  constructor(private readonly memberService: MemberService) {}

  private validateNumberParam(param: string, paramName: string, i18n: I18nContext): number {
    const num = parseInt(param, 10);
    if (isNaN(num) || num <= 0) {
      this.logger.warn(`Invalid ${paramName}: ${param}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: paramName } }));
    }
    return num;
  }

  @Get()
  @ApiOperation({ summary: 'Get all members' })
  @ApiResponse({ status: 200, type: [Member] })
  async findAll(): Promise<Member[]> {
    this.logger.log('Fetching all members');
    return this.memberService.findAll();
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Get sitemap for SEO' })
  @ApiResponse({ status: 200 })
  async getSitemap(@Query('lang') lang: string = 'en', @I18n() i18n: I18nContext): Promise<{ urls: string[]; message: string }> {
    this.logger.log(`Fetching member sitemap for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } })
      );
    }
    try {
      const sitemap = await this.memberService.getSitemap(lang);
      this.logger.debug(`Sitemap URLs: ${JSON.stringify(sitemap.urls)}`);
      return {
        urls: sitemap.urls,
        message: i18n.t('global.global.SITEMAP_GENERATED', { args: { count: sitemap.urls.length } }),
      };
    } catch (error) {
      this.logger.error(`Error fetching member sitemap for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiResponse({ status: 200, type: Member })
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<Member> {
    if (!/^\d+$/.test(id)) {
      this.logger.warn(`Invalid id format: ${id}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const memberId = this.validateNumberParam(id, 'id', i18n);
    try {
      return await this.memberService.findOne(memberId);
    } catch (error) {
      this.logger.error(`Error fetching member ${memberId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get(':lang/:slug')
  @ApiOperation({ summary: 'Get member by slug and language' })
  @ApiResponse({ status: 200, type: Member })
  async findBySlugAndLang(
    @Param('lang') lang: string,
    @Param('slug') slug: string,
    @I18n() i18n: I18nContext,
  ): Promise<Member> {
    this.logger.log(`Fetching member with slug ${slug} for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } }),
      );
    }
    try {
      return await this.memberService.findBySlug(slug, lang);
    } catch (error) {
      this.logger.error(`Error fetching member with slug ${slug} for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Delete('translation/:id/:language')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete member translation by member ID and language' })
  @ApiResponse({ status: 200 })
  async deleteTranslation(
    @Param('id') id: string,
    @Param('language') language: string,
    @I18n() i18n: I18nContext
  ): Promise<{ message: string }> {
    const memberId = this.validateNumberParam(id, 'memberId', i18n);
    try {
      await this.memberService.deleteTranslation(memberId, language);
      return { message: i18n.t('global.member.TRANSLATION_DELETED', { args: { lang: language } }) };
    } catch (error) {
      this.logger.error(
        `Error deleting translation for memberId=${memberId}, language=${language}: ${error.message}`,
        error.stack
      );
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create member' })
  @ApiResponse({ status: 201, type: Member })
  async create(@Body() dto: CreateMemberDto, @I18n() i18n: I18nContext): Promise<{ message: string; member: Member }> {
    this.logger.log(`Creating new member with slug: ${dto.slug}, image: ${dto.image}, canonicalUrl: ${dto.canonicalUrl || 'none'}`);
    try {
      const member = await this.memberService.create(dto);
      return {
        message: i18n.t('global.member.MEMBER_CREATED'),
        member,
      };
    } catch (error) {
      this.logger.error(`Error creating member: ${error.message}`, error.stack);
      throw error instanceof BadRequestException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update member' })
  @ApiResponse({ status: 200, type: Member })
  async update(@Param('id') id: string, @Body() dto: UpdateMemberDto, @I18n() i18n: I18nContext): Promise<Member> {
    if (!/^\d+$/.test(id)) {
      this.logger.warn(`Invalid id format: ${id}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const memberId = this.validateNumberParam(id, 'id', i18n);
    this.logger.log(`Updating member id=${memberId}, slug: ${dto.slug || 'unchanged'}, canonicalUrl: ${dto.canonicalUrl || 'none'}`);
    try {
      return await this.memberService.update(memberId, dto);
    } catch (error) {
      this.logger.error(`Error updating member ${memberId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete member' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<void> {
    if (!/^\d+$/.test(id)) {
      this.logger.warn(`Invalid id format: ${id}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const memberId = this.validateNumberParam(id, 'id', i18n);
    try {
      await this.memberService.remove(memberId);
    } catch (error) {
      this.logger.error(`Error deleting member ${memberId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}