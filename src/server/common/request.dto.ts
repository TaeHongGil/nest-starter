import { PLATFORM } from '@root/core/define/define';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ReqCreateUser {
  /**
   * 계정 ID
   */
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  /**
   * 계정 email
   */
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  /**
   * 계정 Password
   */
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class ReqLogin {
  /**
   * 계정 ID
   */
  @IsNotEmpty()
  readonly id: string;

  /**
   * 계정 Password
   */
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class ReqPlatformLogin {
  /**
   * 플랫폼 token
   */
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  /**
   * 플랫폼
   */
  @IsEnum(PLATFORM)
  readonly platform: PLATFORM;
}

export class ReqTokenRefresh {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}
