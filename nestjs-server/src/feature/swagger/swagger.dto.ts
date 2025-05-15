import { OpenAPIObject } from '@nestjs/swagger';
import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface SocketMetadata {
  events: Record<string, OperationObject>;
}

/**
 * Swagger 옵션
 */
export interface SwaggerOptions {
  /**
   * version: api 버전
   * token: 인증토큰 받아올 api 및 body주소
   * header: 추가할 기본 헤더 (Authorization 제외)
   */
  config?: {
    version?: string;
    token?: Record<string, string>;
    header?: Record<string, any>;
  };
}

export type SwaggerDocument = OpenAPIObject & {
  socket?: SocketMetadata;
};
