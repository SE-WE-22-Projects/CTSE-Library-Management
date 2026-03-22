import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/login-request.dto';
import { RegisterRequest } from './dto/register-request.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() req: LoginRequest) {
    return this.authService.login(req);
  }

  @Post('register')
  register(@Body() req: RegisterRequest) {
    return this.authService.register(req);
  }
}
