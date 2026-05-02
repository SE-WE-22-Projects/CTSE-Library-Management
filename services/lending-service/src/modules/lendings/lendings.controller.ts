import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LendingsService } from './lendings.service';
import { CreateLendingDto } from './dto/create-lending.dto';
import { UpdateLendingDto } from './dto/update-lending.dto';

@ApiTags('Lendings')
@Controller('api/lendings')
export class LendingsController {
  constructor(private readonly lendingsService: LendingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lending record' })
  create(@Body() dto: CreateLendingDto, @Req() req: Request) {
    return this.lendingsService.create(dto, req.headers.authorization);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lending records' })
  findAll() {
    return this.lendingsService.findAll();
  }

  @Get('history/date-range')
  @ApiOperation({ summary: 'Get lending history by date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.lendingsService.findByDateRange(startDate, endDate);
  }

  @Get('history/user/:userId')
  @ApiOperation({ summary: 'Get lending history by user id' })
  @ApiParam({ name: 'userId' })
  findByUserId(@Param('userId') userId: string) {
    return this.lendingsService.findByUserId(userId);
  }

  @Get('history/book/:bookId')
  @ApiOperation({ summary: 'Get lending history by book id' })
  @ApiParam({ name: 'bookId' })
  findByBookId(@Param('bookId') bookId: string) {
    return this.lendingsService.findByBookId(bookId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get all lending history records' })
  history() {
    return this.lendingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lending by id' })
  @ApiParam({ name: 'id' })
  findById(@Param('id') id: string) {
    return this.lendingsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lending by id' })
  @ApiParam({ name: 'id' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLendingDto,
    @Req() req: Request,
  ) {
    return this.lendingsService.update(id, dto, req.headers.authorization);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lending by id' })
  @ApiParam({ name: 'id' })
  delete(@Param('id') id: string, @Req() req: Request) {
    return this.lendingsService.delete(id, req.headers.authorization);
  }

  @Patch(':id/extend')
  @ApiOperation({ summary: 'Extend lending by 7 days (max 2 attempts)' })
  @ApiParam({ name: 'id' })
  extend(@Param('id') id: string) {
    return this.lendingsService.extendLending(id);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Mark lending as returned' })
  @ApiParam({ name: 'id' })
  returnLending(@Param('id') id: string, @Req() req: Request) {
    return this.lendingsService.returnLending(id, req.headers.authorization);
  }

  @Post('jobs/fines/apply')
  @ApiOperation({ summary: 'Manually trigger overdue fine calculation' })
  applyDailyFines() {
    return this.lendingsService.applyDailyOverdueFines();
  }
}
