import { IsNotEmpty, IsString } from 'class-validator';

export class ReqSendMessage {
  @IsString()
  @IsNotEmpty()
  message: string;
}
