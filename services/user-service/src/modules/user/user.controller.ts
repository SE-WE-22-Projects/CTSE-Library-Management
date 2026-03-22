import { Resource, Roles, Scopes, Public } from 'nest-keycloak-connect';
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
@Resource(User.name)
export class UserController {
  constructor(private service: UserService) {}

  @Get()
  @Public()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Scopes('View')
  findByCode(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Scopes('Create')
  create(@Body() user: User) {
    return this.service.create(user);
  }

  @Delete(':id')
  @Scopes('Delete')
  @Roles({ roles: ['admin'] })
  deleteById(@Param('id') id: string) {
    return this.service.deleteById(id);
  }

  @Put(':id')
  @Scopes('Edit')
  update(@Param('id') id: string, @Body() user: User) {
    return this.service.update(id, user);
  }
}
