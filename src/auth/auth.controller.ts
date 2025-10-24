import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: LoginDto })
  login(@Body() payload: LoginDto) {
    return this.auth.login(payload);
  }
}
