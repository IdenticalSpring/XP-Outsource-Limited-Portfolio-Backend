import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MemberTranslation } from './member-translation.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the member' })
  id: number;

  @Column()
  @ApiProperty({ description: 'URL or path to member image' })
  image: string;

  @Column({ default: true })
  @ApiProperty({ description: 'Indicates if the member is active' })
  isActive: boolean;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Canonical URL for SEO (if not language-specific)', required: false })
  canonicalUrl: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the member was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Timestamp when the member was last updated' })
  updatedAt: Date;

  @OneToMany(() => MemberTranslation, (translation) => translation.member)
  @ApiProperty({ type: () => MemberTranslation, isArray: true, description: 'List of translations for the member' })
  translations: MemberTranslation[];
}