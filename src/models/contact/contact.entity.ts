import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  phone: string;

  @Column()
  @ApiProperty()
  address: string;

  @Column()
  @ApiProperty()
  mail: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @Column({ length: 160 })
  @ApiProperty({ description: 'Meta description for SEO, max 160 characters' })
  metaDescription: string;

  @Column('simple-array')
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];
}