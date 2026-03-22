import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('AppController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthController],
    }).compile();

    controller = app.get(HealthController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(controller.getHealth().healthy).toBe(true);
    });
  });
});
