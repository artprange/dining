import { Test, TestingModule } from '@nestjs/testing';
import { CuisineTypeController } from './cuisine-type.controller';

describe('CuisineTypeController', () => {
  let controller: CuisineTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuisineTypeController],
    }).compile();

    controller = module.get<CuisineTypeController>(CuisineTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
