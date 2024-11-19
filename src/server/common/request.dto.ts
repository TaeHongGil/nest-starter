import { BOARD_CONFIG, PLATFORM } from '@root/core/define/define';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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
   * 계정 닉네임
   */
  @IsString()
  readonly nickname?: string;

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
  readonly refresh_token: string;
}

export class ReqCreatePost {
  /**
   * 제목
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOARD_CONFIG.POST_MAX_TITLE)
  readonly title: string;

  /**
   * 내용
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOARD_CONFIG.POST_MAX_CONTENT)
  content: string;
}

export class ReqCreateComment {
  /**
   * 내용
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOARD_CONFIG.COMMENT_MAX_CONTENT)
  content: string;

  /**
   * 게시글 id
   */
  @IsNumber()
  @IsNotEmpty()
  postidx: number;

  /**
   * 상위 댓글
   */
  @IsNumber()
  @IsOptional()
  parent_commentidx?: number;
}

export class ReqDeleteComment {
  /**
   * 댓글 id
   */
  @IsNumber()
  commentidx: number;
}

export class ReqDeletePost {
  /**
   * 게시글 id
   */
  @IsNumber()
  postidx: number;
}

export class ReqUpdatePost {
  /**
   * 제목
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * 내용
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOARD_CONFIG.POST_MAX_CONTENT)
  content: string;

  /**
   * 게시글 id
   */
  @IsNumber()
  @IsNotEmpty()
  postidx: number;
}

export class ReqUpdateComment {
  /**
   * 내용
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(BOARD_CONFIG.COMMENT_MAX_CONTENT)
  content: string;

  /**
   * 댓글 id
   */
  @IsNumber()
  @IsNotEmpty()
  commentidx: number;

  /**
   * 게시글 id
   */
  @IsNumber()
  @IsNotEmpty()
  postidx: number;
}
