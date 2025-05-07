import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './contact.dto';
import { Contact } from './contact.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create contact' })
  @ApiResponse({ status: 201, type: Contact })
  create(@Body() dto: CreateContactDto): Promise<Contact> {
    return this.contactService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiResponse({ status: 200, type: [Contact] })
  findAll(): Promise<Contact[]> {
    return this.contactService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiResponse({ status: 200, type: Contact })
  findOne(@Param('id') id: string): Promise<Contact> {
    return this.contactService.findOne(+id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get contact by slug' })
  @ApiResponse({ status: 200, type: Contact })
  findBySlug(@Param('slug') slug: string): Promise<Contact> {
    return this.contactService.findBySlug(slug);
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Get sitemap for SEO' })
  @ApiResponse({ status: 200 })
  async getSitemap(): Promise<{ urls: string[] }> {
    const contacts = await this.contactService.findAll();
    const urls = contacts.map(contact => `https://yourdomain.com/contact/${contact.slug}`);
    return { urls };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact' })
  @ApiResponse({ status: 200, type: Contact })
  update(@Param('id') id: string, @Body() dto: UpdateContactDto): Promise<Contact> {
    return this.contactService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.contactService.remove(+id);
  }
}