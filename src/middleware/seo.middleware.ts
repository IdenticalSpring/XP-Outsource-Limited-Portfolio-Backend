import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class SeoMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Lấy ngôn ngữ từ I18nContext (dựa trên resolvers trong I18nModule)
    const lang = I18nContext.current()?.lang || 'en';

    // Đặt các header SEO
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Language', lang);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    next();
  }
}