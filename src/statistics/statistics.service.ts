import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistics } from './statistics.entity';
import { CreateStatisticsDto, UpdateStatisticsDto } from './statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
  ) {}

  async create(dto: CreateStatisticsDto): Promise<Statistics> {
    const statistics = this.statisticsRepository.create(dto);
    return this.statisticsRepository.save(statistics);
  }

  async findAll(): Promise<Statistics[]> {
    return this.statisticsRepository.find();
  }

  async findOne(id: number): Promise<Statistics> {
    const statistics = await this.statisticsRepository.findOneBy({ id });
    if (!statistics) throw new NotFoundException('Statistics not found');
    return statistics;
  }

  async update(id: number, dto: UpdateStatisticsDto): Promise<Statistics> {
    const statistics = await this.findOne(id);
    Object.assign(statistics, dto);
    return this.statisticsRepository.save(statistics);
  }

  async remove(id: number): Promise<void> {
    const statistics = await this.findOne(id);
    await this.statisticsRepository.remove(statistics);
  }
}