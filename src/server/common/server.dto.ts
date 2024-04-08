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

export class ReqUseridx {
  @IsNumber()
  @IsNotEmpty()
  readonly useridx: number;
}
