import { IsString, IsDate, MaxLength, IsNotEmpty, IsArray, IsOptional, Length, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SUPPORTED_LANGUAGES } from '../../config/languages';
import { IsSupportedLanguageConstraint } from '../../common/validators/is-supported-language.validator';

export class BlogTranslationDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsSupportedLanguageConstraint)
  @ApiProperty({ description: 'Language code (e.g., en, vi, fr, es, ja)', enum: SUPPORTED_LANGUAGES })
  language: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 70)
  @ApiProperty({ description: 'Meta title for SEO (10-70 characters)' })
  metaTitle: string;

  @IsString()
  @Length(50, 160)
  @ApiProperty({ description: 'Meta description for SEO (50-160 characters)' })
  metaDescription: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Open Graph title' })
  ogTitle: string;

  @IsString()
  @ApiProperty({ description: 'Open Graph description' })
  ogDescription: string;

  @IsString()
  @ApiProperty()
  content: string;
}

export class DeleteTranslationDto {
  @IsString()
  @IsNotEmpty()
  @Validate(IsSupportedLanguageConstraint)
  @ApiProperty({ description: 'Language code of translation to delete', enum: SUPPORTED_LANGUAGES })
  language: string;
}

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @IsString()
  @ApiProperty({ description: 'Main image URL' })
  image: string;

  @IsString()
  @ApiProperty({ description: 'Image alt text for SEO and accessibility' })
  altText: string;

  @IsString()
  @ApiProperty({ description: 'Canonical URL for SEO' })
  canonicalUrl: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-03-03T00:00:00.000Z' })
  date: Date;

  @IsArray()
  @ApiProperty({ type: [BlogTranslationDto] })
  translations: BlogTranslationDto[];
}

export class UpdateBlogDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  slug?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  image?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  altText?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  canonicalUrl?: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ required: false, example: '2025-03-03T00:00:00.000Z' })
  date?: Date;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [BlogTranslationDto], required: false })
  translations?: BlogTranslationDto[];
}