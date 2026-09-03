import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EMAIL_PROVIDERS } from '../email.utils';

export class ListEmailChannelsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}

export class CreateEmailChannelDto {
  @IsString()
  @MaxLength(64)
  name!: string;

  @IsIn(EMAIL_PROVIDERS)
  provider!: string;

  @IsString()
  config!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: 0 | 1;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string | null;
}

export class UpdateEmailChannelDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsIn(EMAIL_PROVIDERS)
  provider?: string;

  @IsOptional()
  @IsString()
  config?: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: 0 | 1;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string | null;
}
