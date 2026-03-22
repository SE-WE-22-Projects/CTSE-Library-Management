import {
  Controller,
  Get,
  Delete,
  Put,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { User } from './user';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findByCode(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() user: User) {
    return this.service.create(user);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.service.deleteById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: User) {
    return this.service.update(id, user);
  }
}
