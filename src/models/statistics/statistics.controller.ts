import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CreateStatisticsDto, UpdateStatisticsDto } from './statistics.dto';
import { Statistics } from './statistics.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Logger } from '@nestjs/common';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  private readonly logger = new Logger(StatisticsController.name);

  constructor(private readonly statisticsService: StatisticsService) {}

  private validateNumberParam(param: string, paramName: string, i18n: I18nContext): number {
    const num = parseInt(param, 10);
    if (isNaN(num) || num <= 0) {
      this.logger.warn(`Invalid ${paramName}: ${param}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_NUMBER_PARAM', { args: { param: paramName } }));
    }
    return num;
  }

  private validateDateParam(param: string, paramName: string, i18n: I18nContext): Date {
    const date = new Date(param);
    if (isNaN(date.getTime())) {
      this.logger.warn(`Invalid ${paramName}: ${param}`);
      throw new BadRequestException(i18n.t('global.global.INVALID_DATE_PARAM', { args: { param: paramName } }));
    }
    return date;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create statistics' })
  @ApiResponse({ status: 201, type: Statistics })
  async create(@Body() dto: CreateStatisticsDto, @I18n() i18n: I18nContext): Promise<Statistics> {
    this.logger.log(`Creating statistics for date: ${dto.date}`);
    try {
      const date = new Date(dto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(i18n.t('global.global.INVALID_DATE_PARAM', { args: { param: 'date' } }));
      }
      if (dto.totalAccessDate < 0) {
        throw new BadRequestException(i18n.t('global.global.INVALID_STATISTICS_VALUE'));
      }
      return await this.statisticsService.create(dto);
    } catch (error) {
      this.logger.error(`Error creating statistics: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Post('increment')
  @ApiOperation({ summary: 'Increment statistics for today' })
  @ApiResponse({ status: 201, type: Statistics })
  async incrementStatistics(@I18n() i18n: I18nContext): Promise<Statistics> {
    this.logger.log('Incrementing statistics for today');
    try {
      return await this.statisticsService.incrementStatistics();
    } catch (error) {
      this.logger.error(`Error incrementing statistics: ${error.message}`, error.stack);
      throw new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all statistics with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Returns paginated statistics' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @I18n() i18n: I18nContext
  ): Promise<{ data: Statistics[]; total: number; page: number; limit: number }> {
    this.logger.log(`Fetching all statistics with page=${page}, limit=${limit}`);
    try {
      const pageNum = this.validateNumberParam(page, 'page', i18n);
      const limitNum = this.validateNumberParam(limit, 'limit', i18n);
      return await this.statisticsService.findAll(pageNum, limitNum);
    } catch (error) {
      this.logger.error(`Error fetching all statistics: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('range')
  @ApiOperation({ summary: 'Get statistics by date range' })
  @ApiResponse({ status: 200, type: [Statistics] })
  async findByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
    @I18n() i18n: I18nContext
  ): Promise<Statistics[]> {
    this.logger.log(`Fetching statistics for date range: ${start} to ${end}`);
    try {
      const startDate = this.validateDateParam(start, 'start', i18n);
      const endDate = this.validateDateParam(end, 'end', i18n);
      if (startDate > endDate) {
        throw new BadRequestException(i18n.t('global.global.INVALID_DATE_RANGE'));
      }
      return await this.statisticsService.findByDateRange(startDate, endDate);
    } catch (error) {
      this.logger.error(`Error fetching statistics by date range: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('weekly-total')
  @ApiOperation({ summary: 'Get total accesses for the week of a given date' })
  @ApiResponse({ status: 200, type: Number })
  async getWeeklyTotal(
    @Query('date') date: string,
    @I18n() i18n: I18nContext
  ): Promise<number> {
    this.logger.log(`Fetching weekly total for date: ${date}`);
    try {
      const targetDate = this.validateDateParam(date, 'date', i18n);
      return await this.statisticsService.getWeeklyTotal(targetDate);
    } catch (error) {
      this.logger.error(`Error fetching weekly total: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get('monthly-total')
  @ApiOperation({ summary: 'Get total accesses for the month of a given date' })
  @ApiResponse({ status: 200, type: Number })
  async getMonthlyTotal(
    @Query('date') date: string,
    @I18n() i18n: I18nContext
  ): Promise<number> {
    this.logger.log(`Fetching monthly total for date: ${date}`);
    try {
      const targetDate = this.validateDateParam(date, 'date', i18n);
      return await this.statisticsService.getMonthlyTotal(targetDate);
    } catch (error) {
      this.logger.error(`Error fetching monthly total: ${error.message}`, error.stack);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get statistics by ID' })
  @ApiResponse({ status: 200, type: Statistics })
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<Statistics> {
    const statisticsId = this.validateNumberParam(id, 'id', i18n);
    try {
      return await this.statisticsService.findOne(statisticsId);
    } catch (error) {
      this.logger.error(`Error fetching statistics ${statisticsId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update statistics' })
  @ApiResponse({ status: 200, type: Statistics })
  async update(@Param('id') id: string, @Body() dto: UpdateStatisticsDto, @I18n() i18n: I18nContext): Promise<Statistics> {
    const statisticsId = this.validateNumberParam(id, 'id', i18n);
    try {
      if (dto.totalAccessDate && dto.totalAccessDate < 0) {
        throw new BadRequestException(i18n.t('global.global.INVALID_STATISTICS_VALUE'));
      }
      if (dto.date) {
        const date = new Date(dto.date);
        if (isNaN(date.getTime())) {
          throw new BadRequestException(i18n.t('global.global.INVALID_DATE_PARAM', { args: { param: 'date' } }));
        }
      }
      return await this.statisticsService.update(statisticsId, dto);
    } catch (error) {
      this.logger.error(`Error updating statistics ${statisticsId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete statistics' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @I18n() i18n: I18nContext): Promise<void> {
    const statisticsId = this.validateNumberParam(id, 'id', i18n);
    try {
      await this.statisticsService.remove(statisticsId);
    } catch (error) {
      this.logger.error(`Error deleting statistics ${statisticsId}: ${error.message}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException(i18n.t('global.global.INTERNAL_ERROR'));
    }
  }
}