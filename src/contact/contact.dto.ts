import { IsString, IsEmail, MaxLength, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  mail: string;

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

export class UpdateContactDto {
  @IsString()
  @ApiProperty({ required: false })
  phone?: string;

  @IsString()
  @ApiProperty({ required: false })
  address?: string;

  @IsEmail()
  @ApiProperty({ required: false })
  mail?: string;

  @IsString()
  @ApiProperty({ required: false })
  slug?: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ required: false })
  metaDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false })
  keywords?: string[];
}