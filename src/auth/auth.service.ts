import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: User, response: Response) {
    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() +
        this.configService.getOrThrow<number>('JWT_EXPIRATION'),
    );

    const tokenPayload: TokenPayload = {
      ...user,
      _id: user._id!.toHexString(),
    };

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires: expires,
      sameSite: 'lax', //  WAJIB untuk dev lokal
      secure: false, // false untuk lokal (http), true untuk production (https)
    });
  }

  verifyWs(request: any): TokenPayload {
    // Coba ambil cookie dari headers (support fetch Headers dan Express)
    const cookieHeader =
      typeof request.headers.get === 'function'
        ? request.headers.get('cookie') // fetch-style Headers
        : request.headers.cookie; // Express-style headers

    if (!cookieHeader) {
      throw new Error('Tidak ada cookie pada request');
    }

    // Pisah dan cari cookie Authentication
    const cookies = cookieHeader.split('; ');
    const authCookie = cookies.find((c) => c.startsWith('Authentication='));

    if (!authCookie) {
      throw new Error('Cookie Authentication tidak ditemukan');
    }

    const jwt = authCookie.split('Authentication=')[1];
    return this.jwtService.verify(jwt);
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });
  }
}
