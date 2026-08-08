import { Test, TestingModule } from '@nestjs/testing';
import { CuisineTypeService } from './cuisine-type.service';

describe('CuisineTypeService', () => {
  let service: CuisineTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuisineTypeService],
    }).compile();

    service = module.get<CuisineTypeService>(CuisineTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
