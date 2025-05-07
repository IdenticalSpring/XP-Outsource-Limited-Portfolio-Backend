import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { Contact } from './entity/contact.entity';
import { ContactTranslation } from './entity/contact-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact,ContactTranslation])],
  providers: [ContactService],
  controllers: [ContactController],
  exports: [ContactService],
})
export class ContactModule {}