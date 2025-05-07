import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { CreateAdminDto, LoginAdminDto } from './admin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private i18n: I18nService,
  ) {}

  async create(dto: CreateAdminDto): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const admin = this.adminRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return this.adminRepository.save(admin);
  }

  async login(dto: LoginAdminDto): Promise<{ accessToken: string }> {
    const admin = await this.adminRepository.findOneBy({ username: dto.username });
    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException(this.i18n.t('global.WRONG_CREDENTIALS'));
    }
    const payload = { sub: admin.id, username: admin.username };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}