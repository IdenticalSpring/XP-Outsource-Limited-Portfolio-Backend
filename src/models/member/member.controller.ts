import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';
import { Member } from './member.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@ApiTags('member')
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create member' })
  @ApiResponse({ status: 201, type: Member })
  create(@Body() dto: CreateMemberDto): Promise<Member> {
    return this.memberService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all members' })
  @ApiResponse({ status: 200, type: [Member] })
  findAll(): Promise<Member[]> {
    return this.memberService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiResponse({ status: 200, type: Member })
  findOne(@Param('id') id: string): Promise<Member> {
    return this.memberService.findOne(+id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get member by slug' })
  @ApiResponse({ status: 200, type: Member })
  findBySlug(@Param('slug') slug: string): Promise<Member> {
    return this.memberService.findBySlug(slug);
  }

  @Get('sitemap')
  @ApiOperation({ summary: 'Get sitemap for SEO' })
  @ApiResponse({ status: 200 })
  async getSitemap(): Promise<{ urls: string[] }> {
    const members = await this.memberService.findAll();
    const urls = members.map(member => `https://yourdomain.com/member/${member.slug}`);
    return { urls };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update member' })
  @ApiResponse({ status: 200, type: Member })
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto): Promise<Member> {
    return this.memberService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete member' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.memberService.remove(+id);
  }
}