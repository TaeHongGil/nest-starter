import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReqCreateUser {
  /**
   * 계정 ID
   */
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  /**
   * 계정 Password
   */
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  /**
   * 닉네임
   */
  @IsString()
  @IsNotEmpty()
  readonly nickname: string;
}

export class ReqLogin {
  @IsNumber()
  @IsNotEmpty()
  readonly useridx: number;
}

export class ReqTokenRefresh {
  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
