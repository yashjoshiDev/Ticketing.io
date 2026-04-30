import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.session?.jwt;
    if (!token) throw new UnauthorizedException('Not authenticated');

    const user = await firstValueFrom(
      this.authClient.send({ cmd: 'currentuser' }, { token })
    ).catch(() => null);

    if (!user) throw new UnauthorizedException('Invalid or expired token');
    request.currentUser = user;
    return true;
  }
}
