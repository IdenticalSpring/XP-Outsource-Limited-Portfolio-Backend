import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Banner } from './banner.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['language', 'banner'], { unique: true })
export class BannerTranslation {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the translation' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Language code (e.g., en, vi)' })
  language: string;

  @Column()
  @ApiProperty({ description: 'Banner title' })
  title: string;

  @Column()
  @ApiProperty({ description: 'Banner description' })
  description: string;

  @Column()
  @ApiProperty({ description: 'Meta description for SEO' })
  metaDescription: string;

  @Column('simple-array')
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];

  @Column()
  @ApiProperty({ description: 'Text for the call-to-action button' })
  buttonText: string;

  @Column()
  @ApiProperty({ description: 'Link for the call-to-action button' })
  buttonLink: string;

  @ManyToOne(() => Banner, (banner) => banner.translations, { onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Banner, description: 'Associated banner' })
  banner: Banner;
}