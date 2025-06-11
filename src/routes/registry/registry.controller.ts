import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RegistryUserDto } from './dto/registry.dto';
import { RegistryService } from './registry.service';
import { UxCryptoRsaService } from '@/services/ux-crypto-rsa/ux-crypto-rsa.service';
@Controller({
  path: 'registry',
  version: '1',
})
export class RegistryController {
  constructor(
    private readonly registryService: RegistryService,
    private readonly uxCryptoRsaService: UxCryptoRsaService,
  ) {}
  @Post('user')
  async user(@Body() body: RegistryUserDto) {
    try {
      body.password = this.uxCryptoRsaService.decrypt(body.password);
    } catch (err) {
      throw new HttpException('failed', HttpStatus.BAD_REQUEST);
    }
    return await this.registryService.registryUser(body);
  }
}
