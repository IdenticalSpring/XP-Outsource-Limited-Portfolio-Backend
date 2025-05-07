import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MemberTranslation } from './member-translation.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  image: string;

  @OneToMany(() => MemberTranslation, (translation) => translation.member)
  @ApiProperty()
  translations: MemberTranslation[];
}