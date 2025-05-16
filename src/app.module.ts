import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import { StatisticsModule } from './models/statistics/statistics.module';
import { BannerModule } from './models/banner/banner.module';
import { BlogModule } from './models/blog/blog.module';
import { ContactModule } from './models/contact/contact.module';
import { MemberModule } from './models/member/member.module';
import { AdminModule } from './models/admin/admin.module';
import * as path from 'path';
import { SitemapModule } from './models/sitemap/sitemap.module';
import { ImagesModule } from './models/images/images.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../src/i18n/'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang']),
        new HeaderResolver(['content-language']),
      ],
      fallbacks: {
        vi: 'vi/global.json', // Chỉ định rõ file global.json cho ngôn ngữ 'vi'
        en: 'en/global.json', // Tương tự cho tiếng Anh
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'nestjs_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: ['error', 'query'],
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return {
          global: true,
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
      inject: [ConfigService],
    }),
    StatisticsModule,
    BannerModule,
    BlogModule,
    ContactModule,
    MemberModule,
    AdminModule,
    SitemapModule,
    ImagesModule,
    EmailModule,
  ],
})
export class AppModule {}