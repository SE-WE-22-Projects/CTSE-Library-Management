import { ConfigService } from '@nestjs/config';

// db config func
export const databaseConfig = async (configService: ConfigService) => ({
    uri: configService.get<string>('MONGO_URI'),
});