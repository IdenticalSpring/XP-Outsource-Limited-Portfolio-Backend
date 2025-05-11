import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BannerTranslationDto {
  @IsString()
  @ApiProperty({ description: 'Language code (e.g., en, vi)' })
  language: string;

  @IsString()
  @ApiProperty({ description: 'Banner title' })
  title: string;

  @IsString()
  @ApiProperty({ description: 'Banner description' })
  description: string;

  @IsString()
  @ApiProperty({ description: 'Meta description for SEO' })
  metaDescription: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];

  @IsString()
  @ApiProperty({ description: 'Text for the call-to-action button' })
  buttonText: string;

  @IsString()
  @ApiProperty({ description: 'Link for the call-to-action button' })
  buttonLink: string;
}

export class CreateBannerDto {
  @IsString()
  @ApiProperty({ description: 'URL-friendly slug' })
  slug: string;

  @IsString()
  @ApiProperty({ description: 'URL or path to banner image' })
  image: string;

  @IsArray()
  @ApiProperty({ type: [BannerTranslationDto], description: 'List of translations' })
  translations: BannerTranslationDto[];
}

export class UpdateBannerDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'URL-friendly slug', required: false })
  slug?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'URL or path to banner image', required: false })
  image?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [BannerTranslationDto], required: false, description: 'List of translations' })
  translations?: BannerTranslationDto[];
}