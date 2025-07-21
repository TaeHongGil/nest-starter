import { ROLE } from '@root/core/define/define';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class ReqGuestLogin {
  /**
   * 계정 ID
   */
  @IsString()
  device_id: string;
}

export class ReqGoogleLogin {
  /**
   * 플랫폼 token
   */
  @IsString()
  token: string;
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
  /**
   * 1 페이지 내 사용자 수
   */
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit: number;

  /**
   * 현재 페이지
   */
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  page: number;

  /**
   * 필터링 조건 (JSON 문자열)
   * 예: {"role": 100}
   */
  @IsString()
  @IsOptional()
  filter?: string;
}

export class ReqGetSheet {
  /**
   * 스프레드시트 URL
   */
  @IsString()
  url: string;

  /**
   * 내부 시트 이름
   */
  @IsString()
  sheet_name: string;

  /**
   * 데이터 범위 (예: 'A1:C10')
   */
  @IsString()
  range: string;
}

export class ReqAdminUpdateRole {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  useridx: number;

  @IsEnum(ROLE)
  @Transform(({ value }) => parseInt(value, 10))
  role: ROLE;
}

export class ReqUserUpdateRole {
  @IsEnum(ROLE)
  @Transform(({ value }) => parseInt(value, 10))
  role: ROLE;
}
