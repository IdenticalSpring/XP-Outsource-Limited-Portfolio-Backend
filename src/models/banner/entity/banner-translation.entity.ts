import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Banner } from './banner.entity';

@Entity()
export class BannerTranslation {
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
  @ApiProperty({ description: 'Banner description' })
  description: string;

  @Column()
  @ApiProperty({ description: 'Meta description for SEO' })
  metaDescription: string;

  @Column('simple-array')
  @ApiProperty({ description: 'SEO keywords' })
  keywords: string[];

  @ManyToOne(() => Banner, (banner) => banner.translations, { onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Banner })
  banner: Banner;
}