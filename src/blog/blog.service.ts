import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) {}

  async create(dto: CreateBlogDto): Promise<Blog> {
    const slug = dto.slug || dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const blog = this.blogRepository.create({ ...dto, slug });
    return this.blogRepository.save(blog);
  }

  async findAll(): Promise<Blog[]> {
    return this.blogRepository.find();
  }

  async findOne(id: number): Promise<Blog> {
    const blog = await this.blogRepository.findOneBy({ id });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogRepository.findOneBy({ slug });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async update(id: number, dto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.findOne(id);
    if (dto.title && !dto.slug) {
      dto.slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    Object.assign(blog, dto);
    return this.blogRepository.save(blog);
  }

  async remove(id: number): Promise<void> {
    const blog = await this.findOne(id);
    await this.blogRepository.remove(blog);
  }
}