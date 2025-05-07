import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  image: string;
}

export class UpdateBannerDto {
  @IsString()
  @ApiProperty({ required: false })
  title?: string;

  @IsString()
  @ApiProperty({ required: false })
  description?: string;

  @IsString()
  @ApiProperty({ required: false })
  image?: string;
}