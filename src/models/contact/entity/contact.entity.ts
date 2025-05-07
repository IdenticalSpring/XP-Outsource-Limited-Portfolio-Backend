import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ContactTranslation } from './contact-translation.entity';
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
  mail: string;

  @OneToMany(() => ContactTranslation, (translation) => translation.contact)
  @ApiProperty()
  translations: ContactTranslation[];
}