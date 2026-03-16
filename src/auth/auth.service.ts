import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { User } from 'src/users/entities/user.entity';
import { TokenPayload } from './token-payload.interface';
import { getJwt } from './jwt';

export interface WsRequest {
  headers: {
    cookie?: string;
    get?: (name: string) => string | null | undefined;
    [key: string]: unknown;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }

  login(user: User, response: Response) {
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

    return token;
  }

  verifyWs(request: WsRequest, connectionParams?: any): TokenPayload {
    let token: string | null = null;

    const cookieHeader =
      typeof request.headers.get === 'function'
        ? request.headers.get('cookie')
        : request.headers.cookie;

    if (cookieHeader && typeof cookieHeader === 'string') {
      const cookies = cookieHeader.split(';');

      const authCookie = cookies
        .map((c) => c.trim())
        .find((c) => c.startsWith('Authentication='));

      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }

    if (!token) {
      token = getJwt(connectionParams?.token);
    }

    if (!token) {
      throw new Error('Valid authentication token tidak ditemukan');
    }

    return this.jwtService.verify<TokenPayload>(token);
  }

  logout(response: Response) {
    response.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date(),
    });

  }
}
