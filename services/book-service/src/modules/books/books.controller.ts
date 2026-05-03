import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { type Request } from 'express';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Books')
@Controller('api/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  create(@Body() dto: CreateBookDto, @Req() req: Request) {
    return this.booksService.create(dto, req.headers.authorization);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all books with optional search & category filter',
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.booksService.findAll(search, category);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get books by category' })
  @ApiParam({ name: 'category' })
  findByCategory(@Param('category') category: string) {
    return this.booksService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get book by ID' })
  @ApiParam({ name: 'id' })
  findById(@Param('id') id: string) {
    return this.booksService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update book by ID' })
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Patch(':id/availability')
  @ApiOperation({ summary: 'Update book availability by ID' })
  @ApiParam({ name: 'id' })
  updateAvailability(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.booksService.updateAvailability(id, dto.isAvailable);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete book by ID' })
  @ApiParam({ name: 'id' })
  delete(@Param('id') id: string) {
    return this.booksService.delete(id);
  }
}
