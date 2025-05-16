import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { resolve } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
        console.log('EMAIL_USER:', config.get('EMAIL_USER'));
        console.log('EMAIL_PASS:', config.get('EMAIL_PASS') ? '[REDACTED]' : 'undefined');
        return {
        transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
            user: config.get('EMAIL_USER'),
            pass: config.get('EMAIL_PASS'),
            },
        },
        defaults: {
            from: `"Your App" <no-reply@yourapp.com>`,
        },
        template: {
            dir: resolve('src/email/templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
        },
        }
    }
    })
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}