import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CreateStatisticsDto, UpdateStatisticsDto } from './statistics.dto';
import { Statistics } from './statistics.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create statistics' })
  @ApiResponse({ status: 201, type: Statistics })
  create(@Body() dto: CreateStatisticsDto): Promise<Statistics> {
    return this.statisticsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all statistics' })
  @ApiResponse({ status: 200, type: [Statistics] })
  findAll(): Promise<Statistics[]> {
    return this.statisticsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get statistics by ID' })
  @ApiResponse({ status: 200, type: Statistics })
  findOne(@Param('id') id: string): Promise<Statistics> {
    return this.statisticsService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update statistics' })
  @ApiResponse({ status: 200, type: Statistics })
  update(@Param('id') id: string, @Body() dto: UpdateStatisticsDto): Promise<Statistics> {
    return this.statisticsService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete statistics' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.statisticsService.remove(+id);
  }
}