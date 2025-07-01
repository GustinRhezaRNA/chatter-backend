import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DBMigrationService } from './db-migration.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DBMigrationService],
})
export class DatabaseModule {
  static forFeaturedModels(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }
}
