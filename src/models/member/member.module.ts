import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Member } from './entity/member.entity';
import { MemberTranslation } from './entity/member-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, MemberTranslation])],
  providers: [MemberService],
  controllers: [MemberController],
  exports: [MemberService],
})
export class MemberModule {}