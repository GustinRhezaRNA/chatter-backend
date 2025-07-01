import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config, database, up } from 'migrate-mongo';

@Injectable()
export class DBMigrationService implements OnModuleInit {
  private readonly dbMigrationConfig: Partial<config.Config>;

  constructor(private readonly configService: ConfigService) {
    this.dbMigrationConfig = {
      mongodb: {
        databaseName: this.configService.getOrThrow<string>('DB_NAME'),
        url: this.configService.getOrThrow<string>('MONGODB_URI'),
      },
      migrationsDir: `${__dirname}/../../migrations`,
      changelogCollectionName: 'changelog', // Nama collection untuk menyimpan riwayat migrasi
      migrationFileExtension: '.js', // Targetnya .js karena migrate-mongo secara default menjalankan file JavaScript hasil build, bukan TypeScript langsung.
    };
  }

  async onModuleInit() {
    config.set(this.dbMigrationConfig);
    const { db, client } = await database.connect();
    await up(db, client);
  }
}
