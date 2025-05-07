import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @MinLength(8)
  @ApiProperty()
  password: string;
}

export class LoginAdminDto {
  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @ApiProperty()
  password: string;
}