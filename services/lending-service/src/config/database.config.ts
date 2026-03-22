import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { name } from '../../package.json';

export const databaseConfig = (): MongooseModuleFactoryOptions => ({
  uri: process.env['MONGO_URI']!,
  dbName: process.env['LENDING_SERVICE_DB_NAME'] ?? name,
});
