import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, LoginAdminDto } from './admin.dto';
import { Admin } from './admin.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register admin' })
  @ApiResponse({ status: 201, type: Admin })
  register(@Body() dto: CreateAdminDto): Promise<Admin> {
    return this.adminService.create(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login admin' })
  @ApiResponse({ status: 200, type: Object })
  login(@Body() dto: LoginAdminDto): Promise<{ accessToken: string }> {
    return this.adminService.login(dto);
  }
}