import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendContactEmailDto {
  @IsEmail()
  @ApiProperty({ description: 'Sender email address', example: 'sender@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ description: 'Sender name', example: 'John Doe' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @ApiProperty({ description: 'Message content', example: 'Hello, I have a question.' })
  content: string;
}