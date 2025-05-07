import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BannerTranslationDto {
  @IsString()
  @ApiProperty()
  language: string;

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  metaDescription: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  keywords: string[];
}

export class CreateBannerDto {
  @IsString()
  @ApiProperty()
  slug: string;

  @IsString()
  @ApiProperty()
  image: string;

  @IsArray()
  @ApiProperty({ type: [BannerTranslationDto] })
  translations: BannerTranslationDto[];
}

export class UpdateBannerDto {
  @IsString()
  @ApiProperty({ required: false })
  slug?: string;

  @IsString()
  @ApiProperty({ required: false })
  image?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [BannerTranslationDto], required: false })
  translations?: BannerTranslationDto[];
}