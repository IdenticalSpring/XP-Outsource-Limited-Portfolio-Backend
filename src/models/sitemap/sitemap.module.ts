import { Module } from '@nestjs/common';
import { SitemapController } from './sitemap.controller';
import { BlogModule } from '../blog/blog.module';
import { BannerModule } from '../banner/banner.module';
import { ContactModule } from '../contact/contact.module';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [BlogModule, BannerModule, ContactModule, MemberModule],
  controllers: [SitemapController],
})
export class SitemapModule {}