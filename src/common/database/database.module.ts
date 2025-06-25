import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  static forFeaturedModels(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }
}
