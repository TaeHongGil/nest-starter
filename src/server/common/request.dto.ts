import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReqCreateUser {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

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
