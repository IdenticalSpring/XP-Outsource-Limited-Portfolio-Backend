import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Statistics } from './statistics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Statistics])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}