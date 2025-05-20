import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Statistics {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Index() 
  @Column()
  @ApiProperty()
  date: Date;

  @Column()
  @ApiProperty()
  totalAccessDate: number;
}