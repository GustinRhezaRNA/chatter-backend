import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { DatabaseModule } from 'src/common/database/database.module';
import { User } from './entities/user.entity';
import { UserSchema} from './entities/user.document.entity'
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { S3Module } from 'src/common/s3/s3.module';

@Module({
  imports: [
    S3Module,
    DatabaseModule.forFeaturedModels([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersResolver, UsersService, UsersRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
