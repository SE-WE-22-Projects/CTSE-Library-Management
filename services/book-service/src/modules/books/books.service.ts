/* eslint-disable  */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Book, BookDocument } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<BookDocument>,
    private readonly httpService: HttpService,
  ) {}

  // CREATE
  async create(
    createBookDto: CreateBookDto,
    authorization?: string,
  ): Promise<Book> {
    const book = new this.bookModel(createBookDto);
    const saved = await book.save();

    // Broadcast notification asynchronously
    this.broadcastNewBook(saved.title, authorization).catch((e) =>
      this.logger.error(`Broadcast failed`, e),
    );

    return saved;
  }

  // GET ALL + SEARCH
  async findAll(search?: string, category?: string): Promise<Book[]> {
    const filter: QueryFilter<BookDocument> = {};

    // Search by title, author, category
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    return this.bookModel.find(filter).exec();
  }

  // GET BY ID
  async findById(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  // GET BY CATEGORY ONLY
  async findByCategory(category: string): Promise<Book[]> {
    return this.bookModel.find({ category }).exec();
  }

  // UPDATE
  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const updated = await this.bookModel
      .findByIdAndUpdate(id, updateBookDto, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Book not found');
    return updated;
  }

  // UPDATE AVAILABILITY
  async updateAvailability(id: string, isAvailable: boolean): Promise<Book> {
    const updated = await this.bookModel
      .findByIdAndUpdate(id, { isAvailable }, { new: true })
      .exec();

    if (!updated) throw new NotFoundException('Book not found');
    return updated;
  }

  // DELETE
  async delete(id: string): Promise<{ message: string }> {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Book not found');

    return { message: 'Book deleted successfully' };
  }

  private async broadcastNewBook(
    title: string,
    authorization?: string,
  ): Promise<void> {
    const gatewayUrl = process.env['GATEWAY_URL'];
    if (!gatewayUrl) {
      this.logger.warn(
        'GATEWAY_URL is not configured. Cannot broadcast new book.',
      );
      return;
    }

    try {
      // 1. Fetch all users from User Service via Gateway
      const usersResponse = await firstValueFrom(
        this.httpService.get(`${gatewayUrl}/api/users/`, {
          headers: authorization ? { Authorization: authorization } : undefined,
        }),
      );

      const users = usersResponse.data;
      if (!Array.isArray(users)) return;

      // 2. Dispatch notifications to all users
      const notifyPromises = users
        .filter((u) => u.email)
        .map((u) =>
          firstValueFrom(
            this.httpService.post(
              `${gatewayUrl}/api/notifications/`,
              {
                recipient: u.email,
                subject: 'New Book Arrival!',
                content: `Great news! We have just added "${title}" to our library catalog. Check it out now!`,
              },
              {
                headers: authorization
                  ? { Authorization: authorization }
                  : undefined,
              },
            ),
          ).catch((e) =>
            this.logger.error(`Failed to notify ${u.email}`, e.stack),
          ),
        );

      await Promise.allSettled(notifyPromises);
    } catch (e) {
      this.logger.error('Failed to broadcast new book notification', e.stack);
    }
  }
}
