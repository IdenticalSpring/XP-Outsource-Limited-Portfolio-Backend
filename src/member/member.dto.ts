import { IsString, MaxLength, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  image: string;

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

export class UpdateMemberDto {
  @IsString()
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @ApiProperty({ required: false })
  description?: string;

  @IsString()
  @ApiProperty({ required: false })
  image?: string;

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