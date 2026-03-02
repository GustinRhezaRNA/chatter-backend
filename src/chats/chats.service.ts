import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { ChatsRepository } from './chats.repository';
import { PipelineStage, Types } from 'mongoose';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { UsersService } from 'src/users/users.service';
import { Chat } from './entities/chat.entity';
import { PUB_SUB } from '../common/constants/injection-token';
import { PubSub } from 'graphql-subscriptions';
import { CHAT_CREATED } from './constants/pubsub-trigger';
import { UserDocument } from '../users/entities/user.document.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatsService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersService: UsersService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

  async create(
    createChatInput: CreateChatInput,
    userId: string,
  ): Promise<Chat> {
    const chatDocument = await this.chatsRepository.create({
      ...createChatInput,
      userId,
      messages: [],
    });
    const chat = await this.findOne(chatDocument._id!.toHexString());
    await this.pubsub.publish(CHAT_CREATED, { chatCreated: chat });
    return chat;
  }

  async findMany(
    prePipelineStages: PipelineStage[] = [],
    paginationArgs?: PaginationArgs,
  ): Promise<Chat[]> {
    const chats = await this.chatsRepository.model.aggregate([
      ...prePipelineStages,
      {
        $set: {
          latestMessage: {
            $cond: [
              '$messages',
              { $arrayElemAt: ['$messages', -1] },
              {
                createdAt: new Date(),
              },
            ],
          },
        },
      },
      { $sort: { 'latestMessage.createdAt': -1 } },
      { $skip: paginationArgs?.skip ?? 0 },
      { $limit: paginationArgs?.limit ?? 15 },
      { $unset: 'messages' },
      {
        $lookup: {
          from: 'users',
          localField: 'latestMessage.userId',
          foreignField: '_id',
          as: 'latestMessage.user',
        },
      },
    ]);
    chats.forEach((chatRaw: unknown) => {
      const chat = chatRaw as Chat & {
        latestMessage?: {
          _id?: string;
          user?: UserDocument[] | User;
          userId?: string;
          chatId?: string | Types.ObjectId;
        };
      };
      if (!chat.latestMessage?._id) {
        delete chat.latestMessage;
        return;
      }
      const userArr = chat.latestMessage.user as UserDocument[];
      const rawUser = userArr?.[0];
      //Sementara gini dulu, karena user dihapus maka chat yang memiliki idnya menjadi undefined dan menyebabkan error makanya dihapus juga,
      // TODO: Berikan user soft delete, message immutable dan fallback ui deleted user saja
      if (!rawUser) {
        delete chat.latestMessage;
        return;
      }
      chat.latestMessage.user = this.usersService.toEntity(rawUser);
      delete chat.latestMessage.userId;
      chat.latestMessage.chatId = String(chat._id);
    });
    return chats as Chat[];
  }

  async countChats() {
    return this.chatsRepository.model.countDocuments({});
  }

  async findOne(_id: string): Promise<Chat> {
    const chats = await this.findMany([
      {
        $match: { _id: new Types.ObjectId(_id) },
      },
    ]);
    if (!chats[0]) {
      throw new NotFoundException(`No chat found for id ${_id}`);
    }
    return chats[0];
  }

  async update(_id: string, updateChatInput: UpdateChatInput): Promise<Chat> {
    const { _id: chatId, ...rest } = updateChatInput;
    await this.chatsRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(chatId) },
      { $set: rest },
    );
    return this.findOne(_id);
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }

  chatCreated() {
    return this.pubsub.asyncIterableIterator(CHAT_CREATED);
  }
}
