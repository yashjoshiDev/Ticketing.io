import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from './schemas/user.schema';
import { Password } from './utils/password';
import { SignupDto } from './dto/auth.dto';
import { SigninDto } from './dto/auth.dto';

@Injectable()
export class AppService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async signup(data: SignupDto) {
    const { email, password } = data;
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await Password.toHash(password);
    const user = new this.userModel({ email, password: hashedPassword });
    await user.save();

    const userJwt = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
    );

    return { user, token: userJwt };
  }

  async signin(data: SigninDto) {
    const { email, password } = data;
    const existingUser = await this.userModel.findOne({ email });
    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password,
    );
    if (!passwordsMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userJwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET!,
    );

    return { user: existingUser, token: userJwt };
  }

  async decodeToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return null;
    }
  }
}
