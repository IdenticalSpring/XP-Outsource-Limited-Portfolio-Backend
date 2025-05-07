import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { Blog } from './entity/blog.entity';
import { BlogTranslation } from './entity/blog-translation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog,BlogTranslation])],
  providers: [BlogService],
  controllers: [BlogController],
})
export class BlogModule {}