import { IsNotEmpty, IsString } from 'class-validator';

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
