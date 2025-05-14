// src/member/entity/member-translation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Member } from './member.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['language', 'member'], { unique: true })
export class MemberTranslation {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the translation' })
  id: number;

  @Column()
  @ApiProperty({ description: 'Language code (e.g., en, vi)' })
  language: string;

  @Column()
  @ApiProperty({ description: 'Translated name of the member' })
  name: string;

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
  @ApiProperty({ description: 'Translated description of the member' })
  description: string;

  @ManyToOne(() => Member, (member) => member.translations, { onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Member, description: 'Associated member' })
  member: Member;
}