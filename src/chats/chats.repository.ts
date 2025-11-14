import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../common/database/abstract.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ChatDocument } from './entities/chat.document';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatsRepository extends AbstractRepository<ChatDocument> {
  protected readonly logger = new Logger(ChatsRepository.name);

  constructor(@InjectModel(Chat.name) chatModel: Model<ChatDocument>) {
    super(chatModel);
  }
}
