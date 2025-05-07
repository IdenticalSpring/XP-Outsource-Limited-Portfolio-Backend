import { Module } from '@nestjs/common';
import { SitemapController } from './sitemap.controller';
import { BlogModule } from '../blog/blog.module';
import { BannerModule } from '../banner/banner.module';

@Module({
  imports: [BlogModule, BannerModule],
  controllers: [SitemapController],
})
export class SitemapModule {}