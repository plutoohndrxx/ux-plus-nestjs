import { Injectable, Logger } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { toBoolean, toNumber } from '../../tools';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  constructor(private configService: ConfigService) {
    // Create an SMTP configuration
    this.transporter = createTransport({
      host: configService.get('SMTP_HOST'), // Replace with your SMTP server address (e.g., smtp.gmail.com)
      port: toNumber(configService.get('SMTP_PORT')!), // SMTP port (usually 465 or 587)
      secure: toBoolean(configService.get('SMTP_SECURE')!), // Set to true if using port 465, otherwise false
      auth: {
        user: configService.get('SMTP_EMAIL'), // Your email address
        pass: configService.get('SMTP_EMAIL_CODE'), // Your email password or app-specific code
      },
      tls: {
        rejectUnauthorized: false, // Avoid SSL certificate errors in some environments (remove in production)
      },
    });
  }
  async sendRegistryCode(email: string, code: string) {
    const subject = 'Registration Verification Code';
    const text = `Your verification code is:${code}`;
    const html = `<p>Hello:</p><p>Your verification code is: <strong>${code}</strong></p>`;
    const mailOptions = {
      from: `"NestJs" <${this.configService.get('SMTP_EMAIL')}`,
      to: email,
      subject,
      text,
      html,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${email}`, err);
      throw err;
    }
  }
}
