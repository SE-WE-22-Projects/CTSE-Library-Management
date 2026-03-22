import { Controller, Get } from '@nestjs/common/decorators';
import { version } from '../../../package.json';
import { HealthDto } from './dto/health.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('/api/health')
export class HealthController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Get service status' })
  getHealth(): HealthDto {
    return { healthy: true, version: version };
  }
}
