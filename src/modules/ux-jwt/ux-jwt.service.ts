import { UnauthorizedException, HttpStatus, Injectable } from '@nestjs/common';
import {
  JwtService,
  TokenExpiredError,
  NotBeforeError,
  JsonWebTokenError,
  JwtVerifyOptions,
} from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { LoginToken } from './types';

type E =
  | InstanceType<typeof TokenExpiredError>
  | InstanceType<typeof NotBeforeError>
  | InstanceType<typeof JsonWebTokenError>;
type VerifyCodeError = {
  name: string;
  message: string;
  code: number;
};

const handleError = (err: E): VerifyCodeError => {
  if (err.name === 'TokenExpiredError') {
    // Token has expired
    return {
      name: 'TokenExpiredError',
      message: 'Token expired',
      code: HttpStatus.UNAUTHORIZED,
    };
  } else if (err.name === 'JsonWebTokenError') {
    // Invalid signature, format error, etc.
    return {
      name: 'JsonWebTokenError',
      message: 'Invalid token signature or malformed token',
      code: HttpStatus.BAD_REQUEST,
    };
  } else if (err.name === 'NotBeforeError') {
    // Token is not yet valid (nbf is set)
    return {
      name: 'NotBeforeError',
      message: 'Token not active yet',
      code: HttpStatus.UNAUTHORIZED,
    };
  } else if (err.name === 'JwtInvalidSubjectError') {
    // Subject mismatch (subject does not match)
    return {
      name: 'JwtInvalidSubjectError',
      message: 'Token subject does not match expected value',
      code: HttpStatus.BAD_REQUEST,
    };
  }
  return {
    name: 'UnknownJwtError',
    message: err.message || 'Unknown JWT verification error',
    code: HttpStatus.INTERNAL_SERVER_ERROR,
  };
};

@Injectable()
export class UxJwtService {
  codeSubject: string = 'emailcode';
  tokenSubject: string = 'nestjs-token';
  constructor(
    public readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * generate a verification code
   *
   * @param {string} code
   * @returns {string}
   */
  enCode(code: string): string {
    return this.jwtService.sign(
      {
        code,
      },
      {
        expiresIn: this.configService.get('JWT_REGISTRY_CODE_EXPIRES'),
        subject: this.codeSubject,
      },
    );
  }

  /**
   * validate the verification code token and return a structured result
   *
   * @param {string} codeToken
   * @returns {{ data: string; err: UnauthorizedException | null; }}
   */
  parseCode(codeToken: string) {
    const r = verifyKit<{
      code: string;
    }>(this.jwtService, codeToken, {
      subject: this.codeSubject,
    });
    const code = r.data?.code;
    return {
      data: code,
      err: r.err ? new UnauthorizedException(r.err.message) : null,
    };
  }

  /**
   * Generate a login token
   *
   * @param {LoginToken} payload
   * @returns {string}
   */
  loginToken(payload: LoginToken) {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_LOGIN_TOKEN_EXPIRES'),
      subject: this.tokenSubject,
    });
  }

  /**
   * validate the login token
   *
   * @param {string} token
   * @returns {LoginToken}
   */
  parseLoginToken(token: string) {
    const { err, data } = verifyKit<LoginToken>(this.jwtService, token, {
      subject: this.tokenSubject,
    });
    if (err) throw new UnauthorizedException(err.message);
    return data;
  }
}

export function verifyKit<T extends object>(
  jwtService: JwtService,
  token: string,
  opt?: JwtVerifyOptions,
) {
  try {
    const decoded = jwtService.verify<
      T & {
        iat: number;
        exp: number;
        sub?: string;
      }
    >(token, opt);
    return { data: decoded, err: null };
  } catch (err) {
    const failObj = handleError(err as E);
    return { data: null, err: failObj };
  }
}
