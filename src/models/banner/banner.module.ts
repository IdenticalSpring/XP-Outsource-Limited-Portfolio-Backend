import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { Banner } from './entity/banner.entity';
import { BannerTranslation } from './entity/banner-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner,BannerTranslation])],
  providers: [BannerService],
  controllers: [BannerController],
  exports: [BannerService],
})
export class BannerModule {}