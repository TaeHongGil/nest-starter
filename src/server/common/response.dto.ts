import { ROLE } from '@root/core/define/define';

/**
 * 로그인
 */
export class ResLogin {
  /**
   * jwt token 정보
   */
  jwt?: JwtInfo;

  /**
   * 닉네임
   */
  nickname: string;

  /**
   * 권한
   */
  role: ROLE;
}

export class ResTokenRefresh {
  jwt: JwtInfo;
}

/**
 * 토큰정보
 */
export class JwtInfo {
  /**
   * 엑세스 토큰
   */
  access_token: string;
  /**
   * 토큰타입
   */
  token_type: string;
  /**
   * 만료시간(ms)
   */
  expires_in: number;
  /**
   * refresh token
   */
  refresh_token: string;
}

export class ResCreateUser {
  /**
   * 유저 닉네임
   */
  nickname: string;

  /**
   * UUID
   */
  uuid: string;
}

export class ResDuplicatedCheck {
  /**
   * 중복 여부 true: 중복 / false: 중복 X
   */
  result: boolean;
}

export class ResGetAccount {
  nickname: string;
}

export class ResPostDetail {
  /**
   * 게시글 id
   */
  postidx: number;
  /**
   * 업데이트 일자
   */
  updated_at: Date;
  /**
   * 제목
   */
  title: string;
  /**
   * 작성자
   */
  author: string;
  /**
   * 조회수
   */
  views: number;
  /**
   * 내용
   */
  content: string;
  /**
   * 댓글
   */
  comments: PostComment[];
  /**
   * 본인여부
   */
  is_owner: boolean;
}

export interface PostComment {
  /**
   * 댓글 id
   */
  commentidx: number;
  /**
   * 댓글(답글) 깊이
   */
  depth: number;
  /**
   * 작성자
   */
  author?: string;
  /**
   * 내용
   */
  content?: string;
  /**
   * 업데이트 일자
   */
  updated_at: Date;
  /**
   * 삭제 여부
   */
  is_deleted: boolean;
  /**
   * 본인 여부
   */
  is_owner: boolean;
}

export class ResComments {
  /**
   * 댓글
   */
  comments: PostComment[];
  /**
   * 페이지 길이
   */
  max_page: number;
}

export class ResDeletePost {
  /**
   * 성공여부
   */
  success: boolean;
}

export class ResPosts {
  /**
   * 게시글 리스트
   */
  posts: PostInfo[];
  /**
   * 페이지 길이
   */
  max_page: number;
}

export interface PostInfo {
  /**
   * 게시글 id
   */
  postidx: number;
  /**
   * 업데이트 일자
   */
  updated_at: Date;
  /**
   * 제목
   */
  title: string;
  /**
   * 작성자
   */
  author: string;
  /**
   * 조회수
   */
  views: number;
  /**
   * 댓글 갯수
   */
  comment_count: number;
  /**
   * 본인 여부
   */
  is_owner: boolean;
}
