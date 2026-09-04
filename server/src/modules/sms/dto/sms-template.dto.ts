import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListSmsTemplatesDto {
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

export class CreateSmsTemplateDto {
  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(64)
  name!: string;

  @IsString()
  content!: string;

  @IsString()
  channelId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: 0 | 1;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string | null;
}

export class UpdateSmsTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  channelId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  status?: 0 | 1;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string | null;
}
