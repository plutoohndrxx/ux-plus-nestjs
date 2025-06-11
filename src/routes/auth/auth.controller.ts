import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth.dto';
import { UxJwtService } from '@/modules/ux-jwt/ux-jwt.service';
import { ApiResponse } from '@/dto/api-response';
import { AuthTokenGuard } from '@/guards';
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly uxJwtService: UxJwtService,
  ) {}
  @HttpCode(200)
  @Post('/login')
  async login(@Body() authLoginDto: AuthLoginDto) {
    const validateResult = await this.authService.validateCredentials(
      authLoginDto.account,
      authLoginDto.password,
    );
    const { id, account, secureid } = validateResult;
    // generate a token
    const token = this.uxJwtService.loginToken({
      id,
      account,
      secureid,
    });
    return new ApiResponse(HttpStatus.OK, 'Login successful', {
      token,
    });
  }
  @Get('list')
  @UseGuards(AuthTokenGuard)
  list() {
    const list = [];
    return new ApiResponse(200, 'success', list);
  }
}
