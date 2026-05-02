import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Book, BookDocument } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name)
    private bookModel: Model<BookDocument>,
  ) {}

  // CREATE
  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = new this.bookModel(createBookDto);
    return book.save();
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
}
