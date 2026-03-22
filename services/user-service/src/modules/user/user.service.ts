import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schema/user.schema';
import { hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/upate-user.dto';
import { UserDto } from './dto/user.dto';

const saltRounds = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async update(id: string, user: UpdateUserDto) {
    let hashed_password: string | undefined = undefined;
    if (user.password) {
      hashed_password = await hash(user.password, saltRounds);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          username: user.username,
          hashed_password,
        },
        { new: true },
      )
      .exec();

    if (!updated) throw new NotFoundException('User not found');

    return UserDto.from(updated);
  }

  async deleteById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return UserDto.from(user);
  }

  async create(dto: CreateUserDto) {
    const password_hashed = await hash(dto.password, saltRounds);

    const user = new this.userModel({
      ...dto,
      password: undefined,
      password_hashed,
    });

    try {
      return UserDto.from(await user.save());
    } catch (e) {
      if (e instanceof Error && e.message.includes('duplicate key error')) {
        throw new ConflictException('User with the same email already exists');
      }

      throw e;
    }
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserDto.from(user);
  }

  async findAll(): Promise<Array<UserDto>> {
    const users = this.userModel.find();

    return (await users).map((v) => UserDto.from(v));
  }
}
