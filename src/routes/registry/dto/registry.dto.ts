import { IsString, IsNotEmpty, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegistryUserDto {
  @ApiProperty({
    description: 'User account',
    example: 'johndoe',
  })
  @IsString({ message: 'The account must be a string' })
  @IsNotEmpty({ message: 'Account cannot be empty' })
  account: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  password: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Verification code',
    example: '123456',
  })
  @IsString({ message: 'Verification code must be a string' })
  @IsNotEmpty({ message: 'Verification code cannot be empty' })
  code: string;
}
