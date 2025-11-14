import { forwardRef, Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { ChatsRepository } from './chats.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { Chat } from './entities/chat.entity';
import { MessagesModule } from './messages/messages.module';
import { ChatSchema } from './entities/chat.document';

@Module({
  imports: [
    DatabaseModule.forFeaturedModels([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => MessagesModule),
  ],
  exports: [ChatsRepository],
  providers: [ChatsResolver, ChatsService, ChatsRepository],
})
export class ChatsModule {}
