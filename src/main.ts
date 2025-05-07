import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SeoMiddleware } from './middleware/seo.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use('/blog', new SeoMiddleware().use);
  app.use('/banner', new SeoMiddleware().use);
  app.use('/contact', new SeoMiddleware().use);
  app.use('/member', new SeoMiddleware().use);
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Portflio API')
    .setDescription('API for managing Statistics, Banner, Blog, Contact, Member, and Admin')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();