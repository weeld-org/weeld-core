import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: LoginDto })
  login(@Body() payload: LoginDto) {
    // mark payload as intentionally unused for now
    void payload;
    // Démo: on simule un succès
    return { access_token: 'demo-token' };
  }
}
