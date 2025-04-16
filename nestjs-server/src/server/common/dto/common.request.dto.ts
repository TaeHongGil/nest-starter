import { PLATFORM } from '@root/core/define/define';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class ReqCreateGuest {
  /**
   * 계정 ID
   */
  @IsNotEmpty()
  readonly device_id: string;
}

export class ReqGuestLogin {
  /**
   * 계정 ID
   */
  @IsNotEmpty()
  readonly uuid: string;
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
  readonly refresh_token: string;
}

export class ReqCheckNickname {
  /**
   * 닉네임
   */
  @IsString()
  @Length(2, 20)
  nickname: string;
}
