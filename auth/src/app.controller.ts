import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'signup' })
  async signup(@Payload() data: any) {
    return this.appService.signup(data);
  }

  @MessagePattern({ cmd: 'signin' })
  async signin(@Payload() data: any) {
    return this.appService.signin(data);
  }

  @MessagePattern({ cmd: 'currentuser' })
  async currentUser(@Payload() data: any) {
    const payload = await this.appService.decodeToken(data.token);
    return { currentUser: payload };
  }
}
