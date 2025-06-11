/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterXss } from '@/tools';
import type { Request } from 'express';

type RequestParams = Record<string, any>;

@Injectable()
export class XssSanitizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    if (this.isHandle(request.body as RequestParams)) {
      this.sanitize(request.body as RequestParams);
    }

    if (this.isHandle(request.query)) {
      this.sanitize(request.query);
    }

    if (this.isHandle(request.params)) {
      this.sanitize(request.params);
    }

    return next.handle().pipe(map((data) => data));
  }

  private sanitize(params: RequestParams) {
    const keys = Object.keys(params);
    for (const key of keys) {
      const v = params[key];
      if (typeof v === 'object') {
        this.sanitize(v as RequestParams);
      } else {
        params[key] = this.sanitizeString(v);
      }
    }
  }
  private sanitizeString<T>(value: T): string | T {
    return typeof value === 'string' ? filterXss(value) : value;
  }
  private isHandle(params: RequestParams) {
    const isObj = Object.prototype.toString.call(params) !== '[object Object]';
    if (isObj) return false;
    const keys = Object.keys(params);
    return keys.length > 0;
  }
}
