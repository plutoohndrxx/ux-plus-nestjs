import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendRegistryCodeDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsString({ message: 'Email must be a string' })
  email: string;
}

export class RegistryCodeTestDto extends SendRegistryCodeDto {
  @ApiProperty({
    description: 'Registration verification code',
    example: '123456',
  })
  @IsNotEmpty({ message: 'Verification code cannot be empty' })
  @IsString({ message: 'Verification code must be a string' })
  @MinLength(6, {
    message: 'The verification code must be at least 6 characters long',
  })
  code: string;
}
