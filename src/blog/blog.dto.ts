import { IsString, IsDate, MaxLength, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @IsDate()
  @ApiProperty()
  date: Date;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ description: 'Meta description for SEO, max 160 characters' })
  metaDescription: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];

  @IsString()
  @ApiProperty()
  image: string;

  @IsString()
  @ApiProperty()
  content: string;
}

export class UpdateBlogDto {
  @IsString()
  @ApiProperty({ required: false })
  title?: string;

  @IsString()
  @ApiProperty({ required: false })
  slug?: string;

  @IsDate()
  @ApiProperty({ required: false })
  date?: Date;

  @IsString()
  @ApiProperty({ required: false })
  description?: string;

  @IsString()
  @MaxLength(160)
  @ApiProperty({ required: false })
  metaDescription?: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false })
  keywords?: string[];

  @IsString()
  @ApiProperty({ required: false })
  image?: string;

  @IsString()
  @ApiProperty({ required: false })
  content?: string;
}