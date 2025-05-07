import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entity/contact.entity';
import { ContactTranslation } from './entity/contact-translation.entity';
import { CreateContactDto, UpdateContactDto } from './contact.dto';
import { I18nService } from 'nestjs-i18n';
import { SUPPORTED_LANGUAGES } from '../../config/languages';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(ContactTranslation)
    private translationRepository: Repository<ContactTranslation>,
    private i18n: I18nService,
  ) {}

  async create(dto: CreateContactDto): Promise<Contact> {
    this.logger.log(`Creating contact with phone: ${dto.phone}`);
    try {
      const contact = this.contactRepository.create({
        phone: dto.phone,
        mail: dto.mail,
        translations: [],
      });
      const savedContact = await this.contactRepository.save(contact);

      const translations = await Promise.all(
        dto.translations.map(async (t) => {
          if (!SUPPORTED_LANGUAGES.includes(t.language as typeof SUPPORTED_LANGUAGES[number])) {
            throw new BadRequestException(
              this.i18n.t('global.global.INVALID_LANGUAGE', {
                args: { lang: t.language, supported: SUPPORTED_LANGUAGES.join(', ') },
              })
            );
          }
          const translation = this.translationRepository.create({
            ...t,
            contact: savedContact,
          });
          return this.translationRepository.save(translation);
        }),
      );

      savedContact.translations = translations;
      return savedContact;
    } catch (error) {
      this.logger.error(`Error creating contact: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async findAll(): Promise<Contact[]> {
    this.logger.log('Fetching all contacts');
    return this.contactRepository.find({ relations: ['translations'] });
  }

  async findOne(id: number): Promise<Contact> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const contact = await this.contactRepository.findOne({ where: { id }, relations: ['translations'] });
    if (!contact) {
      throw new NotFoundException(this.i18n.t('contact.CONTACT_NOT_FOUND'));
    }
    return contact;
  }

  async findBySlug(slug: string, language: string): Promise<Contact> {
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
    const contact = await this.contactRepository
      .createQueryBuilder('contact')
      .innerJoinAndSelect('contact.translations', 'translation', 'translation.language = :language AND translation.slug = :slug', {
        language,
        slug,
      })
      .getOne();
    if (!contact) {
      throw new NotFoundException(this.i18n.t('contact.TRANSLATION_NOT_FOUND', { args: { lang: language } }));
    }
    return contact;
  }

  async update(id: number, dto: UpdateContactDto): Promise<Contact> {
    if (isNaN(id) || id <= 0) {
      this.logger.warn(`Invalid id: ${id}`);
      throw new BadRequestException(this.i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: 'id' } }));
    }
    const contact = await this.findOne(id);
    if (dto.phone) contact.phone = dto.phone;
    if (dto.mail) contact.mail = dto.mail;

    if (dto.translations) {
      await this.translationRepository.delete({ contact: { id } });
      contact.translations = await Promise.all(
        dto.translations.map(async (t) => {
          if (!SUPPORTED_LANGUAGES.includes(t.language as typeof SUPPORTED_LANGUAGES[number])) {
            throw new BadRequestException(
              this.i18n.t('global.global.INVALID_LANGUAGE', {
                args: { lang: t.language, supported: SUPPORTED_LANGUAGES.join(', ') },
              })
            );
          }
          const translation = this.translationRepository.create({
            ...t,
            contact,
          });
          return this.translationRepository.save(translation);
        }),
      );
    }

    try {
      return await this.contactRepository.save(contact);
    } catch (error) {
      this.logger.error(`Error updating contact ${id}: ${error.message}`, error.stack);
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async remove(id: number): Promise<void> {
    const contact = await this.findOne(id);
    try {
      await this.contactRepository.remove(contact);
      this.logger.log(`Deleted contact id=${id}`);
    } catch (error) {
      this.logger.error(`Error deleting contact ${id}: ${error.message}`, error.stack);
      throw new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  async getSitemap(lang: string = 'en'): Promise<{ urls: string[] }> {
    this.logger.log(`Generating sitemap for contacts: ${lang}`);
    if (!SUPPORTED_LANGUAGES.includes(lang as typeof SUPPORTED_LANGUAGES[number])) {
      this.logger.warn(`Invalid language: ${lang}`);
      throw new BadRequestException(
        this.i18n.t('global.global.INVALID_LANGUAGE', {
          args: { lang, supported: SUPPORTED_LANGUAGES.join(', ') },
        })
      );
    }
    try {
      const contacts = await this.contactRepository.find({ relations: ['translations'] });
      this.logger.debug(`Found ${contacts.length} contacts`);
      const urls = contacts
        .filter((contact) => {
          const translations = contact.translations || [];
          const hasValidTranslation = translations.some((t) => {
            const isValid =
              t.language === lang &&
              t.id &&
              !isNaN(t.id) &&
              t.id > 0 &&
              typeof t.slug === 'string' &&
              t.slug.trim() &&
              typeof t.address === 'string' &&
              t.address.trim() &&
              typeof t.metaDescription === 'string' &&
              t.metaDescription.trim() &&
              Array.isArray(t.keywords) &&
              t.keywords.length > 0;
            if (!isValid) {
              this.logger.debug(
                `Translation for contact id=${contact.id} (lang=${lang}) invalid: slug=${t.slug}, address=${t.address}, metaDescription=${t.metaDescription}, keywords=${t.keywords}`
              );
            }
            return isValid;
          });
          return hasValidTranslation;
        })
        .map((contact) => {
          const translation = contact.translations.find((t) => t.language === lang);
          const url = `${process.env.DOMAIN}/${lang}/contact/${translation.slug}`;
          this.logger.debug(`Generated URL: ${url}`);
          return url;
        });

      if (urls.length === 0) {
        this.logger.warn(`No valid translations found for contacts in language ${lang}`);
        throw new BadRequestException(
          this.i18n.t('global.global.NO_VALID_TRANSLATIONS', { args: { lang } })
        );
      }

      this.logger.log(`Generated ${urls.length} URLs for contact sitemap`);
      return { urls };
    } catch (error) {
      this.logger.error(`Error generating sitemap for ${lang}: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(this.i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}