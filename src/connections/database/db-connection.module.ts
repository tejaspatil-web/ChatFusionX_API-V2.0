import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'), // Read MONGO_URI from .env
      }),
      inject: [ConfigService], // Inject ConfigService to access environment variables
    }),
  ],
  providers: [],
})
export class DatabaseModule implements OnModuleInit {
  constructor() {}
  onModuleInit() {
    console.log('MongoDB connection being established...');
  }
}
