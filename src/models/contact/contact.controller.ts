import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './contact.dto';
import { Contact } from './entity/contact.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SUPPORTED_LANGUAGES } from '../../config/languages';
import { Logger } from '@nestjs/common';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private readonly contactService: ContactService) {}

  private validateNumberParam(param: string, paramName: string, i18n: I18nContext): number {
    const num = parseInt(param, 10);
    if (isNaN(num) || num <= 0) {
      this.logger.warn(`Invalid ${paramName}: ${param}`);
      const message = i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: paramName } });
      this.logger.debug(`i18n message: ${message}, args: ${JSON.stringify({ param: paramName })}`);
      throw new BadRequestException(message);
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

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create contact' })
  @ApiResponse({ status: 201, type: Contact })
  async create(@Body() dto: CreateContactDto, @I18n() i18n: I18nContext): Promise<{ message: string; contact: Contact }> {
    this.logger.log('Creating new contact');
    try {
      const contact = await this.contactService.create(dto);
      return {
        message: i18n.t('global.contact.CONTACT_CREATED'),
        contact,
      };
    } catch (error) {
      this.logger.error(`Error creating contact: ${error.message}`, error.stack);
      throw error instanceof BadRequestException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({ status: 200, type: [Contact] })
  async findAll(): Promise<Contact[]> {
    this.logger.log('Fetching all contacts');
    return this.contactService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiResponse({ status: 200, type: Contact })
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<Contact> {
    if (!/^\d+$/.test(id)) {
      this.logger.warn(`Invalid id format: ${id}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const contactId = this.validateNumberParam(id, 'id', i18n);
    try {
      return await this.contactService.findOne(contactId);
    } catch (error) {
      this.logger.error(`Error fetching contact ${contactId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get(':lang/:slug')
  @ApiOperation({ summary: 'Get contact by slug and language' })
  @ApiResponse({ status: 200, type: Contact })
  async findBySlugAndLang(
    @Param('lang') lang: string,
    @Param('slug') slug: string,
    @I18n() i18n: I18nContext,
  ): Promise<Contact> {
    this.validateStringParam(slug, 'slug', i18n);
    this.logger.log(`Fetching contact with slug ${slug} for language ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      throw new BadRequestException(
        i18n.t('global.global.INVALID_LANGUAGE', { args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') } }),
      );
    }
    try {
      return await this.contactService.findBySlug(slug, lang);
    } catch (error) {
      this.logger.error(`Error fetching contact with slug ${slug} for language ${lang}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Delete('translation/:id/:language')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact translation by ID and language' })
  @ApiResponse({ status: 200 })
  async deleteTranslation(
    @Param('id') id: string,
    @Param('language') language: string,
    @I18n() i18n: I18nContext
  ): Promise<{ message: string }> {
    const translationId = this.validateNumberParam(id, 'translationId', i18n);
    this.validateStringParam(language, 'language', i18n);
    try {
      await this.contactService.deleteTranslation(translationId, language);
      return { message: i18n.t('global.contact.TRANSLATION_DELETED', { args: { lang: language } }) };
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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact' })
  @ApiResponse({ status: 200, type: Contact })
  async update(@Param('id') id: string, @Body() dto: UpdateContactDto, @I18n() i18n: I18nContext): Promise<Contact> {
    if (!/^\d+$/.test(id)) {
      this.logger.warn(`Invalid id format: ${id}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const contactId = this.validateNumberParam(id, 'id', i18n);
    try {
      return await this.contactService.update(contactId, dto);
    } catch (error) {
      this.logger.error(`Error updating contact ${contactId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<void> {
    if (!/^\d+$/.test(id)) {
      this.logger.warn(`Invalid id format: ${id}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const contactId = this.validateNumberParam(id, 'id', i18n);
    try {
      await this.contactService.remove(contactId);
    } catch (error) {
      this.logger.error(`Error deleting contact ${contactId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException ? error : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}