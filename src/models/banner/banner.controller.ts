import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto } from './banner.dto';
import { Banner } from './banner.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard'; 

@ApiTags('banner')
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create banner' })
  @ApiResponse({ status: 201, type: Banner })
  create(@Body() dto: CreateBannerDto): Promise<Banner> {
    return this.bannerService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all banners' })
  @ApiResponse({ status: 200, type: [Banner] })
  findAll(): Promise<Banner[]> {
    return this.bannerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  @ApiResponse({ status: 200, type: Banner })
  findOne(@Param('id') id: string): Promise<Banner> {
    return this.bannerService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner' })
  @ApiResponse({ status: 200, type: Banner })
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto): Promise<Banner> {
    return this.bannerService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete banner' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.bannerService.remove(+id);
  }
}