import { ROLE } from '@root/core/define/define';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class ReqGuestLogin {
  /**
   * 계정 ID
   */
  @IsNotEmpty()
  readonly device_id: string;
}

export class ReqGoogleLogin {
  /**
   * 플랫폼 token
   */
  @IsNotEmpty()
  @IsString()
  readonly token: string;
}

export class ReqCheckNickname {
  /**
   * 닉네임
   */
  @IsString()
  @Length(2, 20)
  nickname: string;
}

export class ReqGetUsers {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  page: number;

  @IsString()
  @IsOptional()
  filter?: string;
}

export class ReqUpdateUserRole {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  useridx: number;

  @IsEnum(ROLE)
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  role: ROLE;
}
