import { IsNotEmpty, IsString } from 'class-validator';

export class ReqSendMessage {
  /**
   * 메세지
   */
  @IsString()
  @IsNotEmpty()
  message: string;
}
