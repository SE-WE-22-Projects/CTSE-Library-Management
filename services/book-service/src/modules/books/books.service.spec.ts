/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './schemas/book.schema';

describe('BooksService', () => {
  let service: BooksService;
  let mockBookModel: any;

  const mockBook = {
    _id: '507f1f77bcf86cd799439011',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A classic American novel',
    price: 10.99,
    category: 'Fiction',
    publishedDate: new Date('1925-04-10'),
    isAvailable: true,
    save: jest.fn(),
  };

  const mockBooks = [
    {
      _id: '507f1f77bcf86cd799439011',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel',
      price: 10.99,
      category: 'Fiction',
      publishedDate: new Date('1925-04-10'),
      isAvailable: true,
    },
    {
      _id: '507f1f77bcf86cd799439012',
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian novel',
      price: 13.99,
      category: 'Fiction',
      publishedDate: new Date('1949-06-08'),
      isAvailable: true,
    },
  ];

  beforeEach(async () => {
    mockBookModel = jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: '507f1f77bcf86cd799439011',
      save: jest.fn().mockResolvedValue({
        ...dto,
        _id: '507f1f77bcf86cd799439011',
        isAvailable: true,
      }),
    }));

    // Keep the other mocks for find, findById, etc.
    mockBookModel.find = jest.fn();
    mockBookModel.findById = jest.fn();
    mockBookModel.findByIdAndUpdate = jest.fn();
    mockBookModel.findByIdAndDelete = jest.fn();
    mockBookModel.create = jest.fn();

    const mockHttpService = {
      get: jest.fn(),
      post: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new book successfully', async () => {
      const createBookDto: CreateBookDto = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A classic American novel',
        price: 10.99,
        category: 'Fiction',
        publishedDate: new Date('1925-04-10'),
      };

      const result = await service.create(createBookDto);

      expect(result).toBeDefined();
      expect(result.title).toBe(createBookDto.title);
      expect(result.author).toBe(createBookDto.author);
      expect(mockBookModel).toHaveBeenCalledWith(createBookDto);
    });

    it('should throw error if required fields are missing', async () => {
      const invalidDto: any = {
        title: 'Book Title',
      };

      mockBookModel.mockImplementationOnce((dto) => ({
        ...dto,
        save: jest.fn().mockRejectedValue(new Error('Validation failed')),
      }));

      await expect(service.create(invalidDto)).rejects.toThrow(
        'Validation failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return all books when no filter is provided', async () => {
      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooks),
      });

      const result = await service.findAll();

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.find).toHaveBeenCalledWith({});
    });

    it('should search books by title', async () => {
      const searchTerm = 'Gatsby';
      const filteredBooks = [mockBooks[0]];

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(filteredBooks),
      });

      const result = await service.findAll(searchTerm);

      expect(result).toEqual(filteredBooks);
      expect(mockBookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { title: { $regex: searchTerm, $options: 'i' } },
            { author: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } },
          ]),
        }),
      );
    });

    it('should search books by author', async () => {
      const searchTerm = 'Orwell';
      const filteredBooks = [mockBooks[1]];

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(filteredBooks),
      });

      const result = await service.findAll(searchTerm);

      expect(result).toEqual(filteredBooks);
    });

    it('should filter books by category', async () => {
      const category = 'Fiction';

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooks),
      });

      const result = await service.findAll(undefined, category);

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.find).toHaveBeenCalledWith({
        category: category,
      });
    });

    it('should search and filter by category simultaneously', async () => {
      const searchTerm = 'Great';
      const category = 'Fiction';
      const filteredBooks = [mockBooks[0]];

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(filteredBooks),
      });

      const result = await service.findAll(searchTerm, category);

      expect(result).toEqual(filteredBooks);
      expect(mockBookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          category: category,
          $or: expect.any(Array),
        }),
      );
    });

    it('should return empty array when no books match the filter', async () => {
      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll('NonExistentBook');

      expect(result).toEqual([]);
    });

    it('should perform case-insensitive search', async () => {
      const searchTerm = 'gatsby';
      const filteredBooks = [mockBooks[0]];

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(filteredBooks),
      });

      const result = await service.findAll(searchTerm);

      expect(result).toEqual(filteredBooks);
      expect(mockBookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { title: { $regex: 'gatsby', $options: 'i' } },
          ]),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a book by id', async () => {
      const bookId = '507f1f77bcf86cd799439011';

      mockBookModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBook),
      });

      const result = await service.findById(bookId);

      expect(result).toEqual(mockBook);
      expect(mockBookModel.findById).toHaveBeenCalledWith(bookId);
    });

    it('should throw NotFoundException when book does not exist', async () => {
      const bookId = '507f1f77bcf86cd799439099';

      mockBookModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById(bookId)).rejects.toThrow(
        new NotFoundException('Book not found'),
      );
    });

    it('should throw NotFoundException with correct message', async () => {
      const bookId = 'invalid-id';

      mockBookModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        await service.findById(bookId);
        fail('Should throw NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('Book not found');
      }
    });
  });

  describe('findByCategory', () => {
    it('should return books filtered by category', async () => {
      const category = 'Fiction';

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooks),
      });

      const result = await service.findByCategory(category);

      expect(result).toEqual(mockBooks);
      expect(mockBookModel.find).toHaveBeenCalledWith({ category });
    });

    it('should return empty array when no books in category', async () => {
      const category = 'Non-existent-category';

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findByCategory(category);

      expect(result).toEqual([]);
    });

    it('should handle case-sensitive category filtering', async () => {
      const category = 'Horror';

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findByCategory(category);

      expect(result).toEqual([]);
      expect(mockBookModel.find).toHaveBeenCalledWith({ category: 'Horror' });
    });

    it('should return multiple books from same category', async () => {
      const category = 'Fiction';
      const fictionBooks = [mockBooks[0], mockBooks[1]];

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(fictionBooks),
      });

      const result = await service.findByCategory(category);

      expect(result).toHaveLength(2);
      expect(result).toEqual(fictionBooks);
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const bookId = '507f1f77bcf86cd799439011';
      const updateBookDto: UpdateBookDto = {
        title: 'The Great Gatsby (Revised)',
        price: 12.99,
      };

      const updatedBook = { ...mockBook, ...updateBookDto };

      mockBookModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedBook),
      });

      const result = await service.update(bookId, updateBookDto);

      expect(result).toEqual(updatedBook);
      expect(mockBookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        bookId,
        updateBookDto,
        { new: true },
      );
    });

    it('should throw NotFoundException when book does not exist', async () => {
      const bookId = '507f1f77bcf86cd799439099';
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
      };

      mockBookModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(bookId, updateBookDto)).rejects.toThrow(
        new NotFoundException('Book not found'),
      );
    });

    it('should update only provided fields', async () => {
      const bookId = '507f1f77bcf86cd799439011';
      const updateBookDto: UpdateBookDto = {
        price: 15.99,
      };

      const updatedBook = { ...mockBook, price: 15.99 };

      mockBookModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedBook),
      });

      const result = await service.update(bookId, updateBookDto);

      expect(result.price).toBe(15.99);
      expect(result.title).toBe(mockBook.title);
    });

    it('should update multiple fields', async () => {
      const bookId = '507f1f77bcf86cd799439011';
      const updateBookDto: UpdateBookDto = {
        title: 'New Title',
        author: 'New Author',
        price: 20.99,
        category: 'Mystery',
      };

      const updatedBook = { ...mockBook, ...updateBookDto };

      mockBookModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedBook),
      });

      const result = await service.update(bookId, updateBookDto);

      expect(result).toEqual(updatedBook);
      expect(result.title).toBe(updateBookDto.title);
      expect(result.author).toBe(updateBookDto.author);
    });

    it('should return updated book with new: true option', async () => {
      const bookId = '507f1f77bcf86cd799439011';
      const updateBookDto: UpdateBookDto = {
        isAvailable: false,
      };

      const updatedBook = { ...mockBook, isAvailable: false };

      mockBookModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedBook),
      });

      const result = await service.update(bookId, updateBookDto);

      expect(mockBookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        bookId,
        updateBookDto,
        { new: true },
      );
      expect(result.isAvailable).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a book successfully', async () => {
      const bookId = '507f1f77bcf86cd799439011';

      mockBookModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBook),
      });

      const result = await service.delete(bookId);

      expect(result).toEqual({ message: 'Book deleted successfully' });
      expect(mockBookModel.findByIdAndDelete).toHaveBeenCalledWith(bookId);
    });

    it('should throw NotFoundException when book does not exist', async () => {
      const bookId = '507f1f77bcf86cd799439099';

      mockBookModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.delete(bookId)).rejects.toThrow(
        new NotFoundException('Book not found'),
      );
    });

    it('should return success message with correct format', async () => {
      const bookId = '507f1f77bcf86cd799439011';

      mockBookModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBook),
      });

      const result = await service.delete(bookId);

      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Book deleted successfully');
    });

    it('should call findByIdAndDelete with correct id', async () => {
      const bookId = 'test-id-123';

      mockBookModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBook),
      });

      await service.delete(bookId);

      expect(mockBookModel.findByIdAndDelete).toHaveBeenCalledWith(bookId);
      expect(mockBookModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion of non-existent book gracefully', async () => {
      const bookId = 'non-existent-id';

      mockBookModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        await service.delete(bookId);
        fail('Should throw NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle special characters in search', async () => {
      const specialSearchTerm = "O'Brien";

      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      await service.findAll(specialSearchTerm);

      expect(mockBookModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { title: { $regex: specialSearchTerm, $options: 'i' } },
          ]),
        }),
      );
    });

    it('should handle empty string search', async () => {
      mockBookModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBooks),
      });

      const result = await service.findAll('');

      // Empty string is falsy, so it should not add search filter
      expect(result).toEqual(mockBooks);
    });

    it('should handle numeric book id', async () => {
      const numericId = '123456789';

      mockBookModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockBook),
      });

      await service.findById(numericId);

      expect(mockBookModel.findById).toHaveBeenCalledWith(numericId);
    });
  });
});
