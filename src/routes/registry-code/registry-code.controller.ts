import {
  Controller,
  Post,
  Body,
  Logger,
  HttpStatus,
  Inject,
  forwardRef,
  HttpException,
} from '@nestjs/common';
import { EmailService } from '@/services/email/email.service';
import { RegistryCodeService } from './registry-code.service';
import { generateCode } from '@/tools';
import { ApiResponse } from '@/dto/api-response';
import { SendRegistryCodeDto } from './dto/registry-code.dto';
import { RegistryService } from '@/routes/registry/registry.service';

@Controller({
  path: 'registry/code',
  version: '1',
})
export class RegistryCodeController {
  private readonly logger = new Logger(RegistryCodeController.name);
  constructor(
    private readonly emailService: EmailService,
    private readonly registryCodeService: RegistryCodeService,
    @Inject(forwardRef(() => RegistryService))
    private readonly registryService: RegistryService,
  ) {}
  @Post()
  async code(@Body() sendRegistryCodeDto: SendRegistryCodeDto) {
    try {
      const { email } = sendRegistryCodeDto;
      const exist = await this.registryService.fromEmailToUser(email, ['id']);
      if (exist)
        throw new HttpException(
          'This email is already registered',
          HttpStatus.BAD_REQUEST,
        );
      const code = generateCode();
      const insertEmailCodeResult =
        await this.registryCodeService.insertEmailCode(email, code);
      if (!insertEmailCodeResult)
        throw new HttpException(
          'Failed to obtain the verification code',
          HttpStatus.BAD_REQUEST,
        );
      await this.emailService.sendRegistryCode(email, code);
      return new ApiResponse(
        HttpStatus.OK,
        'The verification code has been sent to your email address. Please check your inbox',
      );
    } catch (err) {
      this.logger.error(err.message, err);
      return {
        code: 400,
        message: err.message as string,
      };
    }
  }
}
