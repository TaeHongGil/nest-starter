import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ReqCreateUser {
  /**
   * 계정 ID
   */
  @IsNotEmpty()
  @IsEmail()
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
  @IsEmail()
  readonly email: string;

  /**
   * 계정 Password
   */
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}

export class ReqTokenRefresh {
  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
