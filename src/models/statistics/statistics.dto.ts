import { IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStatisticsDto {
  @IsDate()
  @ApiProperty()
  date: Date;

  @IsNumber()
  @ApiProperty()
  accessCount: number;

  @IsNumber()
  @ApiProperty()
  totalAccessDate: number;

  @IsNumber()
  @ApiProperty()
  totalAccessWeek: number;

  @IsNumber()
  @ApiProperty()
  totalAccessMonth: number;
}

export class UpdateStatisticsDto {
  @IsDate()
  @ApiProperty({ required: false })
  date?: Date;

  @IsNumber()
  @ApiProperty({ required: false })
  accessCount?: number;

  @IsNumber()
  @ApiProperty({ required: false })
  totalAccessDate?: number;

  @IsNumber()
  @ApiProperty({ required: false })
  totalAccessWeek?: number;

  @IsNumber()
  @ApiProperty({ required: false })
  totalAccessMonth?: number;
}