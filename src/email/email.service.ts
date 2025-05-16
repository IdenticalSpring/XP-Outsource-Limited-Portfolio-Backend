import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {
    // Log credentials in development only
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`EMAIL_USER: ${process.env.EMAIL_USER}`);
      this.logger.debug(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '[REDACTED]' : 'undefined'}`);
    }
  }

  async sendContactEmail(
    senderEmail: string,
    name: string,
    content: string,
  ): Promise<void> {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.logger.error('Missing EMAIL_USER or EMAIL_PASS in environment variables');
      throw new Error('Missing email credentials');
    }

    try {
      await this.mailerService.sendMail({
        to: process.env.EMAIL_USER2, 
        subject: `New Message from ${name} (${senderEmail})`,
        template: 'contact-email', 
        context: {
          senderEmail,
          name,
          content,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}