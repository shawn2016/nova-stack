import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MemberRegisterDto {
  @ApiProperty({ example: '13900139001' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'member123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: '新会员' })
  @IsString()
  @IsOptional()
  nickname?: string;
}
