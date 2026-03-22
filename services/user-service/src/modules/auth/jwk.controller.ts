import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('.well-known')
export class JwkController {
  constructor(private readonly authService: AuthService) {}

  @Get('jwks.json')
  getJwks() {
    return this.authService.getJwks();
  }
}
