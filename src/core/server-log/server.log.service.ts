import { Logger } from '@nestjs/common';

export class ServerLogger extends Logger {}

/**
 * VSCode Console color code
 */
export enum ColorCode {
  NONE = -1,
  RED = 31,
  GREEN = 32,
  YELLOW = 33,
  BLUE = 34,
  MAGENTA = 35,
  CYAN = 36,
  WHITE = 37,
}
