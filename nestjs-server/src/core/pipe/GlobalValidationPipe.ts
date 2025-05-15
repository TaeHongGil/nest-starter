import { BadRequestException } from '@nestjs/common/exceptions';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ValidationError } from 'class-validator';

/**
 * class-validator 으로 타입지정한것을 요청시 변환검사를 하기위해 수행
 */
export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, // validation을 위한 decorator가 붙어있지 않은 속성들은 제거
      forbidNonWhitelisted: true, // whitelist 설정을 켜서 걸러질 속성이 있다면 아예 요청 자체를 막도록 (400 에러)
      transform: true, // 요청에서 넘어온 자료들의 형변환
      enableDebugMessages: true,
      exceptionFactory: callError,
    });

    function callError(validationErrors: ValidationError[] = []): BadRequestException {
      let msg = '';
      for (const error of validationErrors) {
        msg = JSON.stringify(error.constraints);
        break;
      }

      return new BadRequestException(msg);
    }
  }
}
