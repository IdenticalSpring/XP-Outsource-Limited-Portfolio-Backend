import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Statistics {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @ApiProperty()
  date: Date;

  @Column()
  @ApiProperty()
  accessCount: number;

  @Column()
  @ApiProperty()
  totalAccessDate: number;

  @Column()
  @ApiProperty()
  totalAccessWeek: number;

  @Column()
  @ApiProperty()
  totalAccessMonth: number;
}