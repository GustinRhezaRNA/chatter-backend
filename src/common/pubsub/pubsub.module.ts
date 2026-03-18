import { Global, Module } from '@nestjs/common';
import { PUB_SUB } from '../constants/injection-token';
import { PubSub } from 'graphql-subscriptions';
import { ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { reviver } from './reviver';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: (configService: ConfigService) => {
        if (configService.get('NODE_ENV') === 'production') {
          const option = {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          }

          return new RedisPubSub({
            publisher: new Redis(option),
            subscriber: new Redis(option),
            reviver: reviver
          });
        }
        return new PubSub();
      },
      inject: [ConfigService],
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule { }
