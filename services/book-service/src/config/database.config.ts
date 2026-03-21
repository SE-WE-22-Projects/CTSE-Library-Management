import { ConfigService } from '@nestjs/config';

export const databaseConfig = async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGO_URI'),
});