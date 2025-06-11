import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from '@/modules/store/store.service';

describe('StoreService', () => {
  let storeService: StoreService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [StoreService],
    }).compile();

    storeService = module.get<StoreService>(StoreService);
  });
  afterAll(async () => {
    await module.close();
  });
  it('should be defined', () => {
    expect(storeService).toBeDefined();
  });
});
