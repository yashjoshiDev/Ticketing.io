import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { SignupDto } from './dto/auth.dto';
import { SigninDto } from './dto/auth.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @MessagePattern({ cmd: 'signup' })
  async signup(@Payload() data: SignupDto) {
    return this.appService.signup(data);
  }

  @MessagePattern({ cmd: 'signin' })
  async signin(@Payload() data: SigninDto) {
    return this.appService.signin(data);
  }

  @MessagePattern({ cmd: 'currentuser' })
  async currentUser(@Payload() data: any) {
    const payload = await this.appService.decodeToken(data.token);
    return { currentUser: payload };
  }
}
