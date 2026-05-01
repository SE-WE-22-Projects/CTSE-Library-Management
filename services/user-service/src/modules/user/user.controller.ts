import {
  Controller,
  Get,
  Delete,
  Put,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api/user')
export class UserController {
  constructor(private service: UserService) { }

  @Get()
  findAll(): Promise<Array<UserDto>> {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<UserDto> {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() user: CreateUserDto): Promise<UserDto> {
    return this.service.create(user);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string): Promise<UserDto> {
    return this.service.deleteById(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() user: UpdateUserDto,
  ): Promise<UserDto> {
    return this.service.update(id, user);
  }
}
