import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  @ApiOperation({ summary: '登录（占位）' })
  login(@Body() _body: LoginDto) {
    throw new HttpException(
      { code: 501, message: 'Not implemented', data: null },
      501,
    );
  }
}
