import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { of } from 'rxjs';

describe('AppController', () => {
  let appController: AppController;
  let mockAuthClient: any;

  beforeEach(async () => {
    mockAuthClient = {
      send: jest.fn().mockReturnValue(of({ id: '1', email: 'test@test.com' })),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('currentUser', () => {
    it('should call authClient.send with correct arguments', async () => {
      const mockReq = { session: { jwt: 'test-token' } } as any;
      await appController.currentUser(mockReq);

      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'currentuser' },
        { token: 'test-token' },
      );
    });
  });
});
