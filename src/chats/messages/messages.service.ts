import { Inject, Injectable } from '@nestjs/common';
import { ChatsRepository } from '../chats.repository';
import { CreateMessageInput } from './dto/create-message.input';
import { Types } from 'mongoose';
import { GetMessagesArgs } from './dto/get-messages.args';
import { PUB_SUB } from 'src/common/constants/injection-token';
import { PubSub } from 'graphql-subscriptions';
import { MESSAGE_CREATED } from './constants/pubsub-trigger';
import { MessageDocument } from './entities/message.document';
import { Message } from './entities/message.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly userService: UsersService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) { }
  async createMessage({ content, chatId }: CreateMessageInput, userId: string) {
    const messageDocument: MessageDocument = {
      content,
      userId: new Types.ObjectId(userId),
      _id: new Types.ObjectId(),
      createdAt: new Date(),
    };
    await this.chatsRepository.findOneAndUpdate(
      {
        _id: chatId,
      },
      {
        $push: { messages: messageDocument },
      },
    );
    const message: Message = {
      ...messageDocument,
      chatId,
      user: await this.userService.findOne(userId),
    };
    await this.pubsub.publish(MESSAGE_CREATED, { messageCreated: message });
    return message;
  }

  // Get messages for a specific chat
  async getMessages({ chatId, skip, limit }: GetMessagesArgs) {
    const messages = await this.chatsRepository.model.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(chatId),
        },
      },
      { $unwind: '$messages' },
      {
        $replaceRoot: {
          newRoot: '$messages',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $unset: 'userId' },
      { $set: { chatId } },
    ]);
    return messages
      .filter((message) => message.user)
      .map((message) => ({
        ...message,
        user: this.userService.toEntity(message.user),
      }));
  }

  // Get every new message in a specific chat
  async messageCreated() {
    return this.pubsub.asyncIterableIterator(MESSAGE_CREATED);
  }

  async countMessages(chatId: string) {
    const result = await this.chatsRepository.model.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(chatId),
        },
      },
      {
        $unwind: '$messages',
      },
      {
        $count: 'messages',
      },
    ]);
    return result[0] ?? { messages: 0 };
  }
}
