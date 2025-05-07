import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  title_en: string;

  @Column()
  @ApiProperty()
  title_vi: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @Column()
  @ApiProperty({ description: 'Meta title for SEO (English)' })
  metaTitle_en: string;

  @Column()
  @ApiProperty({ description: 'Meta title for SEO (Vietnamese)' })
  metaTitle_vi: string;

  @Column({ length: 160 })
  @ApiProperty({ description: 'Meta description for SEO (English)' })
  metaDescription_en: string;

  @Column({ length: 160 })
  @ApiProperty({ description: 'Meta description for SEO (Vietnamese)' })
  metaDescription_vi: string;

  @Column('simple-array')
  @ApiProperty({ description: 'Keywords for SEO (English)' })
  keywords_en: string[];

  @Column('simple-array')
  @ApiProperty({ description: 'Keywords for SEO (Vietnamese)' })
  keywords_vi: string[];

  @Column()
  @ApiProperty({ description: 'Canonical URL for SEO' })
  canonicalUrl: string;

  @Column()
  @ApiProperty()
  image: string;

  @Column('text')
  @ApiProperty()
  content_en: string;

  @Column('text')
  @ApiProperty()
  content_vi: string;

  @Column()
  @ApiProperty()
  date: Date;
}