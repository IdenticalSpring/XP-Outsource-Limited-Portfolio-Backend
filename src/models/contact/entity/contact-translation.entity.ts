import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Contact } from './contact.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ContactTranslation {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  language: string;

  @Column()
  @ApiProperty()
  address: string;

  @Column()
  @ApiProperty({ description: 'URL-friendly slug for SEO' })
  slug: string;

  @Column({ length: 160 })
  @ApiProperty({ description: 'Meta description for SEO, max 160 characters' })
  metaDescription: string;

  @Column('simple-array')
  @ApiProperty({ description: 'Keywords for SEO' })
  keywords: string[];

  @ManyToOne(() => Contact, (contact) => contact.translations)
  @ApiProperty()
  contact: Contact;
}