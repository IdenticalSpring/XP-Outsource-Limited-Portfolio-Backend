import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
import { CreateMemberDto, UpdateMemberDto } from './member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async create(dto: CreateMemberDto): Promise<Member> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const member = this.memberRepository.create({ ...dto, slug });
    return this.memberRepository.save(member);
  }

  async findAll(): Promise<Member[]> {
    return this.memberRepository.find();
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.memberRepository.findOneBy({ id });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async findBySlug(slug: string): Promise<Member> {
    const member = await this.memberRepository.findOneBy({ slug });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(id: number, dto: UpdateMemberDto): Promise<Member> {
    const member = await this.findOne(id);
    if (dto.name && !dto.slug) {
      dto.slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    Object.assign(member, dto);
    return this.memberRepository.save(member);
  }

  async remove(id: number): Promise<void> {
    const member = await this.findOne(id);
    await this.memberRepository.remove(member);
  }
}