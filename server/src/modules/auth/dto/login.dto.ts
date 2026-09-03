import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { AdminLoginRequest } from '@nova/shared-types';

export class LoginDto implements AdminLoginRequest {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
