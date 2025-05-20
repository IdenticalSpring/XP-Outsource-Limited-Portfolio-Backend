import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateStatisticsDto {
  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  totalAccessDate: number;
}

export class UpdateStatisticsDto {
  @ApiProperty({ required: false })
  @IsDateString()
  date?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  totalAccessDate?: number;
}