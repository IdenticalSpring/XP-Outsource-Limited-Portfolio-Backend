// src/models/blog/blog.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BlogTranslation } from './blog-translation.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @Column()
  @ApiProperty({ description: 'Main image URL' })
  image: string;

  @Column()
  @ApiProperty({ description: 'Image alt text for SEO and accessibility' })
  altText: string;

  @Column()
  @ApiProperty({ description: 'Canonical URL for SEO' })
  canonicalUrl: string;

  @Column()
  @ApiProperty()
  date: Date;

  @Column({ type: 'enum', enum: [1, 2, 3], default: 1 })
  @ApiProperty({
    description: 'Type of blog (1: project, 2: achievements, 3: resources)',
    enum: [1, 2, 3],
    default: 1,
  })
  type: number;

  @OneToMany(() => BlogTranslation, (translation) => translation.blog, {
    cascade: true,
    eager: true,
  })
  @ApiProperty({ type: () => [BlogTranslation] })
  translations: BlogTranslation[];
}
