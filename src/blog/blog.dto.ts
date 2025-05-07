import { IsString, IsDate, MaxLength, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title_en: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title_vi: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Meta title for SEO (English)' })
  metaTitle_en: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Meta title for SEO (Vietnamese)' })
  metaTitle_vi: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ description: 'Meta description for SEO (English)' })
  metaDescription_en: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ description: 'Meta description for SEO (Vietnamese)' })
  metaDescription_vi: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Keywords for SEO (English)' })
  keywords_en: string[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Keywords for SEO (Vietnamese)' })
  keywords_vi: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Canonical URL for SEO' })
  canonicalUrl: string;

  @IsString()
  @ApiProperty()
  image: string;

  @IsString()
  @ApiProperty()
  content_en: string;

  @IsString()
  @ApiProperty()
  content_vi: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-03-03T00:00:00.000Z' })
  date: Date;
}

export class UpdateBlogDto {
  @IsString()
  @ApiProperty({ required: false })
  title_en?: string;

  @IsString()
  @ApiProperty({ required: false })
  title_vi?: string;

  @IsString()
  @ApiProperty({ required: false })
  slug?: string;

  @IsString()
  @ApiProperty({ required: false })
  metaTitle_en?: string;

  @IsString()
  @ApiProperty({ required: false })
  metaTitle_vi?: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ required: false })
  metaDescription_en?: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ required: false })
  metaDescription_vi?: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false })
  keywords_en?: string[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false })
  keywords_vi?: string[];

  @IsString()
  @ApiProperty({ required: false })
  canonicalUrl?: string;

  @IsString()
  @ApiProperty({ required: false })
  image?: string;

  @IsString()
  @ApiProperty({ required: false })
  content_en?: string;

  @IsString()
  @ApiProperty({ required: false })
  content_vi?: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ required: false, example: '2025-03-03T00:00:00.000Z' })
  date?: Date;
}