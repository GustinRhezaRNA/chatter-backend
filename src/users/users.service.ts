import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersRepository } from './users.repository';
import { Types } from 'mongoose';
import { S3Service } from 'src/common/s3/s3.service';
import { USER_BUCKET, USER_IMAGE_FILE_EXTENSION } from './users.constants';
import { UserDocument } from './entities/user.document.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly s3Service: S3Service,
  ) {}

  async uploadImage(file: Buffer, userId: string) {
    await this.s3Service.upload({
      bucket: USER_BUCKET,
      file,
      key: this.getUserImage(userId),
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async create(createUserInput: CreateUserInput) {
    try {
      return this.toEntity(
        await this.usersRepository.create({
          ...createUserInput,
          password: await this.hashPassword(createUserInput.password),
        }),
      );
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.message.includes('duplicate key error collection')
      ) {
        throw new UnprocessableEntityException('Email already exists');
      }
      throw err;
    }
  }

  async findAll() {
    return (await this.usersRepository.find({})).map((user) =>
      this.toEntity(user),
    );
  }

  async findOne(_id: string) {
    return this.toEntity(await this.usersRepository.findOne({ _id }));
  }

  async update(_id: string, updateUserInput: UpdateUserInput) {
    if (updateUserInput.password) {
      updateUserInput.password = await this.hashPassword(
        updateUserInput.password,
      );
    }
    return this.toEntity(
      await this.usersRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(_id) },
        { $set: updateUserInput },
      ),
    );
  }

  async remove(_id: string) {
    return this.toEntity(await this.usersRepository.findOneAndDelete({ _id }));
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.toEntity(user);
  }

  toEntity(userDocument: UserDocument): User {
    const user = {
      _id: userDocument._id,
      email: userDocument.email,
      username: userDocument.username,
      imageUrl: this.s3Service.getObjectUrl(
        this.getUserImage(userDocument._id!.toHexString()),
        USER_BUCKET,
      ),
    };
    return user;
  }

  private getUserImage(userId: string) {
    return `${userId}.${USER_IMAGE_FILE_EXTENSION}`;
  }
}
