import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';
import { UserService } from './user.service';
import { User } from 'src/schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash } from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UserService', () => {
    let service: UserService;
    let mockUserModel: any;

    const mockId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

    const mockUser = {
        _id: mockId,
        email: 'test@example.com',
        username: 'testuser',
        password_hashed: 'hashed-password',
        save: jest.fn().mockResolvedValue({
            _id: mockId,
            email: 'test@example.com',
            username: 'testuser',
        }),
    };

    beforeEach(async () => {
        mockUserModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            _id: mockId,
            save: jest.fn().mockResolvedValue({
                _id: mockId,
                email: dto.email,
                username: dto.username,
            }),
        }));

        mockUserModel.findById = jest.fn();
        mockUserModel.findByIdAndUpdate = jest.fn();
        mockUserModel.find = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user and return UserDto', async () => {
            const dto: CreateUserDto = {
                email: 'test@example.com',
                password: 'Passw0rd!',
                username: 'testuser',
                permission: 'ADMIN' as any,
            };

            const result = await service.create(dto);

            expect(hash).toHaveBeenCalledWith(dto.password, 10);
            expect(mockUserModel).toHaveBeenCalledWith({
                ...dto,
                password: undefined,
                password_hashed: 'hashed-password',
            });
            expect(result).toEqual({
                _id: mockId.toHexString(),
                email: 'test@example.com',
                username: 'testuser',
            });
        });

        it('should throw ConflictException on duplicate key error', async () => {
            const dto: CreateUserDto = {
                email: 'conflict@example.com',
                password: 'Passw0rd!',
                username: 'conflictuser',
                permission: 'ADMIN' as any,
            };

            mockUserModel.mockImplementationOnce(() => ({
                save: jest.fn().mockRejectedValue(new Error('duplicate key error collection')),
            }));

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findById', () => {
        it('should return a UserDto when user exists', async () => {
            mockUserModel.findById.mockResolvedValue({
                _id: mockId,
                email: 'test@example.com',
                username: 'testuser',
            });

            const result = await service.findById('507f1f77bcf86cd799439011');

            expect(result).toEqual({
                _id: mockId.toHexString(),
                email: 'test@example.com',
                username: 'testuser',
            });
            expect(mockUserModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should throw NotFoundException when user does not exist', async () => {
            mockUserModel.findById.mockResolvedValue(null);

            await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findAll', () => {
        it('should return all users as UserDto array', async () => {
            const users = [
                {
                    _id: mockId,
                    email: 'test@example.com',
                    username: 'testuser',
                },
            ];

            mockUserModel.find.mockResolvedValue(users);

            const result = await service.findAll();

            expect(result).toEqual([
                {
                    _id: mockId.toHexString(),
                    email: 'test@example.com',
                    username: 'testuser',
                },
            ]);
        });
    });

    describe('update', () => {
        it('should update username and return UserDto', async () => {
            const updateDto: UpdateUserDto = {
                username: 'updateduser',
            };

            mockUserModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    _id: mockId,
                    email: 'test@example.com',
                    username: 'updateduser',
                }),
            });

            const result = await service.update('507f1f77bcf86cd799439011', updateDto);

            expect(result).toEqual({
                _id: mockId.toHexString(),
                email: 'test@example.com',
                username: 'updateduser',
            });
            expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                {
                    username: 'updateduser',
                    hashed_password: undefined,
                },
                { new: true },
            );
        });

        it('should hash password when password provided and update user', async () => {
            const updateDto: UpdateUserDto = {
                password: 'NewPassw0rd!',
            };

            mockUserModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({
                    _id: mockId,
                    email: 'test@example.com',
                    username: 'testuser',
                }),
            });

            const result = await service.update('507f1f77bcf86cd799439011', updateDto);

            expect(hash).toHaveBeenCalledWith(updateDto.password, 10);
            expect(result).toEqual({
                _id: mockId.toHexString(),
                email: 'test@example.com',
                username: 'testuser',
            });
            expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
                '507f1f77bcf86cd799439011',
                {
                    username: undefined,
                    hashed_password: 'hashed-password',
                },
                { new: true },
            );
        });

        it('should throw NotFoundException when update target does not exist', async () => {
            mockUserModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(
                service.update('507f1f77bcf86cd799439011', { username: 'unknown' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteById', () => {
        it('should return UserDto for deleted user', async () => {
            mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

            const result = await service.deleteById('507f1f77bcf86cd799439011');

            expect(result).toEqual({
                _id: mockId.toHexString(),
                email: 'test@example.com',
                username: 'testuser',
            });
            expect(mockUserModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        });

        it('should throw NotFoundException when delete target does not exist', async () => {
            mockUserModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

            await expect(service.deleteById('507f1f77bcf86cd799439011')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});