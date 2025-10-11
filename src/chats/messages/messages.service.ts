import { Inject, Injectable } from '@nestjs/common';
import { ChatsRepository } from '../chats.repository';
import { CreateMessageInput } from './dto/create-message.input';
import { Message } from './entities/message.entity';
import { Types } from 'mongoose';
import { GetMessagesArgs } from './dto/get-messages.args';
import { PUB_SUB } from 'src/common/constants/injection-token';
import { PubSub } from 'graphql-subscriptions';
import { MESSAGE_CREATED } from './constants/pubsub-trigger';
import { ChatsService } from '../chats.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly chatsService: ChatsService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}
  async createMessage({ content, chatId }: CreateMessageInput, userId: string) {
    const message: Message = {
      content,
      userId,
      chatId,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
    };
    await this.chatsRepository.findOneAndUpdate(
      {
        _id: chatId,
        ...this.chatsService.userChatFilter(userId),
      },
      {
        $push: { messages: message },
      },
    );
    await this.pubsub.publish(MESSAGE_CREATED, { messageCreated: message });
    return message;
  }

  // Get messages for a specific chat
  async getMessages({ chatId }: GetMessagesArgs, userId: string) {
    return (
      await this.chatsRepository.findOne({
        _id: chatId,
        ...this.chatsService.userChatFilter(userId),
      })
    ).messages;
  }

  // Get every new message in a specific chat
  async messageCreated({ chatId }: GetMessagesArgs, userId: string) {
    await this.chatsRepository.findOne({
      _id: chatId,
      ...this.chatsService.userChatFilter(userId),
    });
    return this.pubsub.asyncIterableIterator(MESSAGE_CREATED);
  }
}
