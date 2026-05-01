import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { LendingsService } from './lendings.service';
import { Lending, LendingDocument, LendingStatus } from './schemas/lending.schema';
import { CreateLendingDto } from './dto/create-lending.dto';
import { UpdateLendingDto } from './dto/update-lending.dto';

describe('LendingsService', () => {
    let service: LendingsService;
    let mockLendingModel: any;

    const mockLending = {
        _id: '507f1f77bcf86cd799439011',
        bookId: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439013',
        reservedDate: new Date('2023-01-01'),
        returnDate: new Date('2023-01-15'),
        actualReturnDate: undefined,
        extensionAttempts: 0,
        fineAmount: 0,
        lastFineAppliedDate: undefined,
        isActive: true,
        status: LendingStatus.ACTIVE,
        save: jest.fn(),
    };

    const mockLendings = [
        mockLending,
        {
            _id: '507f1f77bcf86cd799439014',
            bookId: '507f1f77bcf86cd799439015',
            userId: '507f1f77bcf86cd799439016',
            reservedDate: new Date('2023-01-02'),
            returnDate: new Date('2023-01-16'),
            actualReturnDate: undefined,
            extensionAttempts: 0,
            fineAmount: 0,
            lastFineAppliedDate: undefined,
            isActive: true,
            status: LendingStatus.ACTIVE,
        },
    ];

    beforeEach(async () => {
        mockLendingModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            _id: '507f1f77bcf86cd799439011',
            reservedDate: new Date('2023-01-01'),
            returnDate: new Date('2023-01-15'),
            extensionAttempts: 0,
            fineAmount: 0,
            isActive: true,
            status: LendingStatus.ACTIVE,
            save: jest.fn().mockResolvedValue({
                ...dto,
                _id: '507f1f77bcf86cd799439011',
                reservedDate: new Date('2023-01-01'),
                returnDate: new Date('2023-01-15'),
                extensionAttempts: 0,
                fineAmount: 0,
                isActive: true,
                status: LendingStatus.ACTIVE,
            }),
        }));

        mockLendingModel.find = jest.fn();
        mockLendingModel.findById = jest.fn();
        mockLendingModel.findByIdAndUpdate = jest.fn();
        mockLendingModel.findByIdAndDelete = jest.fn();
        mockLendingModel.create = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LendingsService,
                {
                    provide: getModelToken(Lending.name),
                    useValue: mockLendingModel,
                },
            ],
        }).compile();

        service = module.get<LendingsService>(LendingsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new lending successfully', async () => {
            const createLendingDto: CreateLendingDto = {
                bookId: '507f1f77bcf86cd799439012',
                userId: '507f1f77bcf86cd799439013',
            };

            const result = await service.create(createLendingDto);

            expect(result).toBeDefined();
            expect(result.bookId).toBe(createLendingDto.bookId);
            expect(result.userId).toBe(createLendingDto.userId);
            expect(result.isActive).toBe(true);
            expect(result.status).toBe(LendingStatus.ACTIVE);
            expect(result.extensionAttempts).toBe(0);
            expect(result.fineAmount).toBe(0);
            expect(mockLendingModel).toHaveBeenCalledWith({
                ...createLendingDto,
                reservedDate: expect.any(Date),
                returnDate: expect.any(Date),
                extensionAttempts: 0,
                fineAmount: 0,
                isActive: true,
                status: LendingStatus.ACTIVE,
            });
        });

        it('should throw ConflictException for duplicate key error', async () => {
            const createLendingDto: CreateLendingDto = {
                bookId: '507f1f77bcf86cd799439012',
                userId: '507f1f77bcf86cd799439013',
            };

            mockLendingModel.mockImplementationOnce(() => {
                throw { code: 11000 };
            });

            await expect(service.create(createLendingDto)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('findAll', () => {
        it('should return all lendings sorted by reservedDate desc', async () => {
            mockLendingModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockLendings),
                }),
            });

            const result = await service.findAll();

            expect(result).toEqual(mockLendings);
            expect(mockLendingModel.find).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return lending by id', async () => {
            mockLendingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLending),
            });

            const result = await service.findById('507f1f77bcf86cd799439011');

            expect(result).toEqual(mockLending);
            expect(mockLendingModel.findById).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
            );
        });

        it('should throw NotFoundException if lending not found', async () => {
            mockLendingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(
                service.findById('507f1f77bcf86cd799439011'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByUserId', () => {
        it('should return lendings by userId', async () => {
            mockLendingModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockLendings),
                }),
            });

            const result = await service.findByUserId('507f1f77bcf86cd799439013');

            expect(result).toEqual(mockLendings);
            expect(mockLendingModel.find).toHaveBeenCalledWith({
                userId: '507f1f77bcf86cd799439013',
            });
        });
    });

    describe('findByBookId', () => {
        it('should return lendings by bookId', async () => {
            mockLendingModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockLendings),
                }),
            });

            const result = await service.findByBookId('507f1f77bcf86cd799439012');

            expect(result).toEqual(mockLendings);
            expect(mockLendingModel.find).toHaveBeenCalledWith({
                bookId: '507f1f77bcf86cd799439012',
            });
        });
    });

    describe('findByDateRange', () => {
        it('should return lendings within date range', async () => {
            const startDate = '2023-01-01';
            const endDate = '2023-01-31';

            const normalizedStart = new Date('2023-01-01T00:00:00.000Z');
            const normalizedEnd = new Date('2023-01-31T00:00:00.000Z');

            const toDateOnlySpy = jest.spyOn(service as any, 'toDateOnly')
                .mockReturnValueOnce(normalizedStart)
                .mockReturnValueOnce(normalizedEnd);

            mockLendingModel.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockLendings),
                }),
            });

            const result = await service.findByDateRange(startDate, endDate);

            expect(result).toEqual(mockLendings);
            expect(mockLendingModel.find).toHaveBeenCalledWith({
                reservedDate: {
                    $gte: normalizedStart,
                    $lte: normalizedEnd,
                },
            });

            toDateOnlySpy.mockRestore();
        });

        it('should throw BadRequestException if startDate > endDate', async () => {
            const startDate = '2023-01-31';
            const endDate = '2023-01-01';

            await expect(
                service.findByDateRange(startDate, endDate),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('update', () => {
        it('should update lending successfully', async () => {
            const updateLendingDto: UpdateLendingDto = {
                returnDate: '2023-01-20',
                status: LendingStatus.RETURNED,
            };

            const normalizedReturnDate = new Date('2023-01-20T00:00:00.000Z');
            const toDateOnlySpy = jest.spyOn(service as any, 'toDateOnly').mockReturnValue(normalizedReturnDate);

            mockLendingModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    ...mockLending,
                    ...updateLendingDto,
                    returnDate: normalizedReturnDate,
                }),
            });

            const result = await service.update(
                '507f1f77bcf86cd799439011',
                updateLendingDto,
            );

            expect(result).toBeDefined();
            expect(result.returnDate).toEqual(normalizedReturnDate);
            expect(result.status).toBe(LendingStatus.RETURNED);
            expect(mockLendingModel.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                {
                    ...updateLendingDto,
                    returnDate: normalizedReturnDate,
                },
                { new: true },
            );

            toDateOnlySpy.mockRestore();
        });

        it('should throw NotFoundException if lending not found', async () => {
            mockLendingModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(
                service.update('507f1f77bcf86cd799439011', {}),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete lending successfully', async () => {
            mockLendingModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLending),
            });

            const result = await service.delete('507f1f77bcf86cd799439011');

            expect(result).toEqual({
                message: 'Lending record deleted successfully',
            });
            expect(mockLendingModel.findByIdAndDelete).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
            );
        });

        it('should throw NotFoundException if lending not found', async () => {
            mockLendingModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(
                service.delete('507f1f77bcf86cd799439011'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('extendLending', () => {
        it('should extend lending successfully', async () => {
            const lending = {
                ...mockLending,
                returnDate: new Date('2023-01-15'),
                extensionAttempts: 0,
                save: jest.fn().mockResolvedValue({
                    ...mockLending,
                    returnDate: new Date('2023-01-22'),
                    extensionAttempts: 1,
                }),
            };

            mockLendingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(lending),
            });

            const toDateOnlySpy = jest.spyOn(service as any, 'toDateOnly').mockReturnValue(new Date('2023-01-10'));

            const result = await service.extendLending('507f1f77bcf86cd799439011');

            expect(result.returnDate).toEqual(new Date('2023-01-22'));
            expect(result.extensionAttempts).toBe(1);
            expect(lending.save).toHaveBeenCalled();

            toDateOnlySpy.mockRestore();
        });

        it('should throw BadRequestException if lending is not active', async () => {
            const lending = { ...mockLending, isActive: false };

            mockLendingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(lending),
            });

            await expect(
                service.extendLending('507f1f77bcf86cd799439011'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if past due date', async () => {
            const lending = {
                ...mockLending,
                returnDate: new Date('2023-01-01'),
            };

            mockLendingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(lending),
            });

            await expect(
                service.extendLending('507f1f77bcf86cd799439011'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if max extensions reached', async () => {
            const lending = {
                ...mockLending,
                extensionAttempts: 2,
            };

            mockLendingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(lending),
            });

            await expect(
                service.extendLending('507f1f77bcf86cd799439011'),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('returnLending', () => {
        it('should return lending successfully', async () => {
            const lending = {
                ...mockLending,
                save: jest.fn().mockResolvedValue({
                    ...mockLending,
                    actualReturnDate: new Date(),
                    isActive: false,
                    status: LendingStatus.RETURNED,
                }),
            };

            mockLendingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(lending),
            });

            const result = await service.returnLending('507f1f77bcf86cd799439011');

            expect(result.isActive).toBe(false);
            expect(result.status).toBe(LendingStatus.RETURNED);
            expect(result.actualReturnDate).toBeDefined();
            expect(lending.save).toHaveBeenCalled();
        });

        it('should throw BadRequestException if already returned', async () => {
            const lending = { ...mockLending, isActive: false };

            mockLendingModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(lending),
            });

            await expect(
                service.returnLending('507f1f77bcf86cd799439011'),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('applyDailyOverdueFines', () => {
        it('should apply fines to overdue lendings', async () => {
            const overdueLending = {
                ...mockLending,
                returnDate: new Date('2023-01-01'),
                fineAmount: 0,
                status: LendingStatus.ACTIVE,
                save: jest.fn().mockResolvedValue(true),
            };

            mockLendingModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([overdueLending]),
            });

            const result = await service.applyDailyOverdueFines();

            expect(result.processed).toBe(1);
            expect(result.updated).toBe(1);
            expect(overdueLending.save).toHaveBeenCalled();
        });

        it('should return zero if no overdue lendings', async () => {
            mockLendingModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });

            const result = await service.applyDailyOverdueFines();

            expect(result.processed).toBe(0);
            expect(result.updated).toBe(0);
        });
    });
});