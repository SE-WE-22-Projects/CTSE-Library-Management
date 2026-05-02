import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, QueryFilter } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import {
  Lending,
  LendingDocument,
  LendingStatus,
} from './schemas/lending.schema';
import { CreateLendingDto } from './dto/create-lending.dto';
import { UpdateLendingDto } from './dto/update-lending.dto';

const DEFAULT_LENDING_DAYS = 14;
const EXTENSION_DAYS = 7;
const MAX_EXTENSION_ATTEMPTS = 2;
const DAILY_FINE_RATE = 0.5;

@Injectable()
export class LendingsService {
  constructor(
    @InjectModel(Lending.name)
    private lendingModel: Model<LendingDocument>,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createLendingDto: CreateLendingDto,
    authorization?: string,
  ): Promise<LendingDocument> {
    const today = this.toDateOnly(new Date());
    const dueDate = this.addDays(today, DEFAULT_LENDING_DAYS);

    try {
      const lending = new this.lendingModel({
        ...createLendingDto,
        reservedDate: today,
        returnDate: dueDate,
        extensionAttempts: 0,
        fineAmount: 0,
        isActive: true,
        status: LendingStatus.ACTIVE,
      });

      const saved = await lending.save();

      try {
        await this.updateBookAvailability(
          createLendingDto.bookId,
          false,
          authorization,
        );
      } catch (error) {
        await this.lendingModel.findByIdAndDelete(saved._id).exec();
        throw error;
      }

      return saved;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('This book already has an active lending');
      }

      throw error;
    }
  }

  async findAll(): Promise<LendingDocument[]> {
    return this.lendingModel.find().sort({ reservedDate: -1 }).exec();
  }

  async findById(id: string): Promise<LendingDocument> {
    const lending = await this.lendingModel.findById(id).exec();
    if (!lending) {
      throw new NotFoundException('Lending record not found');
    }

    return lending;
  }

  async findByUserId(userId: string): Promise<LendingDocument[]> {
    return this.lendingModel.find({ userId }).sort({ reservedDate: -1 }).exec();
  }

  async findByBookId(bookId: string): Promise<LendingDocument[]> {
    return this.lendingModel.find({ bookId }).sort({ reservedDate: -1 }).exec();
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<LendingDocument[]> {
    const start = this.toDateOnly(new Date(startDate));
    const end = this.toDateOnly(new Date(endDate));

    if (start > end) {
      throw new BadRequestException(
        'startDate must be before or equal to endDate',
      );
    }

    const filter: QueryFilter<LendingDocument> = {
      reservedDate: {
        $gte: start,
        $lte: end,
      },
    };

    return this.lendingModel.find(filter).sort({ reservedDate: -1 }).exec();
  }

  async update(
    id: string,
    updateLendingDto: UpdateLendingDto,
  ): Promise<LendingDocument> {
    const payload: Record<string, unknown> = { ...updateLendingDto };

    if (updateLendingDto.returnDate) {
      payload.returnDate = this.toDateOnly(
        new Date(updateLendingDto.returnDate),
      );
    }

    const updated = await this.lendingModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Lending record not found');
    }

    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    const deleted = await this.lendingModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('Lending record not found');
    }

    return { message: 'Lending record deleted successfully' };
  }

  async extendLending(id: string): Promise<LendingDocument> {
    const lending = await this.findById(id);

    if (!lending.isActive) {
      throw new BadRequestException('Only active lendings can be extended');
    }

    const today = this.toDateOnly(new Date());
    const dueDate = this.toDateOnly(new Date(lending.returnDate));

    if (today > dueDate) {
      throw new BadRequestException(
        'Extension is only allowed on or before the return date',
      );
    }

    if (lending.extensionAttempts >= MAX_EXTENSION_ATTEMPTS) {
      throw new BadRequestException('Maximum extension attempts reached');
    }

    lending.returnDate = this.addDays(dueDate, EXTENSION_DAYS);
    lending.extensionAttempts += 1;
    lending.status = LendingStatus.ACTIVE;

    return lending.save();
  }

  async returnLending(id: string): Promise<LendingDocument> {
    const lending = await this.findById(id);

    if (!lending.isActive) {
      throw new BadRequestException('Book is already returned');
    }

    const today = this.toDateOnly(new Date());

    await this.applyFineUpToDate(lending, today);

    lending.actualReturnDate = today;
    lending.isActive = false;
    lending.status = LendingStatus.RETURNED;

    return lending.save();
  }

  async applyDailyOverdueFines(): Promise<{
    processed: number;
    updated: number;
  }> {
    const today = this.toDateOnly(new Date());

    const overdueRecords = await this.lendingModel
      .find({
        isActive: true,
        returnDate: { $lt: today },
      })
      .exec();

    let updated = 0;

    for (const lending of overdueRecords) {
      const changed = await this.applyFineUpToDate(lending, today);

      if (changed) {
        updated += 1;
      }

      if (lending.status !== LendingStatus.OVERDUE) {
        lending.status = LendingStatus.OVERDUE;
        await lending.save();
      }
    }

    return {
      processed: overdueRecords.length,
      updated,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async runDailyFineAccrual(): Promise<void> {
    await this.applyDailyOverdueFines();
  }

  private async applyFineUpToDate(
    lending: LendingDocument,
    targetDate: Date,
  ): Promise<boolean> {
    const dueDate = this.toDateOnly(new Date(lending.returnDate));

    if (targetDate <= dueDate) {
      return false;
    }

    const lastAppliedDate = lending.lastFineAppliedDate
      ? this.toDateOnly(new Date(lending.lastFineAppliedDate))
      : dueDate;

    const daysToApply = this.diffDays(lastAppliedDate, targetDate);

    if (daysToApply <= 0) {
      return false;
    }

    const newFine = lending.fineAmount + daysToApply * DAILY_FINE_RATE;
    lending.fineAmount = Number(newFine.toFixed(2));
    lending.lastFineAppliedDate = targetDate;

    await lending.save();

    return true;
  }

  private toDateOnly(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private addDays(date: Date, days: number): Date {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return this.toDateOnly(value);
  }

  private diffDays(fromDate: Date, toDate: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = toDate.getTime() - fromDate.getTime();
    return Math.floor(diff / msPerDay);
  }

  private isDuplicateKeyError(error: unknown): error is { code: number } {
    return (
      !!error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: number }).code === 11000
    );
  }

  private async updateBookAvailability(
    bookId: string,
    isAvailable: boolean,
    authorization?: string,
  ): Promise<void> {
    const gatewayUrl = process.env['GATEWWAY_URL'];

    if (!gatewayUrl) {
      throw new InternalServerErrorException('GATEWWAY_URL is not configured');
    }

    try {
      await firstValueFrom(
        this.httpService.patch(
          `${gatewayUrl}/api/books/${bookId}/availability`,
          { isAvailable },
          {
            headers: authorization
              ? { Authorization: authorization }
              : undefined,
          },
        ),
      );
    } catch {
      throw new InternalServerErrorException(
        'Failed to update book availability',
      );
    }
  }
}
