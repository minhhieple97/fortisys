import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public writeClient: PrismaClient;

  public readClients: PrismaClient[];

  private currentReplicaIndex = 0;

  constructor(private configService: ConfigService) {
    const primaryUrl = this.configService.get<string>('DATABASE_URL_PRIMARY');

    const replicaUrls = [
      this.configService.get<string>('DATABASE_URL_REPLICA_1'),
      this.configService.get<string>('DATABASE_URL_REPLICA_2'),
    ];

    if (!primaryUrl || replicaUrls.some((url) => !url)) {
      throw new Error(
        'Database URLs are not defined in the environment variables.',
      );
    }

    this.writeClient = new PrismaClient({
      datasources: {
        db: {
          url: primaryUrl,
        },
      },
    });

    this.readClients = replicaUrls.map(
      (url) =>
        new PrismaClient({
          datasources: {
            db: {
              url,
            },
          },
        }),
    );
  }

  async onModuleInit() {
    await this.writeClient.$connect();
    await Promise.all(this.readClients.map((client) => client.$connect()));
    console.log('✅ Successfully connected to Primary and Replica databases.');
  }

  async onModuleDestroy() {
    await this.writeClient.$disconnect();
    await Promise.all(this.readClients.map((client) => client.$disconnect()));
  }

  get write(): PrismaClient {
    return this.writeClient;
  }

  get read(): PrismaClient {
    const replicaClient = this.readClients[this.currentReplicaIndex];
    this.currentReplicaIndex =
      (this.currentReplicaIndex + 1) % this.readClients.length;
    return replicaClient;
  }
}
