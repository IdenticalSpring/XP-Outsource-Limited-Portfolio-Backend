import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendContactEmailDto } from './email.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a contact message to fixed email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Failed to send email' })
  async sendContactEmail(
    @Body() sendContactEmailDto: SendContactEmailDto,
  ): Promise<{ message: string }> {
    await this.emailService.sendContactEmail(
      sendContactEmailDto.email,
      sendContactEmailDto.name,
      sendContactEmailDto.content,
    );
    return { message: 'Email sent successfully' };
  }
}