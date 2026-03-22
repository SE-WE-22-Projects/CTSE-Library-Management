import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  login() {
    return this.authService.signJWT({
      user_id: '1',
      session_id: '1',
      permissions: ['aa'],
      username: 'Test User',
    });
  }
}
