import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { Banner } from './banner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner])],
  providers: [BannerService],
  controllers: [BannerController],
})
export class BannerModule {}