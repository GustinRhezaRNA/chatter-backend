import { forwardRef, Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { ChatsRepository } from './chats.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { Chat, ChatSchema } from './entities/chat.entity';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [
    DatabaseModule.forFeaturedModels([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => MessagesModule),
  ],
  exports: [ChatsRepository],
  providers: [ChatsResolver, ChatsService, ChatsRepository],
})
export class ChatsModule {}
