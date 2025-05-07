import { IsString, IsEmail, MaxLength, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactTranslationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  language: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ description: 'Meta description for SEO, max 160 characters' })
  metaDescription: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];
}

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  mail: string;

  @IsArray()
  @ApiProperty({ type: [ContactTranslationDto] })
  translations: ContactTranslationDto[];
}

export class UpdateContactDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  phone?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ required: false })
  mail?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [ContactTranslationDto], required: false })
  translations?: ContactTranslationDto[];
}