import { Type } from '@nestjs/common';

/**
 * Swagger 옵션
 */
export interface SwaggerOptions {
  /**
   * API 생성할 모듈
   */
  includeModules: Type[];

  /**
   * token: 인증토큰 받아올 api 및 body주소
   * header: 추가할 기본 헤더 (Authorization 제외)
   */
  config?: {
    token?: { api: string[]; body: string };
    header?: Record<string, any>;
  };
}
