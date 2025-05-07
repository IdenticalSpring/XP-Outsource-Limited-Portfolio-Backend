import { IsString, MaxLength, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MemberTranslationDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  language: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

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
  @ApiProperty({ description: 'Canonical URL for SEO' })
  canonicalUrl: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;
}

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  image: string;

  @IsArray()
  @ApiProperty({ type: [MemberTranslationDto] })
  translations: MemberTranslationDto[];
}

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  image?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [MemberTranslationDto], required: false })
  translations?: MemberTranslationDto[];
}