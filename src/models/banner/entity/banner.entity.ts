import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BannerTranslation } from './banner-translation.entity'; 

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @Column()
  @ApiProperty({ description: 'Banner image URL' })
  image: string;

  @OneToMany(() => BannerTranslation, (translation) => translation.banner, { cascade: true, eager: true })
  @ApiProperty({ type: () => [BannerTranslation] })
  translations: BannerTranslation[];
}