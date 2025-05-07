import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Member } from './member.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class MemberTranslation {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  language: string;

  @Column()
  @ApiProperty()
  name: string;

  @Column()
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @Column()
  @ApiProperty({ description: 'Meta title for SEO' })
  metaTitle: string;

  @Column({ length: 160 })
  @ApiProperty({ description: 'Meta description for SEO, max 160 characters' })
  metaDescription: string;

  @Column('simple-array')
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];

  @Column()
  @ApiProperty({ description: 'Canonical URL for SEO' })
  canonicalUrl: string;

  @Column()
  @ApiProperty()
  description: string;

  @ManyToOne(() => Member, (member) => member.translations)
  @ApiProperty()
  member: Member;
}