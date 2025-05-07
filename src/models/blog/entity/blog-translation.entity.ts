// src/models/blog/blog-translation.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Blog } from './blog.entity';

@Entity()
export class BlogTranslation {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty({ description: 'Language code (e.g., en, vi)' })
  language: string;

  @Column()
  @ApiProperty()
  title: string;

  @Column()
  @ApiProperty({ description: 'Meta title for SEO' })
  metaTitle: string;

  @Column({ length: 160 })
  @ApiProperty({ description: 'Meta description for SEO' })
  metaDescription: string;

  @Column()
  @ApiProperty({ description: 'Open Graph title' })
  ogTitle: string;

  @Column()
  @ApiProperty({ description: 'Open Graph description' })
  ogDescription: string;

  @Column('text')
  @ApiProperty()
  content: string;

  @ManyToOne(() => Blog, (blog) => blog.translations, { onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Blog })
  blog: Blog;
}