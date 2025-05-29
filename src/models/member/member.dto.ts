// src/member/member.dto.ts
import {
  IsString,
  MaxLength,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MemberTranslationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Language code (e.g., en, vi)' })
  language: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Translated name of the member' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Meta title for SEO' })
  metaTitle: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ description: 'Meta description for SEO, max 160 characters' })
  metaDescription: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Translated description of the member' })
  description: string;
}

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL or path to member image' })
  image: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string; // Thêm slug

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Indicates if the member is active',
    default: true,
  })
  isActive?: boolean;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ description: 'Canonical URL for SEO', required: false })
  canonicalUrl?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: 'Is core member?', default: false })
  core?: boolean;

  @IsArray()
  @ApiProperty({
    type: [MemberTranslationDto],
    description: 'List of translations',
  })
  translations: MemberTranslationDto[];
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'URL or path to member image', required: false })
  image?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'URL-friendly slug for SEO', required: false })
  slug?: string; // Thêm slug

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    description: 'Indicates if the member is active',
    required: false,
  })
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ description: 'Is core member?', default: false })
  core?: boolean;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ description: 'Canonical URL for SEO', required: false })
  canonicalUrl?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    type: [MemberTranslationDto],
    required: false,
    description: 'List of translations',
  })
  translations?: MemberTranslationDto[];
}
