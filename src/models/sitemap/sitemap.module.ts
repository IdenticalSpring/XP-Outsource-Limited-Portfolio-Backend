import { Module } from '@nestjs/common';
import { SitemapController } from './sitemap.controller';
import { BlogModule } from '../blog/blog.module';
import { BannerModule } from '../banner/banner.module';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [BlogModule, BannerModule, ContactModule],
  controllers: [SitemapController],
})
export class SitemapModule {}