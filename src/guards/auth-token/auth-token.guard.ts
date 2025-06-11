import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UxJwtService } from '@/modules/ux-jwt/ux-jwt.service';
import { RegistryService } from '@/routes/registry/registry.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly uxJwtService: UxJwtService,
    private readonly registryService: RegistryService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const undisposedToken = request.headers['authorization'] as string;
    const message = 'Invalid or expired token.';
    const regex = /^Bearer\s/;
    const token = undisposedToken?.split(' ')?.[1];

    if (
      !undisposedToken ||
      typeof undisposedToken !== 'string' ||
      !regex.test(undisposedToken) ||
      !token
    )
      throw new UnauthorizedException(message);
    const deToken = this.uxJwtService.parseLoginToken(token);

    if (deToken.sub !== this.configService.get('JWT_LOGIN_TOKEN_SUBJECT'))
      throw new UnauthorizedException(message);
    const exist = await this.registryService.findOne(
      {
        id: deToken.id,
        account: deToken.account,
        secureid: deToken.secureid,
      },
      ['account'],
    );
    if (!exist) throw new UnauthorizedException(message);
    return true;
  }
}
