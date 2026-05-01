import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/login-request.dto';
import { RegisterRequest } from './dto/register-request.dto';
import { type Request as Req, type Response } from 'express';

@Controller('/api/auth')
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

  @Get('validate')
  async validate(@Request() req: Req, @Res() response: Response) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return response
        .status(401)
        .json({ error: 'Missing or malformed Authorization header' });
    }

    const token = header.slice(7);

    if (await this.authService.validate(token)) {
      response.sendStatus(HttpStatus.OK);
    } else {
      response.sendStatus(HttpStatus.UNAUTHORIZED);
    }
  }
}
