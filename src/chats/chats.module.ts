import { forwardRef, Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsResolver } from './chats.resolver';
import { ChatsRepository } from './chats.repository';
import { DatabaseModule } from 'src/common/database/database.module';
import { Chat } from './entities/chat.entity';
import { MessagesModule } from './messages/messages.module';
import { ChatSchema } from './entities/chat.document';
import { ChatsController } from './chats.controller';
import { UsersModule } from 'src/users/users.module';
import { PubSubModule } from 'src/common/pubsub/pubsub.module';

@Module({
  imports: [
    DatabaseModule.forFeaturedModels([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => MessagesModule),
    UsersModule,
    PubSubModule,
  ],
  exports: [ChatsRepository],
  providers: [ChatsResolver, ChatsService, ChatsRepository],
  controllers: [ChatsController],
})
export class ChatsModule {}
