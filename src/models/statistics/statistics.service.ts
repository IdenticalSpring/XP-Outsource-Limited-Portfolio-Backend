import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistics } from './statistics.entity';
import { CreateStatisticsDto, UpdateStatisticsDto } from './statistics.dto';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
  ) {}

  async create(dto: CreateStatisticsDto): Promise<Statistics> {
    this.logger.log(`Creating statistics for date: ${dto.date}`);
    try {
      const statistics = this.statisticsRepository.create({
        date: new Date(dto.date),
        totalAccessDate: dto.totalAccessDate || 0,
      });
      return await this.statisticsRepository.save(statistics);
    } catch (error) {
      this.logger.error(`Error creating statistics: ${error.message}`, error.stack);
      throw new BadRequestException('Error creating statistics');
    }
  }

  async incrementStatistics(): Promise<Statistics> {
    this.logger.log('Incrementing statistics for today');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let statistics = await this.statisticsRepository
        .createQueryBuilder('statistics')
        .where('statistics.date >= :start', { start: today })
        .andWhere('statistics.date < :end', { end: tomorrow })
        .getOne();

      if (statistics) {
        statistics.totalAccessDate = (statistics.totalAccessDate || 0) + 1;
      } else {
        statistics = this.statisticsRepository.create({
          date: today,
          totalAccessDate: 1,
        });
      }

      return await this.statisticsRepository.save(statistics);
    } catch (error) {
      this.logger.error(`Error incrementing statistics: ${error.message}`, error.stack);
      throw new BadRequestException('Error incrementing statistics');
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Statistics[]; total: number; page: number; limit: number }> {
    this.logger.log(`Fetching all statistics with page=${page}, limit=${limit}`);
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await this.statisticsRepository.findAndCount({
        skip,
        take: limit,
        order: { date: 'DESC' }, // Sắp xếp theo ngày giảm dần
      });

      this.logger.debug(`Found ${data.length} statistics, total: ${total}`);
      return { data, total, page, limit };
    } catch (error) {
      this.logger.error(`Error fetching all statistics: ${error.message}`, error.stack);
      throw new BadRequestException('Error fetching statistics');
    }
  }

  async findByDateRange(start: Date, end: Date): Promise<Statistics[]> {
    this.logger.log(`Fetching statistics from ${start} to ${end}`);
    try {
      return await this.statisticsRepository
        .createQueryBuilder('statistics')
        .where('statistics.date >= :start', { start })
        .andWhere('statistics.date <= :end', { end })
        .orderBy('statistics.date', 'ASC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error fetching statistics by date range: ${error.message}`, error.stack);
      throw new BadRequestException('Error fetching statistics by date range');
    }
  }

  async getWeeklyTotal(date: Date): Promise<number> {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const stats = await this.findByDateRange(startOfWeek, endOfWeek);
    return stats.reduce((total, stat) => total + (stat.totalAccessDate || 0), 0);
  }

  async getMonthlyTotal(date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    endOfMonth.setHours(0, 0, 0, 0);

    const stats = await this.findByDateRange(startOfMonth, endOfMonth);
    return stats.reduce((total, stat) => total + (stat.totalAccessDate || 0), 0);
  }

  async findOne(id: number): Promise<Statistics> {
    this.logger.log(`Fetching statistics with id ${id}`);
    try {
      const statistics = await this.statisticsRepository.findOne({ where: { id } });
      if (!statistics) {
        throw new NotFoundException('Statistics not found');
      }
      return statistics;
    } catch (error) {
      this.logger.error(`Error fetching statistics ${id}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException('Error fetching statistics');
    }
  }

  async update(id: number, dto: UpdateStatisticsDto): Promise<Statistics> {
    this.logger.log(`Updating statistics with id ${id}`);
    try {
      const statistics = await this.findOne(id);
      Object.assign(statistics, {
        date: dto.date ? new Date(dto.date) : statistics.date,
        totalAccessDate: dto.totalAccessDate ?? statistics.totalAccessDate,
      });
      return await this.statisticsRepository.save(statistics);
    } catch (error) {
      this.logger.error(`Error updating statistics ${id}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException('Error updating statistics');
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting statistics with id ${id}`);
    try {
      const statistics = await this.findOne(id);
      await this.statisticsRepository.remove(statistics);
    } catch (error) {
      this.logger.error(`Error deleting statistics ${id}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException('Error deleting statistics');
    }
  }
}