import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const WEAK_JWT_SECRETS = new Set(['', 'change-me-in-production']);

function assertProductionJwtSecret(
  nodeEnv: Environment,
  jwtSecret: string,
): void {
  if (nodeEnv !== Environment.Production) {
    return;
  }

  if (
    WEAK_JWT_SECRETS.has(jwtSecret) ||
    jwtSecret.length < 32
  ) {
    throw new Error(
      'JWT_SECRET must be set to a strong secret (at least 32 characters) in production',
    );
  }
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  PORT = 3000;

  @IsString()
  @IsOptional()
  DB_HOST = 'localhost';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  DB_PORT = 3306;

  @IsString()
  @IsOptional()
  DB_USERNAME = 'root';

  @IsString()
  @IsOptional()
  DB_PASSWORD = '';

  @IsString()
  @IsOptional()
  DB_DATABASE = 'nova_stack';

  @IsString()
  @IsOptional()
  REDIS_HOST = 'localhost';

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  REDIS_PORT = 6379;

  @IsString()
  @IsOptional()
  JWT_SECRET = 'change-me-in-production';

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN = '7d';

  @IsOptional()
  SKIP_EXTERNAL_SERVICES?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  assertProductionJwtSecret(validatedConfig.NODE_ENV, validatedConfig.JWT_SECRET);

  return validatedConfig;
}
