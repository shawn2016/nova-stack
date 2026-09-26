import { IsInt, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEmailLogsDto {
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
  to?: string;

  @IsOptional()
  @IsString()
  templateCode?: string;
}

export class SendEmailDto {
  @IsString()
  @MaxLength(128)
  to!: string;

  @IsString()
  @MaxLength(64)
  templateCode!: string;

  @IsObject()
  params!: Record<string, string>;
}
