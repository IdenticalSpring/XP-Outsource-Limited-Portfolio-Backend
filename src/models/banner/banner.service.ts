import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banner.entity';
import { CreateBannerDto, UpdateBannerDto } from './banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private bannerRepository: Repository<Banner>,
  ) {}

  async create(dto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepository.create(dto);
    return this.bannerRepository.save(banner);
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerRepository.find();
  }

  async findOne(id: number): Promise<Banner> {
    const banner = await this.bannerRepository.findOneBy({ id });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async update(id: number, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);
    Object.assign(banner, dto);
    return this.bannerRepository.save(banner);
  }

  async remove(id: number): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepository.remove(banner);
  }
}