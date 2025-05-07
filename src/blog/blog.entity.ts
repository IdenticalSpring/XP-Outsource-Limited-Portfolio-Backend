import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  title: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @Column()
  @ApiProperty()
  date: Date;

  @Column()
  @ApiProperty()
  description: string;

  @Column({ length: 160 })
  @ApiProperty({ description: 'Meta description for SEO, max 160 characters' })
  metaDescription: string;

  @Column('simple-array')
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];

  @Column()
  @ApiProperty()
  image: string;

  @Column('text')
  @ApiProperty()
  content: string;
}